import { business, navigation, operatingHours } from "@/content/site";
export function SiteFooter() {
  return <footer className="site-footer"><div className="site-container footer-main">
    <div><a className="footer-brand" href="/">Mias<span> Energy Solutions</span></a><p>A Brighter Tomorrow Starts Today</p><p>Water. Electrical. Renewable energy.</p></div>
    <nav aria-label="Footer navigation">{navigation.map(item => <a href={item.href} key={item.href}>{item.label}</a>)}</nav>
    <div className="footer-contact"><a href={`tel:${business.contacts.phone}`}>{business.phoneDisplay}</a><a href={`mailto:${business.contacts.email}`}>{business.contacts.email}</a><p>{business.location}</p>{operatingHours && <p>{operatingHours.label}</p>}</div>
  </div><div className="site-container footer-bottom"><span>© 2026 {business.name}</span><span>Serving Lusaka. Projects across Zambia by arrangement.</span></div></footer>;
}
