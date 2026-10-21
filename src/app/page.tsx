import Image from "next/image";
import { audiences, customers, projectStories, serviceFamilies } from "@/content/site";
import { ContactPanel } from "@/components/contact-panel";
import { ServiceCard } from "@/components/service-card";
import { ProjectCard } from "@/components/project-card";
import { visibleProjects } from "@/lib/project-visibility";

export default function Home() {
  const projects = visibleProjects(projectStories, process.env.MIAS_PUBLIC_LAUNCH === "true");
  return <main id="main-content" tabIndex={-1}>
    <section className="hero" aria-labelledby="hero-heading"><div className="site-container hero-grid">
      <div className="hero-copy"><p className="eyebrow"><span className="location-dot" />BASED IN LUSAKA. WORKING ACROSS ZAMBIA.</p>
        <h1 id="hero-heading">Water solutions.<br />Energy for<br /><span>what’s next.</span></h1>
        <p className="hero-description">From the water you rely on to the power you need. Pumping, solar, electrical and plumbing services for homes, farms and businesses.</p>
        <div className="hero-actions"><a className="button button-yellow" href="#contact">Discuss your project <span aria-hidden="true">↗</span></a><a className="text-link" href="/services">Explore our services <span aria-hidden="true">→</span></a></div>
        <p className="hero-footnote">Installation <span>•</span> Maintenance <span>•</span> Technical support</p>
      </div>
      <figure className="hero-photo"><Image src="/images/rooftop-solar.jpeg" alt="Rooftop solar installation from photographs supplied by Mias Energy Solutions." fill priority sizes="(max-width: 767px) 100vw, 50vw" /><div className="photo-corner" aria-hidden="true">↗</div><figcaption><span>SOLAR INSTALLATION</span><strong>Putting sunlight to work.</strong><small>From our work archive · project details pending</small></figcaption></figure>
    </div></section>

    <section className="customers-section" aria-labelledby="customers-heading"><div className="site-container customer-strip"><div><p className="eyebrow">CONNECTIONS THROUGH OUR WORK</p><h2 id="customers-heading">Selected customers</h2></div><ul>{customers.map(customer => <li key={customer}>{customer}</li>)}</ul></div></section>

    <section id="services" className="section-space" aria-labelledby="services-heading" tabIndex={-1}><div className="site-container">
      <div className="section-heading"><div><p className="eyebrow">WHAT WE DO / 01</p><h2 id="services-heading">Three connected services.<br />One place to start.</h2></div><p className="section-copy">Explore the service that fits your needs, from a pump that needs attention to a new solar installation.</p></div>
      <div className="cards-grid">{serviceFamilies.map(family => <ServiceCard family={family} key={family.slug} />)}</div>
    </div></section>

    <section className="support-band"><div className="site-container support-inner"><div className="support-symbol" aria-hidden="true">↗</div><div><p className="eyebrow">REPAIRS & SUPPORT</p><h2>Something needs attention?</h2><p>Breakdown call-outs in Lusaka. Work elsewhere in Zambia by arrangement. Contact us to confirm availability.</p></div><a className="button button-yellow" href="/contact?service=repairs">Get in touch <span aria-hidden="true">↗</span></a></div></section>

    {projects.length > 0 && <section className="section-space projects-section"><div className="site-container">
      <div className="section-heading"><div><p className="eyebrow">PROJECT STORIES / 02</p><h2>Every project<br />starts with a need.</h2></div><a className="text-link" href="/projects">View project previews <span aria-hidden="true">↗</span></a></div>
      <p className="notice">These three stories are fictional examples for this website preview, not completed customer projects or testimonials.</p>
      <div className="cards-grid">{projects.map(project => <ProjectCard project={project} key={project.slug} />)}</div>
    </div></section>}

    <section id="about" className="about-section section-space" aria-labelledby="about-heading" tabIndex={-1}><div className="site-container about-grid">
      <div><p className="eyebrow">GET TO KNOW MIAS / 03</p><h2 id="about-heading">Water. Energy.<br /><span className="blue-text">People at the centre.</span></h2><p className="section-copy">Mias Energy Solutions provides water, electrical and renewable energy services from Lusaka, Zambia. Our work includes installation, maintenance and technical support.</p><a className="text-link" href="/about">Meet Mias Energy Solutions <span aria-hidden="true">↗</span></a></div>
      <div className="people-card"><p className="eyebrow">A DIRECT CONVERSATION</p><div className="profile-monogram" aria-hidden="true">IM</div><h3>Israel Masauso</h3><p className="profile-role">Director & CEO</p><p>Israel handles business inquiries and project discussions. Tell him what you need and where your project is based.</p><div className="audience-list" aria-label="Who we serve">{audiences.map(audience => <span key={audience}>{audience}</span>)}</div></div>
    </div></section>
    <ContactPanel />
  </main>;
}
