import { WorkspaceHeader } from "@/components/workspace-header";
import { ContentEditor, PublishContentForm, TrashContentForm, UploadContentPhoto } from "@/components/publishing-forms";
import { workPhotos } from "@/content/site";
import { readPublication } from "@/server/publishing";
import { requireViewer } from "@/server/session";
export const metadata={title:"Edit content | Mias",robots:{index:false,follow:false}};
export default async function ContentEdit({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{notice?:string}>}) {
  const {id}=await params,viewer=await requireViewer(["staff","owner"],"/staff/content/"+id);
  const {entry,images,history}=await readPublication(viewer,id);
  return <main id="main-content" className="site-container workspace" tabIndex={-1}>
    <WorkspaceHeader viewer={viewer} title={entry.draft.title} current="content"/>
    {(await searchParams).notice==="unpublished" && <p role="status" className="form-success">Content unpublished.</p>}
    <p><a href="/staff/content">← Publishing</a> · <a href={`/staff/content/${id}/preview`}>Preview saved draft</a>
      {entry.published && <> · <a href={entry.kind==="project" ? "/projects/"+entry.slug : "/projects#testimonials"}>View published content</a></>}</p>
    <p>{entry.sample?"Fictional test content":"Real content for review"} · Draft version {entry.version}</p>
    <nav className="content-actions" aria-label="Project controls"><a href="#edit-content">Edit {entry.kind}</a>{viewer.role==="owner"&&<><a href="#owner-approval">Publish / review</a><a href="#delete-content">Delete {entry.kind}</a></>}</nav>
    <div className="job-columns"><div>
      <div id="edit-content"><ContentEditor id={id} version={entry.version} draft={entry.draft} kind={entry.kind} images={images} workPhotos={workPhotos}/></div>
      {entry.kind==="project" && <><UploadContentPhoto id={id}/><section className="account-card"><h2>Private photo inventory</h2>{images.map(image=><figure className="content-photo" key={image.id}><img src={"/staff/content/images/"+image.id} alt={image.alt} width={320} height={220}/><figcaption>{image.alt}</figcaption><p>Source: {image.source}</p><p>Permission: {image.permission || "Pending"}</p></figure>)}</section></>}
    </div><div>
      {viewer.role==="owner" ? <><div id="owner-approval"><PublishContentForm id={id} version={entry.version}/>{entry.published && <PublishContentForm id={id} version={entry.version} unpublish/>}</div><TrashContentForm id={id} version={entry.version} kind={entry.kind}/></> : <p className="notice">An Owner must review and publish the saved draft.</p>}
      <section className="account-card"><h2>Review history</h2><ol>{history.map((event,i)=><li key={i}>{event.action} · {event.createdAt.toISOString().slice(0,16).replace("T"," ")} UTC<p>{event.detail.slice(id.length+3)}</p></li>)}</ol></section>
    </div></div>
  </main>;
}
