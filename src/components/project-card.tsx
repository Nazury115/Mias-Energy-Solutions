import Image from "next/image";
import type { ProjectStory } from "@/content/projects";

export function ProjectCard({ project }: { project: ProjectStory }) {
  return <article className={`project-card image-${project.family}`} data-project-card>
    {project.image && !project.image.startsWith("/images/stock/") && <div className="card-image"><Image src={project.image} alt={project.alt} unoptimized={project.image.startsWith("/media/")} fill sizes="(max-width: 767px) 100vw, 33vw" /></div>}
    <div className="card-body"><p className="eyebrow">{project.fictional && "Fictional example · "}{project.category}</p><h3>{project.title}</h3><p>{project.summary}</p>
      <a className="card-link" href={`/projects/${project.slug}`}>{project.fictional ? "Explore example" : "Read project"}<span aria-hidden="true">↗</span></a>
    </div>
  </article>;
}
