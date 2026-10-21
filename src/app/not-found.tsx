const destinations = [
  { href: "/", label: "Home", note: "Start from the beginning" },
  { href: "/services", label: "Services", note: "Water, electrical and solar" },
  { href: "/projects", label: "Projects", note: "Our work across Zambia" },
  { href: "/contact", label: "Contact", note: "Talk to Israel directly" },
];

export default function NotFound() {
  return (
    <main id="main-content" className="site-container not-found" tabIndex={-1}>
      <p className="eyebrow">PAGE NOT FOUND · 404</p>
      <h1>This page<br /><span className="blue-text">isn’t here.</span></h1>
      <p>The link may be old or mistyped. These are the main places to go:</p>
      <nav aria-label="Main pages"><ul className="not-found-links">
        {destinations.map(item => <li key={item.href}><a href={item.href}><strong>{item.label}</strong><span>{item.note}</span><span className="method-arrow" aria-hidden="true">↗</span></a></li>)}
      </ul></nav>
    </main>
  );
}
