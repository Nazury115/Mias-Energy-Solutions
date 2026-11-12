import Image from "next/image";
import { sectors, business, customers, leadership, operatingHours, serviceFamilies, workPhotos } from "@/content/site";
import { ContactPanel } from "@/components/contact-panel";
import { ScrollStatement } from "@/components/scroll-statement";
import { ServiceStory } from "@/components/service-story";
import { WorkGallery } from "@/components/work-gallery";
import { ZoomHero } from "@/components/zoom-hero";
import { siteUrl } from "@/lib/site-metadata";
import { localBusinessJsonLd } from "@/lib/structured-data";

export default function Home() {
  const structuredData = localBusinessJsonLd({ name: business.name, description: business.description, phone: business.contacts.phone,
    email: business.contacts.email, siteUrl, logoPath: "/brand/mias-logo-concept.png", openingHours: operatingHours?.schema ?? null });
  return <main id="main-content" tabIndex={-1}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <ZoomHero />

    <section className="statement-section" aria-label="What Mias does"><div className="site-container">
      <ScrollStatement text="From the water you rely on to the power you need, Mias installs, maintains and supports the systems behind homes, farms and businesses in Lusaka and across Zambia." />
    </div></section>

    <section className="customers-section" aria-labelledby="customers-heading">
      <div className="site-container customer-band">
        <h2 id="customers-heading">Selected customers</h2>
        <label className="customer-motion"><input type="checkbox" /> Pause motion</label>
        <div className="customer-window">
          <div className="customer-track">
            {[false, true].map(copy => (
              <ul key={String(copy)} aria-hidden={copy || undefined}>
                {customers.map(customer => (
                  <li key={customer.name}>
                    {customer.logo && <Image src={customer.logo} alt="" width={180} height={78} />}
                    <span className={customer.logo ? "visually-hidden" : undefined}>{customer.name}</span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </section>

    <section id="services" className="section-space services-section" aria-labelledby="services-heading" tabIndex={-1}><div className="site-container">
      <div className="section-heading" data-reveal><div><p className="eyebrow">WHAT WE DO / 01</p><h2 id="services-heading">Three connected services.<br />One place to start.</h2></div><p className="section-copy">Explore the service that fits your needs, from a pump that needs attention to a new solar installation.</p></div>
      <ServiceStory families={serviceFamilies} />
    </div></section>

    <section id="who-we-serve" className="section-space sector-section" aria-labelledby="sector-heading" tabIndex={-1}>
      <div className="site-container">
        <div className="section-heading"><h2 id="sector-heading">Sectors we serve</h2><p className="sector-credit">Illustrative photography</p></div>
        <div className="sector-grid">
          {sectors.map(sector => (
            <article key={sector.slug}>
              <a className="sector-index-link" href={`/who-we-serve#${sector.slug}`}>
              <div className="sector-photo">
                <Image src={`/images/stock/${sector.thumbnail}`} alt="" fill sizes="(max-width: 767px) 100vw, (max-width: 999px) 46vw, 32vw" />
              </div>
              <h3>{sector.name} <span aria-hidden="true">↗</span></h3>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="support-band"><div className="site-container"><div className="support-inner" data-reveal><div className="support-symbol" aria-hidden="true">↗</div><div><p className="eyebrow">REPAIRS & SUPPORT</p><h2>Something needs attention?</h2><p>Breakdown call-outs in Lusaka. Work elsewhere in Zambia by arrangement. Contact us to confirm availability.</p></div><a className="button button-dark" href="/contact?service=repairs">Get in touch <span aria-hidden="true">↗</span></a></div></div></section>

    <section className="section-space projects-section" aria-labelledby="work-heading"><div className="site-container">
      <div className="section-heading" data-reveal><div><p className="eyebrow">FROM THE FIELD / 02</p><h2 id="work-heading">Real work.<br />Real sites.</h2></div><p className="section-copy">Photos straight from Mias work sites: pump stations, booster sets, control panels and solar installations. <a className="inline-link" href="/projects#work">See all work photos</a></p></div>
      <WorkGallery photos={workPhotos.slice(0, 8)} />
    </div></section>

    <section id="about" className="about-section section-space" aria-labelledby="about-heading" tabIndex={-1}><div className="site-container about-grid">
      <div data-reveal><p className="eyebrow">GET TO KNOW MIAS / 03</p><h2 id="about-heading">Water. Energy.<br /><span className="blue-text">People at the centre.</span></h2><p className="section-copy">Mias Energy Solutions provides water, electrical and renewable energy services from Lusaka, Zambia. Our work includes installation, maintenance and technical support.</p><a className="text-link" href="/about">Meet Mias Energy Solutions <span aria-hidden="true">↗</span></a></div>
      <div className="people-card" data-reveal><p className="eyebrow">A DIRECT CONVERSATION</p>{leadership.portrait ? <Image className="profile-portrait" src={leadership.portrait.src} alt="Israel Masauso, Director & CEO of Mias Energy Solutions" width={leadership.portrait.width} height={leadership.portrait.height} sizes="96px" /> : <div className="profile-monogram" aria-hidden="true">IM</div>}<h3>Israel Masauso</h3><p className="profile-role">Director & CEO</p><p>{leadership.bio ?? "Israel handles business inquiries and project discussions. Tell him what you need and where your project is based."}</p></div>
    </div></section>
    <ContactPanel />
  </main>;
}
