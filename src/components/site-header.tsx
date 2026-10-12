"use client";

import { useEffect, useRef, useState } from "react";
import { business, navigation } from "@/content/site";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);

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

  return (
    <header className="site-header">
      <div className="site-container header-inner">
        <a className="brand" href="/" aria-label={`${business.name} home`}>
          <span className="brand-symbol" aria-hidden="true"><span /><span /><span /><span /></span>
          <span className="brand-wordmark"><strong>mias<span>.</span></strong><small>ENERGY SOLUTIONS</small></span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navigation.map(item => <a key={item.href} href={item.href}>{item.label}</a>)}
        </nav>
        <a href="/#contact" className="button button-small header-cta">Let’s talk <span aria-hidden="true">↗</span></a>
        <button ref={toggle} type="button" className="menu-toggle" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(!open)}>
          <span className="menu-lines" aria-hidden="true" />
        </button>
      </div>
      <nav id="mobile-navigation" className="mobile-panel" aria-label="Mobile navigation" hidden={!open}>
        <div className="site-container">
          {navigation.map(item => <a key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}<span aria-hidden="true">↗</span></a>)}
        </div>
      </nav>
    </header>
  );
}
