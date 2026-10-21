"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { business, navigation } from "@/content/site";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const current = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 40);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <>
    <div className="header-top"><div className="site-container"><span>Lusaka, Zambia <span aria-hidden="true">/</span> Water · Electrical · Renewable energy</span><a href={`tel:${business.contacts.phone}`}>{business.phoneDisplay}</a></div></div>
    <header className={scrolled ? "site-header is-scrolled" : "site-header"}>
      <div className="site-container header-inner">
        <a className="brand" href="/" aria-label={`${business.name} home`}>
          <Image src="/brand/mias-logo-concept.png" alt={business.name} width={2135} height={737} priority sizes="180px" />
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navigation.map(item => <a key={item.href} href={item.href} aria-current={current(item.href) ? "page" : undefined}>{item.label}</a>)}
        </nav>
        <a href="/contact" className="button button-small header-cta">Request a service <span aria-hidden="true">↗</span></a>
        <button ref={toggle} type="button" className="menu-toggle" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(!open)}>
          <span className="menu-lines" aria-hidden="true" />
        </button>
      </div>
      <nav id="mobile-navigation" className="mobile-panel" aria-label="Mobile navigation" hidden={!open}>
        <div className="site-container">
          {navigation.map(item => <a key={item.href} href={item.href} aria-current={current(item.href) ? "page" : undefined} onClick={() => setOpen(false)}>{item.label}<span aria-hidden="true">↗</span></a>)}
        </div>
      </nav>
    </header>
    </>
  );
}
