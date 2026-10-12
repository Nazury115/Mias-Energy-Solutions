import { business, navigation } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-container footer-main">
        <div><a className="footer-brand" href="/">{business.name}</a><p>Water. Solar. Electrical. Plumbing.</p></div>
        <nav aria-label="Footer navigation">{navigation.map(item => <a href={item.href} key={item.href}>{item.label}</a>)}</nav>
      </div>
      <div className="site-container footer-bottom"><span>© 2026 {business.name}</span><span>{business.location}</span></div>
    </footer>
  );
}
