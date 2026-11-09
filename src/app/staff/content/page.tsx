import { WorkspaceHeader } from "@/components/workspace-header";
import { CreateContentForm, RepositoryProjectForm, TrashContentForm } from "@/components/publishing-forms";
import { projectStories } from "@/content/projects";
import { listPublications, managedRepositorySlugs } from "@/server/publishing";
import { requireViewer } from "@/server/session";
export const metadata={title:"Publishing | Mias company workspace",robots:{index:false,follow:false}};
export default async function ContentWorkspace({searchParams}:{searchParams:Promise<{view?:string;notice?:string}>}) {
  const {view,notice}=await searchParams,trash=view==="trash";
  const viewer=await requireViewer(trash?["owner"]:["staff","owner"],"/staff/content");
  const entries=(await listPublications(viewer,trash)).filter(entry=>Boolean(entry.deletedAt)===trash);
  const mappings=await managedRepositorySlugs(viewer);
  const repository=projectStories.filter(story=>!mappings.some(mapping=>mapping.slug===story.slug));
  return <main id="main-content" className="site-container workspace" tabIndex={-1}>
    <WorkspaceHeader viewer={viewer} title={trash?"Publishing Trash":"Publishing"} current="content"/>
    {notice==="trashed"&&<p role="status" className="form-success">Content moved to Trash.</p>}
    {notice==="restored"&&<p role="status" className="form-success">Content restored as a draft.</p>}
    <nav className="content-actions" aria-label="Content inventory"><a href="/staff/content">Active projects and testimonials</a>{viewer.role==="owner"&&<a href="/staff/content?view=trash">Trash</a>}<a href="/projects">Public projects</a>{!trash&&<a href="#new-content">New project or testimonial</a>}</nav>
    {!trash&&<p>Preview and edit existing projects here, or create a new draft. An Owner reviews and publishes the saved version.</p>}
    <section className="account-card" id="content-register" tabIndex={-1}><h2>{trash?"Deleted content":"Projects and testimonials"}</h2>
      {entries.length ? <ul className="content-list">{entries.map(entry=><li key={entry.id}>
        {trash?<strong>{entry.draft.title}</strong>:<a href={`/staff/content/${entry.id}`}>{entry.draft.title}</a>}<p>{entry.kind} · {trash?"In Trash":entry.published?"Published version available":"Draft"}{entry.sample?" · Fictional test":""}{entry.sourceSlug?" · Existing website project":""}</p>
        {trash?<TrashContentForm id={entry.id} version={entry.version} kind={entry.kind} restore/>:<div className="content-actions">
          <a href={`/staff/content/${entry.id}/preview`}>Preview saved draft</a><a href={`/staff/content/${entry.id}#edit-content`}>Edit {entry.kind}</a>
          {viewer.role==="owner"&&<><a href={`/staff/content/${entry.id}#owner-approval`}>Publish / review</a><a href={`/staff/content/${entry.id}#delete-content`}>Delete {entry.kind}</a></>}
        </div>}
      </li>)}</ul>:<p>{trash?"Trash is empty.":"No managed drafts yet."}</p>}
      {!trash&&repository.length>0&&<><h3>Existing website projects</h3><p>These projects are already on the website. Editing creates a private draft; the current public version stays visible until an Owner publishes or deletes it.</p>
        <ul className="content-list">{repository.map(story=><li key={story.slug} data-repository-project={story.slug}><strong>{story.title}</strong><p>{story.fictional?"Fictional example":"Repository project"}</p>
          <div className="content-actions"><a href={`/staff/content/repository/${story.slug}/preview`}>Preview project</a><RepositoryProjectForm slug={story.slug}/>{viewer.role==="owner"&&<RepositoryProjectForm slug={story.slug} remove/>}</div>
        </li>)}</ul></>}
    </section>
    {!trash&&<div id="new-content" tabIndex={-1}><CreateContentForm/></div>}
  </main>;
}
