import Image from "next/image";
import { sectors } from "@/content/site";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata = pageMetadata("Sectors we serve | Mias Energy Solutions", "Explore how Mias can help with water, electrical and solar needs at homes, farms, businesses, community facilities and developments.", "/who-we-serve");

export default function WhoWeServe() {
  return <main id="main-content" tabIndex={-1} className="site-container section-bottom">
    <header className="page-intro">
      <h1>Sectors we serve</h1>
      <p>Choose your setting to explore the water, electrical and solar options that fit the way you use your site.</p>
      <nav className="sector-jumps" aria-label="Choose your sector">
        {sectors.map(sector => <a key={sector.slug} href={`#${sector.slug}`}>{sector.name}</a>)}
      </nav>
    </header>
    <p className="sector-credit">Illustrative photography</p>
    {sectors.map(sector => (
      <section className="sector-detail" id={sector.slug} key={sector.slug} aria-labelledby={`heading-${sector.slug}`} tabIndex={-1}>
        <figure><div className="sector-photo">
          <Image src={sector.photo} alt={sector.alt} fill sizes="(max-width: 767px) 100vw, (max-width: 1344px) 44vw, 550px" />
        </div>
          {sector.slug === "farms" && <figcaption className="sector-credit">Chipangali District, Zambia. <a className="inline-link" href="https://commons.wikimedia.org/wiki/File:Farming_activity.jpg">Photo by Portpher Kamungu</a> · <a className="inline-link" href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a> · cropped for display.</figcaption>}
        </figure>
        <div>
          <h2 id={`heading-${sector.slug}`}>{sector.name}</h2>
          <h3>The challenge</h3>
          <p>{sector.challenge}</p>
          <h3>How Mias can help</h3>
          <p>{sector.response}</p>
          <div className="sector-actions">
            <a className="button button-dark" href="/contact">{sector.inquiry}</a>
            <a className="text-link" href={sector.href}>{sector.link} <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </section>
    ))}
  </main>;
}
