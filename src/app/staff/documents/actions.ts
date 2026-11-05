"use server";
import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { documentFields, type DocumentDraft, type DocumentTemplate } from "@/lib/commercial-documents";
import { requireViewer } from "@/server/session";
import { cancelCommercialDocument, createCommercialDocument, DocumentProblem, issueCommercialDocument, returnCommercialDocument, reviseCommercialDocument, saveCommercialDocument, saveDocumentSettings, submitCommercialDocument, templateKeys } from "@/server/commercial-documents";

export type DocumentState={status:"idle"|"done"|"error";message?:string;values?:DocumentDraft;templateValues?:DocumentTemplate;version?:number};
const read=(form:FormData,key:string)=>String(form.get(key)??"");
function version(form:FormData) {
  const value=Number(read(form,"version"));
  if(!Number.isSafeInteger(value)||value<0)throw new DocumentProblem("Reload this document before changing it.");
  return value;
}
function fail(error:unknown):DocumentState {
  unstable_rethrow(error);
  return {status:"error",message:error instanceof DocumentProblem?error.message:"The document could not be saved. Please try again."};
}
function refresh(id:string) {
  revalidatePath("/staff/documents");
  revalidatePath("/staff/documents/"+id);
  revalidatePath("/staff/documents/"+id+"/preview");
  revalidatePath("/account/documents/"+id);
  revalidatePath("/staff/jobs/[reference]","page");
  revalidatePath("/account/jobs/[reference]","page");
}
export async function createDoc(_state:DocumentState,form:FormData):Promise<DocumentState> {
  const viewer=await requireViewer(["owner","staff"],"/staff/documents");
  let id:string;
  try {id=await createCommercialDocument(viewer,read(form,"job"),read(form,"kind"),read(form,"key"));}
  catch(error){return fail(error);}
  refresh(id);redirect("/staff/documents/"+id);
}
export async function saveDoc(_state:DocumentState,form:FormData):Promise<DocumentState> {
  const viewer=await requireViewer(["owner","staff"],"/staff/documents");
  let values:DocumentDraft|undefined;
  try {
    const fields=Object.fromEntries(Object.keys(documentFields).map(key=>[key,read(form,key).trim()]));
    const columns=Object.fromEntries(["description","quantity","unit","unitPrice","discount"].map(key=>[key,form.getAll("line."+key).map(value=>String(value).trim())]));
    if(columns.description.length>40)throw new DocumentProblem("Enter up to forty lines.");
    const lines=columns.description.map((description,index)=>({description,quantity:columns.quantity[index]??"",unit:columns.unit[index]??"",
      unitPrice:columns.unitPrice[index]??"",discount:columns.discount[index]??""}));
    values={...fields,lines} as DocumentDraft;
    const id=read(form,"id"),expected=version(form);
    await saveCommercialDocument(viewer,id,expected,values);
    refresh(id);
    return {status:"done",message:"Document draft saved.",version:expected+1};
  } catch(error){return {...fail(error),values};}
}
export async function issueDoc(_state:DocumentState,form:FormData):Promise<DocumentState> {
  const viewer=await requireViewer(["owner"],"/staff/documents");
  try {
    const id=read(form,"id");
    if(form.get("checked")!=="yes")throw new DocumentProblem("Confirm that you reviewed the saved document.");
    await issueCommercialDocument(viewer,id,version(form),read(form,"reason"));
    refresh(id);redirect("/staff/documents/"+id+"?notice=issued");
  } catch(error){return fail(error);}
}
export async function submitDoc(_state:DocumentState,form:FormData):Promise<DocumentState> {
  const viewer=await requireViewer(["owner","staff"],"/staff/documents");
  try {
    const id=read(form,"id");
    await submitCommercialDocument(viewer,id,version(form));
    refresh(id);redirect("/staff/documents/"+id+"?notice=submitted");
  } catch(error){return fail(error);}
}
export async function returnDoc(_state:DocumentState,form:FormData):Promise<DocumentState> {
  const viewer=await requireViewer(["owner"],"/staff/documents");
  try {
    const id=read(form,"id");
    await returnCommercialDocument(viewer,id,version(form),read(form,"reason"));
    refresh(id);redirect("/staff/documents/"+id+"?notice=returned");
  } catch(error){return fail(error);}
}
export async function reviseDoc(_state:DocumentState,form:FormData):Promise<DocumentState> {
  const viewer=await requireViewer(["owner","staff"],"/staff/documents");
  try {
    const id=await reviseCommercialDocument(viewer,read(form,"id"));
    refresh(id);redirect("/staff/documents/"+id);
  } catch(error){return fail(error);}
}
export async function cancelDoc(_state:DocumentState,form:FormData):Promise<DocumentState> {
  const viewer=await requireViewer(["owner"],"/staff/documents");
  try {
    const id=read(form,"id");
    await cancelCommercialDocument(viewer,id,version(form),read(form,"reason"));
    refresh(id);redirect("/staff/documents/"+id+"?notice=cancelled");
  } catch(error){return fail(error);}
}
export async function saveTemplate(_state:DocumentState,form:FormData):Promise<DocumentState> {
  const viewer=await requireViewer(["owner"],"/staff/documents/settings");
  const data=Object.fromEntries(templateKeys.map(key=>[key,read(form,key).trim()])) as DocumentTemplate;
  try {
    const expected=version(form);
    await saveDocumentSettings(viewer,expected,data,form.get("checked")==="yes");
    revalidatePath("/staff/documents/settings");
    return {status:"done",message:"Document settings saved.",version:expected+1};
  } catch(error){return {...fail(error),templateValues:data};}
}
