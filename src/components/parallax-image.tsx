"use client";
import Image from "next/image";
import { useRef, type ReactNode } from "react";
import { useScrollProgress } from "@/lib/use-scroll-progress";

// The photo drifts and settles slightly as the frame scrolls past, so large imagery feels alive.
export function ParallaxImage({ src, alt, sizes, className = "", priority = false, children }: {
  src: string; alt: string; sizes: string; className?: string; priority?: boolean; children?: ReactNode;
}) {
  const figure = useRef<HTMLElement>(null);
  useScrollProgress(figure, "pass");
  return <figure ref={figure} className={`parallax-image ${className}`}>
    <Image src={src} alt={alt} unoptimized={src.startsWith("/media/")} fill sizes={sizes} priority={priority} />
    {children}
  </figure>;
}
