"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { createDraft, manageProject, moveContent, publishDraft, saveDraft, uploadPhoto, type ContentState } from "@/app/staff/content/actions";
import { publicationLimits, type PublicationDraft } from "@/lib/publishing";
import { provinces } from "@/lib/coverage";

const idle:ContentState={status:"idle"};
function Feedback({state}:{state:ContentState}) {
  const ref=useRef<HTMLParagraphElement>(null);
  useEffect(()=>{if(state.status==="error")ref.current?.focus();},[state]);
  return state.status==="idle" ? null : <p ref={ref} tabIndex={-1} role={state.status==="error"?"alert":"status"} className={state.status==="error"?"form-alert":"form-success"}>{state.message}</p>;
}
export function RepositoryProjectForm({slug,remove=false}:{slug:string;remove?:boolean}) {
  const [state,submit,pending]=useActionState(manageProject,idle);
  return <form action={submit}><input type="hidden" name="slug" value={slug}/><input type="hidden" name="intent" value={remove?"delete":"edit"}/>
    <Feedback state={state}/><button className="button button-small" disabled={pending}>{remove?"Delete project":"Edit project"}</button></form>;
}
export function TrashContentForm({id,version,kind,restore=false}:{id:string;version:number;kind:string;restore?:boolean}) {
  const [state,submit,pending]=useActionState(moveContent,idle);
  return <form action={submit} className="account-form account-card" id={restore?undefined:"delete-content"}>
    {!restore&&<><h2>Delete {kind}</h2><p>The public version will be removed. The saved draft and its photos stay in Trash so an Owner can restore them.</p></>}
    <input type="hidden" name="id" value={id}/><input type="hidden" name="version" value={version}/><input type="hidden" name="operation" value={restore?"restore":"trash"}/>
    {!restore&&<><label htmlFor="delete-reason">Delete reason</label><textarea id="delete-reason" name="reason" maxLength={500} required rows={2}/>
      <label className="publishing-check"><input name="checked" type="checkbox" value="yes" required/> I understand this removes the public version and moves the record to Trash</label></>}
    <Feedback state={state}/><button className="button button-small" disabled={pending}>{restore?"Restore as draft":`Delete ${kind}`}</button>
  </form>;
}
export function CreateContentForm() {
  const [state,submit,pending]=useActionState(createDraft,idle);
  return <form action={submit} className="account-card account-form">
    <h2>Create content</h2><label htmlFor="create-kind">Content type</label><select name="kind" id="create-kind"><option value="project">Project story</option><option value="testimonial">Testimonial</option></select>
    <label htmlFor="create-title">Title</label><input name="title" id="create-title" maxLength={140} required/>
    <label className="publishing-check"><input type="checkbox" name="sample" value="yes" defaultChecked/> Fictional test content</label>
    <p className="field-hint">Test content stays labelled for its lifetime and is hidden at public launch. Clear this only when creating a real record for review.</p>
    <Feedback state={state}/><button className="button button-small" disabled={pending}>Create draft</button>
  </form>;
}

type ImageChoice={id:string;alt:string};
export function ContentEditor({id,version,draft,kind,images,workPhotos}:{id:string;version:number;draft:PublicationDraft;kind:string;images:ImageChoice[];workPhotos:{src:string;caption:string}[]}) {
  const [state,submit,pending]=useActionState(saveDraft,idle);
  const [baseVersion,setBaseVersion]=useState(version);
  const dirty=useRef(false);
  useEffect(()=>{if(!dirty.current)setBaseVersion(version);},[version]);
  useEffect(()=>{if(state.status==="done"&&state.version){dirty.current=false;setBaseVersion(state.version);}},[state]);
  const fields=kind==="project" ? [["title","Title"],["summary","Summary"],["area","Area (optional)"],["year","Year (optional)"],
    ["problem","Challenge"],["approach","Work carried out"],["outcome","Outcome"],["permission","Publication permission evidence"]] :
    [["title","Title"],["quote","Customer quotation"],["attribution","Approved attribution"],["permission","Publication permission evidence"]];
  const values=state.values ?? draft;
  return <form action={submit} className="account-card account-form" data-content-editor onInput={()=>{dirty.current=true;}}>
    <h2>Edit draft</h2><input type="hidden" name="id" value={id}/><input type="hidden" name="version" value={baseVersion}/>
    <p className="field-hint">Save before previewing or publishing. Permission evidence is kept in the staff workspace.</p>
    {fields.map(([field,label])=><div key={field}><label htmlFor={"content-"+field}>{label}</label><textarea id={"content-"+field} name={field} rows={["title","area","year","attribution"].includes(field)?1:3}
      maxLength={publicationLimits[field as keyof typeof publicationLimits]} defaultValue={values[field as keyof typeof publicationLimits]}/></div>)}
    {kind==="project" && <>
      <label htmlFor="content-family">Service family</label><select id="content-family" name="family" defaultValue={values.family}><option value="water">Water</option><option value="electrical">Electrical</option><option value="renewable-energy">Renewable energy</option></select>
      <label htmlFor="content-province">Province</label><select id="content-province" name="province" defaultValue={values.province}>{provinces.map(province=><option key={province}>{province}</option>)}</select>
      <label htmlFor="content-existing">Existing work photo</label><select id="content-existing" name="existingPhoto" defaultValue={values.existingPhoto}><option value="">None</option>{workPhotos.map(photo=><option key={photo.src} value={photo.src}>{photo.caption}</option>)}</select>
      {images.length>0 && <fieldset><legend>Uploaded photos for this story</legend>{images.map(image=><label className="publishing-check" key={image.id}><input type="checkbox" name="photoIds" value={image.id} defaultChecked={values.photoIds.includes(image.id)}/> {image.alt}</label>)}</fieldset>}
    </>}
    <Feedback state={state}/><button className="button button-small" disabled={pending}>Save draft</button>
  </form>;
}
export function PublishContentForm({id,version,unpublish=false}:{id:string;version:number;unpublish?:boolean}) {
  const [state,submit,pending]=useActionState(publishDraft,idle);
  const label=unpublish ? "Unpublish reason" : "Approval reason";
  return <form action={submit} className="account-form account-card">
    <h2>{unpublish?"Unpublish content":"Owner approval"}</h2>
    <input type="hidden" name="id" value={id}/><input type="hidden" name="version" value={version}/><input type="hidden" name="operation" value={unpublish?"unpublish":"publish"}/>
    <label htmlFor={unpublish?"unpublish-reason":"approval-reason"}>{label}</label><textarea id={unpublish?"unpublish-reason":"approval-reason"} name="reason" maxLength={500} required rows={2}/>
    {!unpublish && <><p className="field-hint">Open the saved draft preview and check its exact wording and images before approving.</p><label className="publishing-check"><input type="checkbox" name="checked" value="yes" required/> I checked the facts and publication permissions</label></>}
    <Feedback state={state}/><button className="button button-small" disabled={pending}>{unpublish?"Unpublish":"Publish saved draft"}</button>
  </form>;
}
export function UploadContentPhoto({id}:{id:string}) {
  const [state,submit,pending]=useActionState(uploadPhoto,idle);
  return <form action={submit} className="account-form account-card">
    <h2>Add a photo</h2><input type="hidden" name="id" value={id}/>
    <p>JPEG or PNG up to 5 MiB. Up to eight uploaded photos per draft.</p>
    <label htmlFor="content-file">Photo</label><input id="content-file" type="file" name="file" accept=".jpg,.jpeg,.png" required/>
    <label htmlFor="photo-alt">Photo description</label><input id="photo-alt" name="alt" maxLength={250} required/>
    <label htmlFor="photo-source">Photo source</label><input id="photo-source" name="source" maxLength={500} required/>
    <label htmlFor="photo-permission">Photo permission evidence</label><textarea id="photo-permission" name="permission" maxLength={1000} rows={2}/>
    <Feedback state={state}/><button className="button button-small" disabled={pending}>Register photo</button>
  </form>;
}
