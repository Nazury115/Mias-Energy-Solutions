import { business } from "@/content/site";
import { getContactLinks } from "@/lib/contact-links";

export function ContactPanel() {
  const links = getContactLinks(business.contacts, "I would like to discuss a water or energy project.");
  return (
    <section id="contact" className="contact-section section-space" aria-labelledby="contact-heading" tabIndex={-1}>
      <div className="site-container contact-grid">
        <div>
          <p className="eyebrow">LET’S START A CONVERSATION</p>
          <h2 id="contact-heading">What are you<br />working on?</h2>
          <p className="section-copy">A new water supply, a solar installation or an existing system that needs attention? Start with your project and the service you need.</p>
          <p className="contact-location"><span className="location-dot" aria-hidden="true" />{business.location}</p>
        </div>
        {links.length ? (
          <div className="contact-details">
            <h3>Get in touch with Mias</h3>
            <div className="contact-actions">{links.map(link => <a className="button" key={link.kind} href={link.href} rel={link.kind === "whatsapp" ? "noopener noreferrer" : undefined}>{link.label}<span aria-hidden="true">↗</span></a>)}</div>
          </div>
        ) : (
          <div className="contact-details">
            <span className="status-label"><span aria-hidden="true" />CONTACT DETAILS PENDING</span>
            <h3>Our contact details are being confirmed.</h3>
            <p>Phone, WhatsApp and email will appear here once verified. This website preview does not accept inquiries yet.</p>
            <p className="confirmation-note">TODO: Confirm with business owner</p>
          </div>
        )}
      </div>
    </section>
  );
}
