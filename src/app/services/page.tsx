import type { Metadata } from "next";
import { serviceFamilies } from "@/content/site";
import { ServiceCard } from "@/components/service-card";
import { ContactPanel } from "@/components/contact-panel";
export const metadata: Metadata = { title: "Water, Electrical & Solar Services | Mias Energy Solutions", description: "Explore Mias water, electrical and renewable energy services: pumps, irrigation, treatment, control panels, solar PV and maintenance in Zambia." };
export default function Services() {
  return <main id="main-content" tabIndex={-1}><section className="page-intro site-container"><p className="eyebrow">OUR SERVICES</p><h1>Practical solutions.<br /><span className="blue-text">Connected expertise.</span></h1><p>Start with water, electrical or renewable energy. Explore what we do and tell us about the work you have in mind.</p></section>
    <section className="site-container section-bottom"><div className="cards-grid">{serviceFamilies.map(family => <ServiceCard family={family} key={family.slug} />)}</div><div className="notice spaced">Need help with an existing system? <a href="/contact?service=repairs">Ask about repairs and support.</a> Availability and travel arrangements are confirmed directly with Mias.</div></section><ContactPanel /></main>;
}
