import { business } from "@/content/site";
import { getContactLinks } from "@/lib/contact-links";

export function ContactPanel() {
  const links = getContactLinks(business.contacts, "Hello Mias, I would like to discuss a water or energy project.");
  return <section id="contact" className="contact-section section-space" aria-labelledby="contact-heading" tabIndex={-1}>
    <div className="site-container contact-grid"><div data-reveal><p className="eyebrow">LET’S TALK ABOUT YOUR PROJECT</p><h2 id="contact-heading">A conversation is<br />a good place to start.</h2><p>New installation, an upgrade or a system that needs attention? Talk directly with Israel Masauso.</p><a className="text-link" href="/contact">Prepare a service inquiry <span aria-hidden="true">↗</span></a></div>
      <div className="contact-details" data-reveal><p className="eyebrow">MIAS ENERGY SOLUTIONS · LUSAKA</p><h3>{business.phoneDisplay}</h3><p>{business.contacts.email}</p><div className="contact-actions">{links.map(link => <a className="button button-light" key={link.kind} href={link.href} rel={link.kind === "whatsapp" ? "noopener noreferrer" : undefined}>{link.label}<span aria-hidden="true">↗</span></a>)}</div></div>
    </div>
  </section>;
}
