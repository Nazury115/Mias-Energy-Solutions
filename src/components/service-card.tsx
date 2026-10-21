import Image from "next/image";
import type { ServiceFamily } from "@/content/site";

export function ServiceCard({ family }: { family: ServiceFamily }) {
  return <article className="service-card">
    <div className={`card-image image-${family.slug}`}><Image src={family.image} alt={family.alt} fill sizes="(max-width: 767px) 100vw, (max-width: 1000px) 50vw, 33vw" /></div>
    <div className="card-body"><p className="eyebrow"><span>{family.number}</span> / OUR SERVICES</p>
      <h3>{family.title}</h3><p>{family.description}</p>
      <ul className="service-tags">{family.services.map(service => <li key={service.name}>{service.name}</li>)}</ul>
      <a className="card-link" href={`/services/${family.slug}`}>Explore {family.shortTitle.toLowerCase()}<span aria-hidden="true">↗</span></a>
    </div>
  </article>;
}
