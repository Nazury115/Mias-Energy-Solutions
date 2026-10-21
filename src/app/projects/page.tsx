import type { Metadata } from "next";
import { projectStories } from "@/content/site";
import { visibleProjects } from "@/lib/project-visibility";
import { ProjectGallery } from "@/components/project-gallery";
import { ContactPanel } from "@/components/contact-panel";
export const metadata: Metadata = { title: "Project Story Previews | Mias Energy Solutions", description: "Explore clearly labelled sample project stories across water, electrical and renewable energy. Real case studies will follow owner verification." };
export default function Projects() {
  const projects = visibleProjects(projectStories, process.env.MIAS_PUBLIC_LAUNCH === "true");
  return <main id="main-content" tabIndex={-1}><section className="site-container page-intro"><p className="eyebrow">PROJECT STORIES</p><h1>From a need<br /><span className="blue-text">to a solution.</span></h1><p>Water, electrical and renewable energy projects, explained through the problem, the work and the outcome.</p></section><section className="site-container section-bottom">
    {projects.some(project => project.fictional) && <p className="notice">Preview collection: these are fictional examples, not completed customer projects or testimonials. Photos are supplied work images, not evidence of the example scenarios.</p>}
    <ProjectGallery projects={projects} />
  </section><ContactPanel /></main>;
}
