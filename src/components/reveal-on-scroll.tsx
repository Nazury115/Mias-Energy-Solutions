"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Fades [data-reveal] elements (and children of [data-reveal-group]) in as they enter the viewport.
// Content stays visible without JavaScript or with reduced motion, because hiding depends on .motion-ready.
export function RevealOnScroll() {
  const pathname = usePathname();
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.documentElement.classList.add("motion-ready");
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }), { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll("[data-reveal]:not(.is-visible), [data-reveal-group] > :not(.is-visible)").forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, [pathname]);
  return null;
}
