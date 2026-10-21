import type { MetadataRoute } from "next";
import { serviceFamilies } from "@/content/site";
import { projectStories } from "@/content/projects";
import { visibleProjects } from "@/lib/project-visibility";
import { siteUrl } from "@/lib/site-metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const stories = visibleProjects(projectStories, process.env.MIAS_PUBLIC_LAUNCH === "true");
  const paths = ["/", "/services", ...serviceFamilies.map(family => `/services/${family.slug}`), "/services/solar-water-pumping",
    "/projects", ...stories.map(story => `/projects/${story.slug}`), "/about", "/contact"];
  return paths.map(path => ({ url: new URL(path, siteUrl).toString() }));
}
