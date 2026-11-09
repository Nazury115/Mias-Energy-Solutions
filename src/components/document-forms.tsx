"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { cancelDoc, createDoc, issueDoc, refreshTemplatePreview, returnDoc, reviseDoc, saveDoc, saveTemplate, submitDoc, type DocumentState } from "@/app/staff/documents/actions";
import { calculateDocument, documentFields, templateLimits, type DocumentDraft, type DocumentTemplate } from "@/lib/commercial-documents";

const idle:DocumentState={status:"idle"};
function Feedback({state}:{state:DocumentState}) {
  const feedback=useRef<HTMLParagraphElement>(null);
  useEffect(()=>{if(state.status==="error")feedback.current?.focus();},[state]);
  return state.status==="idle"?null:<p ref={feedback} tabIndex={state.status==="error"?-1:undefined} role={state.status==="error"?"alert":"status"} className={state.status==="error"?"form-alert":"form-success"}>{state.message}</p>;
}
export function CreateDocumentForm({job,keyValue,jobs=[]}:{job?:string;keyValue:string;jobs?:{reference:string}[]}) {
  const [state,submit,pending]=useActionState(createDoc,idle);
  return <form action={submit} className="account-form">
    <input type="hidden" name="key" value={keyValue}/>
    {job?<input type="hidden" name="job" value={job}/>:<><label htmlFor="doc-job">Job</label><select id="doc-job" name="job" required>{jobs.map(row=><option key={row.reference}>{row.reference}</option>)}</select></>}
    <label htmlFor="doc-kind">Document type</label><select id="doc-kind" name="kind"><option value="quotation">Quotation</option><option value="invoice">Invoice</option></select>
    <Feedback state={state}/><button className="button button-small" disabled={pending}>Create document draft</button>
  </form>;
}
export function DocumentEditor({id,draft,version}:{id:string;draft:DocumentDraft;version:number}) {
  const [state,submit,pending]=useActionState(saveDoc,idle);
  const [lines,setLines]=useState(state.values?.lines??draft.lines);
  const [overall,setOverall]=useState(state.values?.overallDiscount??draft.overallDiscount);
  const [base,setBase]=useState(version);
  const [ready,setReady]=useState(false);
  const form=useRef<HTMLFormElement>(null);
  const dirty=useRef(false);
  useEffect(()=>{
    if(form.current) {
      const existing=new FormData(form.current);
      const descriptions=existing.getAll("line.description").map(String);
      const values=(field:string)=>existing.getAll("line."+field).map(String);
      const quantities=values("quantity"),units=values("unit"),prices=values("unitPrice"),discounts=values("discount");
      setLines(descriptions.map((description,index)=>({description,quantity:quantities[index],unit:units[index],unitPrice:prices[index],discount:discounts[index]})));
      setOverall(String(existing.get("overallDiscount")??draft.overallDiscount));
    }
    setReady(true);
  },[draft.overallDiscount]);
  useEffect(()=>{if(!dirty.current)setBase(version);},[version]);
  useEffect(()=>{if(state.status==="done"&&state.version){dirty.current=false;setBase(state.version);}},[state]);
  const result=calculateDocument(lines,overall);
  const values=state.values??draft;
  return <form ref={form} action={submit} className="account-card account-form" data-document-editor onInput={()=>{dirty.current=true;}}>
    <input type="hidden" name="id" value={id}/><input type="hidden" name="version" value={base}/>
    <h2>Document draft</h2>
    {Object.entries({customer:"Customer / company",attention:"Attention",customerId:"Customer reference",address:"Billing address",contact:"Customer contact",terms:"Payment terms",deadline:"Expiry / due date",notes:"Notes"}).map(([field,label])=>
      <div className="document-field" key={field}><label htmlFor={"doc-"+field}>{label}</label>{field==="deadline"?
        <input type="date" id={"doc-"+field} name={field} defaultValue={values.deadline}/>:
        <textarea id={"doc-"+field} name={field} defaultValue={values[field as keyof Omit<DocumentDraft,"lines">]} rows={["address","notes","terms"].includes(field)?3:1} maxLength={documentFields[field as keyof typeof documentFields]}/>}</div>)}
    <p className="field-hint">Use decimal points. Quantity supports 3 decimal places; money supports 2. Line discounts are ZMW amounts.</p>
    <div className="table-scroll"><table className="data-table document-lines"><thead><tr><th>Description</th><th>Quantity</th><th>Unit</th><th>Unit price ZMW</th><th>Line discount ZMW</th><th/></tr></thead>
      <tbody>{lines.map((line,index)=><tr key={index}>{(["description","quantity","unit","unitPrice","discount"] as const).map(field=><td key={field}>
        <input name={"line."+field} aria-label={`${({description:"Description",quantity:"Quantity",unit:"Unit",unitPrice:"Unit price",discount:"Line discount"})[field]} line ${index+1}`} value={line[field]} maxLength={field==="description"?500:field==="unit"?30:16} onChange={event=>{
          dirty.current=true;setLines(current=>current.map((row,n)=>n===index?{...row,[field]:event.target.value}:row));
        }}/></td>)}<td>{ready&&<button type="button" onClick={()=>{dirty.current=true;setLines(current=>current.filter((_,n)=>n!==index));}}>Remove line {index+1}</button>}</td></tr>)}</tbody>
    </table></div>
    {ready&&<button type="button" className="button button-light button-small" disabled={lines.length>=40} onClick={()=>{dirty.current=true;setLines(current=>[...current,{description:"",quantity:"1",unit:"",unitPrice:"0",discount:"0"}]);}}>Add line</button>}
    <label htmlFor="doc-overall">Overall discount (%)</label><input id="doc-overall" name="overallDiscount" value={overall} onChange={event=>setOverall(event.target.value)}/>
    {"error" in result?<p className="field-hint">{result.error}</p>:<p>Subtotal ZMW {result.subtotal} · Overall discount ZMW {result.discount} · <strong>Total ZMW {result.total}</strong></p>}
    <Feedback state={state}/><button className="button button-small" disabled={pending}>Save document draft</button>
  </form>;
}
export function DocumentOperation({id,version,operation}:{id:string;version:number;operation:"issue"|"cancel"|"revise"|"submit"|"return"|"refresh"}) {
  const action={issue:issueDoc,cancel:cancelDoc,revise:reviseDoc,submit:submitDoc,return:returnDoc,refresh:refreshTemplatePreview}[operation];
  const reasons={issue:"Issue reason",cancel:"Cancellation reason",return:"Return reason"};
  const headings={issue:"Approve submitted draft",cancel:"Cancel document",revise:"Prepare a revision",submit:"Ready for Owner review?",return:"Return for changes",refresh:"Apply reviewed business details"};
  const labels={issue:"Approve and issue",cancel:"Cancel document",revise:"Create revision draft",submit:"Submit for review",return:"Deny draft",refresh:"Refresh preview with reviewed settings"};
  const [state,submit,pending]=useActionState(action,idle);
  return <form action={submit} className="account-card account-form">
    <input type="hidden" name="id" value={id}/><input type="hidden" name="version" value={version}/>
    <h2>{headings[operation]}</h2>
    {operation==="submit"&&<p>Save your changes first. Submit the saved draft so an Owner can preview and approve it.</p>}
    {operation==="return"&&<p>The draft will return to Staff for editing and resubmission.</p>}
    {operation in reasons&&<><label htmlFor={operation+"-reason"}>{reasons[operation as keyof typeof reasons]}</label><textarea id={operation+"-reason"} name="reason" maxLength={500} required rows={2}/></>}
    {operation==="issue"&&<label className="publishing-check"><input type="checkbox" name="checked" value="yes" required/> I reviewed the saved draft and its PDF preview</label>}
    <Feedback state={state}/><button className={"button button-small"+(operation==="return"?" button-light":"")} disabled={pending}>{labels[operation]}</button>
  </form>;
}
export function DocumentSettingsForm({data,version}:{data:DocumentTemplate;version:number}) {
  const [state,submit,pending]=useActionState(saveTemplate,idle);
  return <form action={submit} className="account-card account-form">
    <input type="hidden" name="version" value={state.version??version}/>
    {Object.entries({name:"Business name",address:"Business address",phone:"Business phone",email:"Business email",bankDetails:"Bank instructions",preparedBy:"Prepared by",taxNote:"Tax treatment note"}).map(([key,label])=>
      <div className="document-field" key={key}><label htmlFor={"template-"+key}>{label}</label><textarea id={"template-"+key} name={key} defaultValue={(state.templateValues??data)[key as keyof DocumentTemplate]} maxLength={templateLimits[key as keyof DocumentTemplate]} rows={key==="bankDetails"?5:2}/></div>)}
    <label className="publishing-check"><input type="checkbox" name="checked" value="yes" required/> I checked the business and bank details for document use</label>
    <Feedback state={state}/><button className="button button-small" disabled={pending}>Save document settings</button>
  </form>;
}
