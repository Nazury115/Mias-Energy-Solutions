"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ServiceFamily } from "@/content/site";

// Desktop: the photo stays pinned while each service scrolls past it.
// Mobile: each service shows its own photo inline.
export function ServiceStory({ families }: { families: ServiceFamily[] }) {
  const [active, setActive] = useState(0);
  const steps = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.step));
    }, { rootMargin: "-50% 0px -50% 0px" });
    steps.current.forEach(step => step && observer.observe(step));
    return () => observer.disconnect();
  }, []);

  return <div className="service-story">
    <div className="service-steps">
      {families.map((family, index) => <article key={family.slug} id={`service-${family.slug}`} data-step={index} ref={element => { steps.current[index] = element; }} className={index === active ? "service-step is-active" : "service-step"}>
        <div className={`service-step-image image-${family.slug}`}><Image src={family.image} alt={family.alt} fill sizes="100vw" /></div>
        <p className="eyebrow"><span>{family.number}</span> / OUR SERVICES</p>
        <h3>{family.title}</h3>
        <p className="service-step-tagline">{family.tagline}</p>
        <p className="service-step-copy">{family.description}</p>
        <ul className="service-tags">{family.services.map(service => <li key={service.name}>{service.name}</li>)}</ul>
        <a className="button" href={`/services/${family.slug}`}>Explore {family.shortTitle.toLowerCase()} <span aria-hidden="true">↗</span></a>
      </article>)}
    </div>
    <div className="service-visual">
      <div className="service-visual-frame">
        {families.map((family, index) => <div key={family.slug} className={`service-visual-image image-${family.slug}${index === active ? " is-active" : ""}`}><Image src={family.image} alt={index === active ? family.alt : ""} fill sizes="55vw" /></div>)}
        <p className="service-visual-caption" aria-hidden="true">{families[active].tagline}</p>
      </div>
      <nav className="service-rail" aria-label="Jump to a service">
        {families.map((family, index) => <a key={family.slug} href={`#service-${family.slug}`} aria-current={index === active ? "true" : undefined}><span>{family.number}</span>{family.shortTitle}</a>)}
      </nav>
    </div>
  </div>;
}
