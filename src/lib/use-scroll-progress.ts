"use client";
import { useEffect, type RefObject } from "react";

// Writes scroll progress (0–1) to the element's --progress CSS variable without re-rendering.
// "pin": progress through a tall section whose sticky child stays on screen.
// "read": progress while the element travels through the middle of the viewport.
// "pass": progress from the element entering at the bottom to leaving at the top.
export function useScrollProgress(ref: RefObject<HTMLElement | null>, mode: "pin" | "read" | "pass" = "pin") {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const { top, height } = element.getBoundingClientRect();
      const viewport = window.innerHeight;
      const [travelled, distance] = mode === "pin" ? [-top, height - viewport]
        : mode === "read" ? [viewport * .85 - top, height + viewport * .4] : [viewport - top, height + viewport];
      const progress = distance > 0 ? Math.min(1, Math.max(0, travelled / distance)) : 1;
      element.style.setProperty("--progress", progress.toFixed(4));
    };
    const schedule = () => { frame ||= requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ref, mode]);
}
