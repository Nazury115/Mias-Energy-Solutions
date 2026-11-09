import { notFound, redirect } from "next/navigation";
import { PublicationPreview } from "@/components/publication-preview";
import { RepositoryProjectForm } from "@/components/publishing-forms";
import { projectStories } from "@/content/projects";
import { emptyPublication } from "@/lib/publishing";
import { requireViewer } from "@/server/session";
import { managedRepositorySlugs } from "@/server/publishing";
export const metadata={title:"Existing project preview | Mias",robots:{index:false,follow:false}};
export default async function RepositoryPreview({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  const viewer=await requireViewer(["staff","owner"],`/staff/content/repository/${slug}/preview`);
  const managed=(await managedRepositorySlugs(viewer)).find(entry=>entry.slug===slug);
  if(managed?.deletedAt)notFound();
  if(managed)redirect(`/staff/content/${managed.id}/preview`);
  const story=projectStories.find(project=>project.slug===slug);
  if(!story)notFound();
  return <main id="main-content" className="site-container workspace" tabIndex={-1}>
    <p className="notice">Private preview of the existing website record. Open an editable draft to make changes.</p>
    <p><a href="/staff/content">← Publishing</a></p><RepositoryProjectForm slug={slug}/>
    <PublicationPreview kind="project" sample={story.fictional} photos={[{src:story.image,alt:story.alt}]} draft={{...emptyPublication,...story,year:story.year?String(story.year):"",area:story.area??""}}/>
  </main>;
}
