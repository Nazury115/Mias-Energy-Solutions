import { WorkspaceHeader } from "@/components/workspace-header";
import { CreateContentForm } from "@/components/publishing-forms";
import { listPublications } from "@/server/publishing";
import { requireViewer } from "@/server/session";
export const metadata={title:"Publishing | Mias company workspace",robots:{index:false,follow:false}};
export default async function ContentWorkspace() {
  const viewer=await requireViewer(["staff","owner"],"/staff/content");
  const entries=await listPublications(viewer);
  return <main id="main-content" className="site-container workspace" tabIndex={-1}>
    <WorkspaceHeader viewer={viewer} title="Publishing" current="content"/>
    <p>Create a draft, preview it, then ask an Owner to approve publication.</p>
    <CreateContentForm/>
    <section className="account-card"><h2>Projects and testimonials</h2>
      {entries.length ? <ul className="content-list">{entries.map(entry=><li key={entry.id}><a href={"/staff/content/"+entry.id}>{entry.draft.title}</a> · {entry.kind} · {entry.published?"Published version available":"Draft"}{entry.sample?" · Fictional test":""}</li>)}</ul> : <p>No content drafts yet.</p>}
    </section>
  </main>;
}
