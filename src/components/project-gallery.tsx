"use client";
import { useState } from "react";
import type { ProjectStory } from "@/content/projects";
import { ProjectCard } from "./project-card";

export function ProjectGallery({ projects }: { projects: ProjectStory[] }) {
  const [category, setCategory] = useState("all");
  const filtered = projects.filter(project => category === "all" || project.family === category);
  return <>
    <div className="filter-bar" role="group" aria-label="Filter projects by service">
      {[["all", "All projects"], ["water", "Water"], ["electrical", "Electrical"], ["renewable-energy", "Renewable energy"]].map(([value, label]) =>
        <button type="button" key={value} aria-pressed={category === value} onClick={() => setCategory(value)}>{label}</button>)}
    </div>
    <p className="results-count" role="status">{filtered.length} project {filtered.length === 1 ? "example" : "examples"}</p>
    <div className="cards-grid">{filtered.map(project => <ProjectCard key={project.slug} project={project} />)}</div>
    {!filtered.length && <p className="notice">No approved project stories are available in this category yet. Contact Mias to discuss similar work.</p>}
  </>;
}
