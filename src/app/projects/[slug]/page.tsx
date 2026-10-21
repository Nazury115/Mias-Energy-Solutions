import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { workPhotos } from "@/content/site";
import { projectStories } from "@/content/projects";
import { visibleProjects } from "@/lib/project-visibility";
import { ParallaxImage } from "@/components/parallax-image";
import { WorkGallery } from "@/components/work-gallery";
import { pageMetadata } from "@/lib/site-metadata";
const projects = () => visibleProjects(projectStories, process.env.MIAS_PUBLIC_LAUNCH === "true");
export const dynamicParams = false;
export function generateStaticParams() { return projects().map(project => ({ slug: project.slug })); }
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; const project = projects().find(item => item.slug === slug);
  return pageMetadata(`${project?.title ?? "Project not found"}${project?.fictional === false ? "" : " — Fictional Example"} | Mias`, project?.summary ?? "", `/projects/${slug}`);
}
const headings = {
  fictional: [["01 / THE SCENARIO", "The starting point."], ["02 / AN EXAMPLE APPROACH", "What the work could involve."], ["03 / THE OUTCOME", "Evidence comes first."]],
  real: [["01 / THE CHALLENGE", "What the customer needed."], ["02 / WHAT WE DID", "The work."], ["03 / THE RESULT", "The outcome."]],
};
export default async function ProjectDetail({ params }: Props) {
  const { slug } = await params; const project = projects().find(item => item.slug === slug);
  if (!project) notFound();
  const sample = project.fictional;
  const photos = workPhotos.filter(photo => project.photos?.includes(photo.src));
  const facts = [["Province", sample ? `${project.province} (sample)` : project.province], ["Area", project.area], ["Service", project.category],
    ["Year", project.year?.toString()], ["Customer", !sample && project.customer?.publishPermission ? project.customer.name : undefined]].filter(([, value]) => value);
  const sections = [project.problem, project.approach, project.outcome];
  return <main id="main-content" tabIndex={-1}><div className="site-container">
    <section className="page-intro"><a className="back-link" href="/projects">← {sample ? "All project previews" : "All projects"}</a><p className="eyebrow">{project.category} / {sample ? "PROJECT STORY PREVIEW" : "CASE STUDY"}</p><h1>{project.title}</h1><p>{project.summary}</p>
      <dl className="story-facts">{facts.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl></section>
    {sample && <p className="notice"><strong>Fictional example</strong> — not a completed customer project. No real client, review or measured result is associated with this story.</p>}
    <ParallaxImage className="story-image" src={project.image} alt={project.alt} priority sizes="(max-width: 767px) 100vw, 85vw" />{sample && <p className="image-caption">Illustrative stock photograph; not verified as this example project.</p>}
    <section className="story-sections section-bottom">{headings[sample ? "fictional" : "real"].map(([eyebrow, heading], index) => <article key={eyebrow} data-reveal><p className="eyebrow">{eyebrow}</p><h2>{heading}</h2><p>{sections[index]}</p></article>)}
      {photos.length > 0 && <div className="story-photos" data-reveal><p className="eyebrow">PHOTOS FROM THIS PROJECT</p><WorkGallery photos={photos} layout="strip" /></div>}
      <a className="button" href={`/contact?service=${project.family}&area=${encodeURIComponent(project.province)}`}>Discuss a similar need <span aria-hidden="true">↗</span></a></section>
  </div></main>;
}
