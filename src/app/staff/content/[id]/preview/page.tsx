import { PublicationPreview } from "@/components/publication-preview";
import { workPhotos } from "@/content/site";
import { readPublication } from "@/server/publishing";
import { requireViewer } from "@/server/session";
export const metadata={title:"Private content preview | Mias",robots:{index:false,follow:false}};
export default async function Preview({params}:{params:Promise<{id:string}>}) {
  const {id}=await params,viewer=await requireViewer(["staff","owner"],"/staff/content/"+id+"/preview");
  const {entry,images}=await readPublication(viewer,id);
  const photos=entry.draft.photoIds.map(key=>({src:"/staff/content/images/"+key,alt:images.find(image=>image.id===key)?.alt??""}));
  const existing=workPhotos.find(photo=>photo.src===entry.draft.existingPhoto);
  if (existing) photos.unshift({src:existing.src,alt:existing.caption});
  return <main id="main-content" className="site-container workspace" tabIndex={-1}>
    <p className="notice">Private preview of saved draft version {entry.version}. Unsaved edits are not included.</p>
    <a href={"/staff/content/"+id}>← Edit draft</a><PublicationPreview draft={entry.draft} kind={entry.kind} sample={entry.sample} photos={photos}/>
  </main>;
}
