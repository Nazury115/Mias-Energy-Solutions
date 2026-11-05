"use server";
import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { parseVersion } from "@/lib/jobs";
import type { PublicationDraft } from "@/lib/publishing";
import { requireViewer } from "@/server/session";
import { createPublication, draftFromForm, PublishingProblem, publishPublication, savePublication, uploadPublicationImage } from "@/server/publishing";

export type ContentState = {status:"idle"|"done"|"error";message?:string;values?:PublicationDraft;version?:number};
const value=(form:FormData,key:string)=>String(form.get(key)??"");
const version=(form:FormData)=>{
  const number=parseVersion(value(form,"version"));
  if (number===null) throw new PublishingProblem("Reload this draft before making a change.");
  return number;
};
function failed(error:unknown):ContentState {
  unstable_rethrow(error);
  return {status:"error",message:error instanceof PublishingProblem ? error.message : "The change could not be saved. Try again."};
}
function refresh(id:string) {
  revalidatePath("/staff/content");
  revalidatePath("/staff/content/"+id);
  revalidatePath("/staff/content/"+id+"/preview");
  revalidatePath("/projects");
  revalidatePath("/projects/[slug]","page");
  revalidatePath("/sitemap.xml");
}
export async function createDraft(_state:ContentState,form:FormData):Promise<ContentState> {
  const viewer=await requireViewer(["staff","owner"],"/staff/content");
  let id:string;
  try { id=await createPublication(viewer,value(form,"kind"),value(form,"title"),form.get("sample")==="yes"); }
  catch(error){return failed(error);}
  revalidatePath("/staff/content");
  redirect("/staff/content/"+id);
}
export async function saveDraft(_state:ContentState,form:FormData):Promise<ContentState> {
  const viewer=await requireViewer(["staff","owner"],"/staff/content");
  const values=draftFromForm(form);
  try {
    const id=value(form,"id"),expected=version(form);
    await savePublication(viewer,id,expected,values);
    refresh(id);
    return {status:"done",message:"Draft saved.",version:expected+1};
  } catch(error){return {...failed(error),values};}
}
export async function publishDraft(_state:ContentState,form:FormData):Promise<ContentState> {
  const viewer=await requireViewer(["owner"],"/staff/content");
  try {
    const id=value(form,"id"),unpublish=value(form,"operation")==="unpublish";
    await publishPublication(viewer,id,version(form),value(form,"reason"),form.get("checked")==="yes",unpublish);
    refresh(id);
    if (unpublish) redirect("/staff/content/"+id+"?notice=unpublished");
    return {status:"done",message:"Publication updated."};
  } catch(error){return failed(error);}
}
export async function uploadPhoto(_state:ContentState,form:FormData):Promise<ContentState> {
  const viewer=await requireViewer(["staff","owner"],"/staff/content");
  try {
    const id=value(form,"id"),file=form.get("file");
    if (!(file instanceof File)) throw new PublishingProblem("Choose a photo.");
    await uploadPublicationImage(viewer,id,file,value(form,"alt"),value(form,"source"),value(form,"permission"));
    refresh(id);
    return {status:"done",message:"Photo registered. Select it in the draft and save."};
  } catch(error){return failed(error);}
}
