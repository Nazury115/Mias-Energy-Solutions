import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site-metadata";
import Image from "next/image";
import { audiences, business, leadership, stockImages } from "@/content/site";
import { getContactLinks } from "@/lib/contact-links";
import { ContactPanel } from "@/components/contact-panel";
import { ParallaxImage } from "@/components/parallax-image";
import { ScrollStatement } from "@/components/scroll-statement";
export const metadata: Metadata = pageMetadata("About Mias & Israel Masauso | Mias Energy Solutions", "Meet Mias Energy Solutions in Lusaka, Zambia, and contact Director and CEO Israel Masauso about water, electrical and renewable energy projects.", "/about");
export default function About() {
  const links = getContactLinks(business.contacts);
  return <main id="main-content" tabIndex={-1}><section className="site-container page-intro page-intro-large" data-reveal><p className="eyebrow">ABOUT MIAS ENERGY SOLUTIONS</p><h1>Local roots.<br /><span className="blue-text">Connected services.</span></h1><p>Based in Lusaka, Zambia, Mias brings together water, electrical and renewable energy services for homes, farms, businesses and institutions.</p></section>
    <div className="site-container"><ParallaxImage className="about-banner" src={stockImages.about.src} alt={stockImages.about.alt} priority sizes="(max-width: 1300px) 100vw, 1248px"><figcaption>Water and energy,<br />working together.</figcaption></ParallaxImage></div>
    <section className="statement-section" aria-label="What Mias does"><div className="site-container"><ScrollStatement text="One team for the water you rely on and the power you need, from the first conversation through installation, maintenance and support." /></div></section>
    <section className="site-container about-grid section-bottom"><div data-reveal><h2>From installation<br />to ongoing support.</h2><p className="lead">Our services include borehole and booster pumps, solar systems, water treatment, irrigation, plumbing, control panels and electrical work.</p><p className="muted">Installation, maintenance, upgrades and breakdown support can all start with a conversation about what you need.</p><div className="audience-list">{audiences.map(audience => <span key={audience}>{audience}</span>)}</div><h3 className="spaced">Where we work</h3><p className="muted">Lusaka is our base for faster response. Projects elsewhere in Zambia are arranged with the customer and may require several days of coordination and travel. Confirm availability directly before planning a visit.</p></div>
      <aside className="people-card" data-reveal>{leadership.portrait ? <Image className="profile-portrait" src={leadership.portrait.src} alt="Israel Masauso, Director & CEO of Mias Energy Solutions" width={leadership.portrait.width} height={leadership.portrait.height} sizes="96px" /> : <div className="profile-monogram" aria-hidden="true">IM</div>}<p className="eyebrow">MEET THE DIRECTOR</p><h2>Israel Masauso</h2><p className="profile-role">Director & CEO</p><p>{leadership.bio ?? "Israel manages business inquiries and project discussions at Mias Energy Solutions."}</p><div className="profile-contacts"><a href={`tel:${business.contacts.phone}`}>{business.phoneDisplay}</a><a href={`mailto:${business.contacts.email}`}>{business.contacts.email}</a></div><a className="button" href={links.find(link => link.kind === "whatsapp")!.href}>Talk to Israel on WhatsApp <span aria-hidden="true">↗</span></a></aside>
    </section><ContactPanel /></main>;
}
