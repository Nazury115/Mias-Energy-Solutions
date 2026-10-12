import Image from "next/image";
import { audiences, business, serviceGroups } from "@/content/site";
import { ContactPanel } from "@/components/contact-panel";

export default function Home() {
  return (
    <main id="main-content" tabIndex={-1}>
      <section className="hero section-space" aria-labelledby="hero-heading">
        <div className="site-container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow"><span className="location-dot" aria-hidden="true" />{business.location}</p>
            <h1 id="hero-heading">Water solutions.<span>Renewable energy.</span></h1>
            <p className="hero-description">Pumping, solar, electrical and plumbing services for homes, farms and businesses.</p>
            <div className="hero-actions"><a className="button" href="#contact">Discuss your project <span aria-hidden="true">↗</span></a><a className="text-link" href="#services">Explore our services <span aria-hidden="true">↓</span></a></div>
            <div className="hero-footnote"><span aria-hidden="true" />Water and energy, connected.</div>
          </div>
          <figure className="hero-visual">
            <div className="visual-heading"><span>WATER + ENERGY</span><span aria-hidden="true">↗</span></div>
            <Image src="/water-energy-illustration.svg" alt="Illustration of solar panels, a water storage tank, connected pipes and a building; not a completed Mias project." width={640} height={540} priority />
            <figcaption><span className="visual-dot" aria-hidden="true" />Solar &amp; water infrastructure<span>ILLUSTRATION</span></figcaption>
          </figure>
        </div>
      </section>

      <div className="capability-strip"><div className="site-container"><p>FROM INSTALLATION TO ONGOING CARE</p><div><span>Installation</span><span>Maintenance</span><span>Technical support</span></div></div></div>

      <section id="services" className="services-section section-space" aria-labelledby="services-heading" tabIndex={-1}>
        <div className="site-container">
          <div className="section-heading"><div><p className="eyebrow">WHAT WE DO</p><h2 id="services-heading">Practical solutions.<br />Connected services.</h2></div><p className="section-copy">Explore our work across water and renewable energy. Start with the service that matches your project.</p></div>
          <div className="grid gap-5 md:grid-cols-2 service-grid">
            {serviceGroups.map(group => (
              <article className="service-card" key={group.number}>
                <div className="service-topline"><span>{group.number} /</span><span aria-hidden="true">↗</span></div>
                <p className="service-category">{group.category}</p>
                <h3>{group.title}</h3>
                <p className="service-description">{group.description}</p>
                <ul>{group.services.map(service => <li key={service}>{service}</li>)}</ul>
                <a className="service-link" href="#contact">Discuss {group.title.toLowerCase()}<span aria-hidden="true">↗</span></a>
              </article>
            ))}
          </div>
          <p className="services-note">Not sure which service fits? <a href="#contact">Start with your project.</a></p>
        </div>
      </section>

      <section id="about" className="about-section section-space" aria-labelledby="about-heading" tabIndex={-1}>
        <div className="site-container about-grid">
          <div>
            <p className="eyebrow">MEET MIAS ENERGY SOLUTIONS</p>
            <h2 id="about-heading">Water and energy.<br /><em>Here in Lusaka.</em></h2>
            <p className="section-copy">Mias Energy Solutions provides water, renewable energy, electrical and plumbing services from Lusaka, Zambia.</p>
            <p className="about-secondary">Our services cover pumping systems, solar installations, water treatment, control panels and related installation, maintenance and technical support.</p>
            <div className="audience-list" aria-label="Customers our services are intended for">{audiences.map(audience => <span key={audience}>{audience}</span>)}</div>
          </div>
          <aside className="conversation-card" aria-labelledby="conversation-heading">
            <span className="conversation-mark" aria-hidden="true">↗</span>
            <p className="eyebrow">A GOOD PLACE TO START</p>
            <h3 id="conversation-heading">Tell us about<br />your project.</h3>
            <p>These details can help shape a useful conversation:</p>
            <ol><li>What do you need to power or supply?</li><li>Where is the project located?</li><li>Is this a new installation or an existing system?</li></ol>
            <a href="#contact" className="text-link">View contact information <span aria-hidden="true">↗</span></a>
          </aside>
        </div>
      </section>

      <ContactPanel />
    </main>
  );
}
