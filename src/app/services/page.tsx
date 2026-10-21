import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site-metadata";
import { serviceFamilies } from "@/content/site";
import { ServiceStory } from "@/components/service-story";
import { ContactPanel } from "@/components/contact-panel";
export const metadata: Metadata = pageMetadata("Water, Electrical & Solar Services | Mias Energy Solutions", "Explore Mias water, electrical and renewable energy services: pumps, irrigation, treatment, control panels, solar PV and maintenance in Zambia.", "/services");
export default function Services() {
  return <main id="main-content" tabIndex={-1}><section className="page-intro page-intro-large site-container" data-reveal><p className="eyebrow">OUR SERVICES</p><h1>Practical solutions.<br /><span className="blue-text">Connected expertise.</span></h1><p>Start with water, electrical or renewable energy. Explore what we do and tell us about the work you have in mind.</p></section>
    <section className="site-container section-bottom" aria-label="Service families"><ServiceStory families={serviceFamilies} /><div className="notice spaced" data-reveal>Need help with an existing system? <a href="/contact?service=repairs">Ask about repairs and support.</a> Availability and travel arrangements are confirmed directly with Mias.</div></section><ContactPanel /></main>;
}
