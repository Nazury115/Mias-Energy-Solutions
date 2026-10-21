import type { Metadata } from "next";
import { projectStories, workPhotos } from "@/content/site";
import { visibleProjects } from "@/lib/project-visibility";
import { ProjectGallery } from "@/components/project-gallery";
import { WorkGallery } from "@/components/work-gallery";
import { ContactPanel } from "@/components/contact-panel";
export const metadata: Metadata = { title: "Our Work & Project Stories | Mias Energy Solutions", description: "Photos from Mias Energy Solutions work sites in Zambia, with clearly labelled sample project stories across water, electrical and renewable energy." };
export default function Projects() {
  const projects = visibleProjects(projectStories, process.env.MIAS_PUBLIC_LAUNCH === "true");
  return <main id="main-content" tabIndex={-1}><section className="site-container page-intro page-intro-large" data-reveal><p className="eyebrow">OUR WORK</p><h1>From a need<br /><span className="blue-text">to a solution.</span></h1><p>Pump stations, booster sets, control panels and solar installations, photographed on Mias work sites.</p></section>
    <section id="work" className="site-container section-bottom" aria-labelledby="work-heading" tabIndex={-1}><div className="section-heading" data-reveal><div><p className="eyebrow">FROM THE FIELD</p><h2 id="work-heading">Real work. Real sites.</h2></div><p className="section-copy">Select a photo to view it larger. Individual customer and project details are still being confirmed.</p></div><WorkGallery photos={workPhotos} /></section>
    {projects.length > 0 && <section className="section-space projects-section" aria-labelledby="stories-heading"><div className="site-container">
      <div className="section-heading" data-reveal><div><p className="eyebrow">PROJECT STORIES</p><h2 id="stories-heading">How a project<br />comes together.</h2></div><p className="section-copy">Water, electrical and renewable energy projects, explained through the problem, the work and the outcome.</p></div>
      {projects.some(project => project.fictional) && <p className="notice">Preview collection: these are fictional examples, not completed customer projects or testimonials. Their photos are illustrative stock images.</p>}
      <ProjectGallery projects={projects} />
    </div></section>}<ContactPanel /></main>;
}
