import type { MetadataRoute } from "next";
import { serviceFamilies } from "@/content/site";
import { loadProjectContent } from "@/content/projects";
import { siteUrl } from "@/lib/site-metadata";

export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const {projects:stories} = await loadProjectContent();
  const paths = ["/", "/services", ...serviceFamilies.map(family => `/services/${family.slug}`), "/services/solar-water-pumping",
    "/projects", ...stories.map(story => `/projects/${story.slug}`), "/about", "/contact", "/privacy"];
  return paths.map(path => ({ url: new URL(path, siteUrl).toString() }));
}
