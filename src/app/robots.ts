import type { MetadataRoute } from "next";

// Preview: block all crawling. At the approved launch (increment 012) allow crawling and add
// `sitemap: new URL("/sitemap.xml", siteUrl).toString()`, together with removing the noindex metadata.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
