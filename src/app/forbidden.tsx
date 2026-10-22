const destinations = [
  { href: "/", label: "Home", note: "Start from the beginning" },
  { href: "/account", label: "My account", note: "Your details and inquiries" },
  { href: "/contact", label: "Contact", note: "Talk to Israel directly" },
];

// Shown with HTTP 403 whenever a signed-in account asks for a page its role can't use (spec 007, ROLE-02).
export default function Forbidden() {
  return (
    <main id="main-content" className="site-container not-found" tabIndex={-1}>
      <p className="eyebrow">NOT ALLOWED · 403</p>
      <h1>You don’t have access to this page</h1>
      <p>This part of the site belongs to a different kind of account. If you think you should have access, ask an Owner at Mias Energy Solutions.</p>
      <nav aria-label="Main pages"><ul className="not-found-links">
        {destinations.map(item => <li key={item.href}><a href={item.href}><strong>{item.label}</strong><span>{item.note}</span><span className="method-arrow" aria-hidden="true">↗</span></a></li>)}
      </ul></nav>
    </main>
  );
}
