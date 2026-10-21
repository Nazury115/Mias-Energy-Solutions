import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site-metadata";
import { business, operatingHours } from "@/content/site";
import { getContactLinks } from "@/lib/contact-links";
import { matchProvince } from "@/lib/coverage";
import { inquiryServices } from "@/lib/inquiry";
import { InquiryComposer } from "@/components/inquiry-composer";
export const metadata: Metadata = pageMetadata("Contact & Service Inquiries | Mias Energy Solutions", "Call, email or WhatsApp Israel Masauso at Mias Energy Solutions. Discuss water, electrical, solar and repair work in Lusaka and across Zambia.", "/contact");
const destinations = { phone: business.phoneDisplay, whatsapp: business.phoneDisplay, email: business.contacts.email };
export default async function Contact({ searchParams }: { searchParams: Promise<{ service?: string | string[]; area?: string | string[] }> }) {
  const { service, area } = await searchParams;
  const initialService = typeof service === "string" && Object.hasOwn(inquiryServices, service) ? service : "general";
  const initialArea = typeof area === "string" ? matchProvince(area) ?? "" : "";
  const links = getContactLinks(business.contacts);
  return <main id="main-content" tabIndex={-1}><section className="site-container page-intro page-intro-large" data-reveal><p className="eyebrow">CONTACT MIAS</p><h1>What can we<br /><span className="blue-text">help you with?</span></h1><p>A new installation, an upgrade or an existing system that needs attention. Tell us about your project.</p></section>
    <section className="site-container contact-methods" aria-label="Contact Mias directly" data-reveal-group>{links.map(link => <a key={link.kind} className={`contact-method contact-${link.kind}`} href={link.href} rel={link.kind === "whatsapp" ? "noopener noreferrer" : undefined}>
      <span className="method-label">{link.label}</span><strong>{destinations[link.kind]}</strong><span className="method-arrow" aria-hidden="true">↗</span></a>)}</section>
    <section className="site-container contact-page-grid section-bottom"><aside className="contact-sidebar" data-reveal><p className="eyebrow">YOUR DIRECT CONTACT</p><h2>Israel Masauso</h2><p className="profile-role">Director & CEO</p><p>Israel handles business inquiries and project discussions personally.</p><hr /><h3>Based in Lusaka</h3><p>Faster response in Lusaka. Projects elsewhere in Zambia by arrangement. <a className="inline-link" href="/projects#coverage">See where we work</a></p>{operatingHours && <><h3>Working hours</h3><p>{operatingHours.label}</p></>}<p>Contact Israel to confirm working days, availability and travel arrangements. A message is an inquiry, not a confirmed booking.</p></aside><InquiryComposer initialService={initialService} initialArea={initialArea} />
    </section></main>;
}
