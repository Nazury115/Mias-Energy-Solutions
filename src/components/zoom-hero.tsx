"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { stockImages } from "@/content/site";
import { useScrollProgress } from "@/lib/use-scroll-progress";

export function ZoomHero() {
  const section = useRef<HTMLElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  useScrollProgress(section);

  // The photo starts just below the headline, wherever the headline ends on this screen size.
  useEffect(() => {
    const measure = () => {
      if (copy.current) section.current?.style.setProperty("--zoom-offset", `${copy.current.offsetTop + copy.current.offsetHeight + 28}px`);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return <section ref={section} className="zoom-hero" aria-labelledby="hero-heading">
    <div className="zoom-stage">
      <div ref={copy} className="site-container zoom-copy">
        <p className="eyebrow"><span className="location-dot" />BASED IN LUSAKA. WORKING ACROSS ZAMBIA.</p>
        <h1 id="hero-heading">Water solutions.<br />Energy for <span>what’s next.</span></h1>
        <p className="hero-description">Pumping, plumbing, electrical and solar services for homes, farms and businesses.</p>
        <div className="hero-actions"><a className="button button-yellow" href="#contact">Discuss your project <span aria-hidden="true">↗</span></a><a className="text-link" href="#services">Explore our services <span aria-hidden="true">↓</span></a></div>
      </div>
      <figure className="zoom-media">
        <Image src={stockImages.hero.src} alt={stockImages.hero.alt} fill priority sizes="100vw" />
        <figcaption><span>RENEWABLE ENERGY</span><strong>Putting sunlight to work.</strong><small>Solar PV and solar-powered pumping for homes, farms and businesses.</small></figcaption>
      </figure>
    </div>
  </section>;
}
