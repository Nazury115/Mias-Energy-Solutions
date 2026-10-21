import type { Metadata } from "next";
import { workPhotos } from "@/content/site";
import { projectStories, provinceTotals } from "@/content/projects";
import { buildCoverage } from "@/lib/coverage";
import { visibleProjects } from "@/lib/project-visibility";
import { pageMetadata } from "@/lib/site-metadata";
import { CoverageMap } from "@/components/coverage-map";
import { ProjectCard } from "@/components/project-card";
import { ProjectGallery } from "@/components/project-gallery";
import { WorkGallery } from "@/components/work-gallery";
import { ContactPanel } from "@/components/contact-panel";
export const metadata: Metadata = pageMetadata("Our Work & Project Stories | Mias Energy Solutions", "Photos from Mias Energy Solutions work sites in Zambia, where our projects are, and clearly labelled sample project stories across water, electrical and renewable energy.", "/projects");
export default function Projects() {
  const launch = process.env.MIAS_PUBLIC_LAUNCH === "true";
  const coverage = buildCoverage(provinceTotals, projectStories, launch);
  const projects = visibleProjects(projectStories, launch);
  const verified = projects.filter(project => !project.fictional), previews = projects.filter(project => project.fictional);
  return <main id="main-content" tabIndex={-1}><section className="site-container page-intro page-intro-large" data-reveal><p className="eyebrow">OUR WORK</p><h1>From a need<br /><span className="blue-text">to a solution.</span></h1><p>Pump stations, booster sets, control panels and solar installations, photographed on Mias work sites.</p></section>
    {coverage.mode !== "none" && <section id="coverage" className="site-container section-bottom" aria-labelledby="coverage-heading" tabIndex={-1}><div className="section-heading" data-reveal><div><p className="eyebrow">ACROSS ZAMBIA</p><h2 id="coverage-heading">Where our work<br />has taken us.</h2></div><p className="section-copy">Based in Lusaka, working in every province. Select a province to see the work recorded there.</p></div><CoverageMap coverage={coverage} /></section>}
    {verified.length > 0 && <section className="site-container section-bottom" aria-labelledby="case-studies-heading"><div className="section-heading" data-reveal><div><p className="eyebrow">CASE STUDIES</p><h2 id="case-studies-heading">Projects in detail.</h2></div></div><div className="cards-grid">{verified.map(project => <ProjectCard project={project} key={project.slug} />)}</div></section>}
    <section id="work" className="site-container section-bottom" aria-labelledby="work-heading" tabIndex={-1}><div className="section-heading" data-reveal><div><p className="eyebrow">FROM THE FIELD</p><h2 id="work-heading">Real work. Real sites.</h2></div><p className="section-copy">Select a photo to view it larger. Individual customer and project details are still being confirmed.</p></div><WorkGallery photos={workPhotos} /></section>
    {previews.length > 0 && <section className="section-space projects-section" aria-labelledby="stories-heading"><div className="site-container">
      <div className="section-heading" data-reveal><div><p className="eyebrow">PROJECT STORIES</p><h2 id="stories-heading">How a project<br />comes together.</h2></div><p className="section-copy">Water, electrical and renewable energy projects, explained through the problem, the work and the outcome.</p></div>
      <p className="notice">Preview collection: these are fictional examples, not completed customer projects or testimonials. Their photos are illustrative stock images.</p>
      <ProjectGallery projects={previews} />
    </div></section>}<ContactPanel /></main>;
}
