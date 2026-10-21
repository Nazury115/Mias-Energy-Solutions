import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { projectStories } from "@/content/site";
import { visibleProjects } from "@/lib/project-visibility";
const projects = () => visibleProjects(projectStories, process.env.MIAS_PUBLIC_LAUNCH === "true");
export const dynamicParams = false;
export function generateStaticParams() { return projects().map(project => ({ slug: project.slug })); }
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; const project = projects().find(item => item.slug === slug);
  return { title: `${project?.title ?? "Project not found"} — Fictional Example | Mias`, description: project?.summary };
}
export default async function ProjectDetail({ params }: Props) {
  const { slug } = await params; const project = projects().find(item => item.slug === slug);
  if (!project) notFound();
  return <main id="main-content" tabIndex={-1}><div className="site-container">
    <section className="page-intro"><a className="back-link" href="/projects">← All project previews</a><p className="eyebrow">{project.category} / PROJECT STORY PREVIEW</p><h1>{project.title}</h1><p>{project.summary}</p></section>
    <p className="notice"><strong>Fictional example</strong> — not a completed customer project. No real client, review or measured result is associated with this story.</p>
    <figure className={`story-image image-${project.family}`}><Image src={project.image} alt={project.alt} fill priority sizes="(max-width: 767px) 100vw, 85vw" /></figure><p className="image-caption">Supplied work photo; not verified as this example project.</p>
    <section className="story-sections section-bottom"><article><p className="eyebrow">01 / THE SCENARIO</p><h2>The starting point.</h2><p>{project.problem}</p></article><article><p className="eyebrow">02 / AN EXAMPLE APPROACH</p><h2>What the work could involve.</h2><p>{project.approach}</p></article><article><p className="eyebrow">03 / THE OUTCOME</p><h2>Evidence comes first.</h2><p>{project.outcome}</p></article><a className="button" href={`/contact?service=${project.family}`}>Discuss a similar need <span aria-hidden="true">↗</span></a></section>
  </div></main>;
}
