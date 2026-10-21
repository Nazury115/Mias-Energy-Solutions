import Image from "next/image";
import type { ProjectStory } from "@/content/site";

export function ProjectCard({ project }: { project: ProjectStory }) {
  return <article className={`project-card image-${project.family}`} data-project-card>
    <div className="card-image"><Image src={project.image} alt={project.alt} fill sizes="(max-width: 767px) 100vw, 33vw" /><span className="image-badge">Fictional example</span></div>
    <div className="card-body"><p className="eyebrow">{project.category}</p><h3>{project.title}</h3><p>{project.summary}</p>
      <a className="card-link" href={`/projects/${project.slug}`}>Explore example<span aria-hidden="true">↗</span></a>
    </div>
  </article>;
}
