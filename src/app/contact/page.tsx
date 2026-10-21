import type { Metadata } from "next";
import { business } from "@/content/site";
import { getContactLinks } from "@/lib/contact-links";
import { inquiryServices } from "@/lib/inquiry";
import { InquiryComposer } from "@/components/inquiry-composer";
export const metadata: Metadata = { title: "Contact & Service Inquiries | Mias Energy Solutions", description: "Call, email or WhatsApp Israel Masauso at Mias Energy Solutions. Discuss water, electrical, solar and repair work in Lusaka and across Zambia." };
export default async function Contact({ searchParams }: { searchParams: Promise<{ service?: string | string[] }> }) {
  const { service } = await searchParams;
  const initialService = typeof service === "string" && Object.hasOwn(inquiryServices, service) ? service : "general";
  const links = getContactLinks(business.contacts);
  return <main id="main-content" tabIndex={-1}><section className="site-container page-intro"><p className="eyebrow">CONTACT MIAS</p><h1>What can we<br /><span className="blue-text">help you with?</span></h1><p>A new installation, an upgrade or an existing system that needs attention. Tell us about your project.</p></section>
    <section className="site-container contact-page-grid section-bottom"><aside className="contact-sidebar"><p className="eyebrow">YOUR DIRECT CONTACT</p><h2>Israel Masauso</h2><p className="profile-role">Director & CEO</p><a className="large-phone" href={`tel:${business.contacts.phone}`}>{business.phoneDisplay}</a><a href={`mailto:${business.contacts.email}`}>{business.contacts.email}</a><div className="contact-actions">{links.map(link => <a key={link.kind} className="card-link" href={link.href} rel={link.kind === "whatsapp" ? "noopener noreferrer" : undefined}>{link.label}<span aria-hidden="true">↗</span></a>)}</div><hr /><h3>Based in Lusaka</h3><p>Faster response in Lusaka. Projects elsewhere in Zambia by arrangement.</p><p>Contact Israel to confirm working days, availability and travel arrangements. A message is an inquiry, not a confirmed booking.</p></aside><InquiryComposer initialService={initialService} />
    </section></main>;
}
