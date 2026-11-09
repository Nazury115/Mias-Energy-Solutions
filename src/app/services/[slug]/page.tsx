import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { serviceFamilies, stockImages, workPhotos, type ServiceFamily } from "@/content/site";
import { ContactPanel } from "@/components/contact-panel";
import { pageMetadata } from "@/lib/site-metadata";
import { ParallaxImage } from "@/components/parallax-image";
import { WorkGallery } from "@/components/work-gallery";

const solarPumping: ServiceFamily = {
  slug: "solar-water-pumping", number: "04", title: "Solar water pumping", shortTitle: "Solar water pumping",
  tagline: "Sunlight meets water supply.", description: "Solar-powered pumping brings water and renewable energy together. Discuss your water source, daily needs and site with Mias.",
  image: stockImages.solarPumping.src, alt: stockImages.solarPumping.alt,
  services: [
    { name: "Start with the water requirement", description: "Explain the water source, where the water needs to go and how it will be used. Existing borehole or pump information is useful if available." },
    { name: "Review the site and equipment", description: "Equipment selection depends on the actual pumping duty and site. A photograph or general load estimate cannot confirm the right pump and solar configuration." },
    { name: "Discuss installation and support", description: "Mias provides solar pumping installation, maintenance and related technical support. Contact us to discuss a new system or an existing installation." },
  ], questions: ["What is the water source?", "What water demand and pumping information do you have?", "Where is the installation located?"],
};
const pages = [...serviceFamilies, solarPumping];
export const dynamicParams = false;
export function generateStaticParams() { return pages.map(page => ({ slug: page.slug })); }
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const family = pages.find(item => item.slug === slug);
  return pageMetadata(`${family?.title ?? "Service not found"} | Mias Energy Solutions`, family?.description ?? "", `/services/${slug}`);
}
export default async function ServiceDetail({ params }: Props) {
  const { slug } = await params;
  const family = pages.find(item => item.slug === slug);
  if (!family) notFound();
  const photos = workPhotos.filter(photo => photo.family === family.slug);
  return <main id="main-content" tabIndex={-1}>
    <section className="site-container detail-hero"><div><a className="back-link" href="/services">← All services</a><p className="eyebrow">{family.title}</p><h1>{family.tagline}</h1><p className="lead">{family.description}</p><a className="button" href={`/contact?service=${family.slug}`}>Discuss {family.title.toLowerCase()} <span aria-hidden="true">↗</span></a></div><ParallaxImage className="detail-image" src={family.image} alt={family.alt} priority sizes="(max-width: 767px) 100vw, 50vw" /></section>
    <section className="section-space soft-section"><div className="site-container detail-layout"><div><p className="eyebrow">HOW WE CAN HELP</p><h2>Explore the possibilities.</h2><div className="offering-list">{family.services.map((service, i) => <article key={service.name} data-reveal><span className="offering-number">0{i + 1}</span><div><h3>{service.name}</h3><p>{service.description}</p>{service.href && <a className="text-link" href={service.href}>Explore solar water pumping <span aria-hidden="true">↗</span></a>}</div></article>)}</div></div><aside className="brief-card"><p className="eyebrow">YOUR PROJECT STARTS HERE</p><h3>A little context<br />goes a long way.</h3><ul>{family.questions.map(question => <li key={question}>{question}</li>)}</ul><a className="button" href={`/contact?service=${family.slug}`}>Prepare an inquiry <span aria-hidden="true">↗</span></a></aside></div></section>
    {photos.length > 0 && <section className="section-space" aria-labelledby="field-heading"><div className="site-container"><div className="section-heading" data-reveal><div><p className="eyebrow">FROM THE FIELD</p><h2 id="field-heading">Photos from our work sites.</h2></div><p className="section-copy">Taken on Mias jobs. Individual customer and project details are still being confirmed.</p></div><WorkGallery photos={photos} layout="strip" /></div></section>}
    {family.slug==="renewable-energy"&&<section className="site-container section-bottom"><div className="account-card"><p className="eyebrow">DISCUSS YOUR REQUIREMENTS</p><h2>Tell us what you want to power.</h2><p>Describe your appliances, site and requirements. Mias can review the details and prepare a quotation using current equipment prices.</p><a className="button button-small" href="/contact?service=renewable-energy">Request a solar assessment</a></div></section>}
    <ContactPanel />
  </main>;
}
