"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import type { WorkPhoto } from "@/content/site";

// Real site photos shown at sizes that suit them, with a full-screen viewer that never enlarges past the original.
// "grid" packs a curated set into a mosaic; "strip" is a swipeable row that suits any number of photos.
export function WorkGallery({ photos, layout = "grid" }: { photos: WorkPhoto[]; layout?: "grid" | "strip" }) {
  const viewer = useRef<HTMLDialogElement>(null);
  const strip = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState<number | null>(null);
  const open = (photo: number) => { setIndex(photo); viewer.current?.showModal(); };
  const step = (delta: number) => setIndex(current => current === null ? null : (current + delta + photos.length) % photos.length);
  const current = index === null ? null : photos[index];
  const scroll = (direction: number) => strip.current?.scrollBy({ left: direction * strip.current.clientWidth * .8, behavior: "smooth" });
  const tiles = photos.map((photo, photoIndex) => <li key={photo.src} className={`work-tile work-${photo.shape}`}
    style={layout === "strip" ? { aspectRatio: Math.min(1.8, Math.max(.72, photo.width / photo.height)) } : undefined}>
    <a href={photo.src} data-work-photo onClick={event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      open(photoIndex);
    }} aria-label={`View photo: ${photo.caption}`}>
      <Image src={photo.src} alt={`${photo.caption}, from a Mias work site.`} fill sizes="(max-width: 767px) 100vw, 50vw" />
      <span className="work-caption" aria-hidden="true">{photo.caption}</span>
    </a>
  </li>);

  return <>
    {layout === "grid" ? <ul className="work-grid" data-reveal-group>{tiles}</ul> : <div className="work-strip" data-reveal>
      <ul ref={strip}>{tiles}</ul>
      {photos.length > 3 && <div className="work-strip-controls">
        <button type="button" onClick={() => scroll(-1)} aria-label="Scroll photos back">←</button>
        <button type="button" onClick={() => scroll(1)} aria-label="Scroll photos forward">→</button>
      </div>}
    </div>}
    <dialog ref={viewer} className="work-viewer" aria-label="Work photo viewer" onClose={() => setIndex(null)}
      onClick={event => { if (event.target === event.currentTarget) viewer.current?.close(); }}
      onKeyDown={event => { if (event.key === "ArrowRight") step(1); if (event.key === "ArrowLeft") step(-1); }}>
      {current && <figure>
        <Image src={current.src} alt={`${current.caption}, from a Mias work site.`} width={current.width} height={current.height} sizes={`(max-width: ${current.width}px) 92vw, ${current.width}px`} />
        <figcaption><span>{index! + 1} / {photos.length}</span>{current.caption}</figcaption>
      </figure>}
      <button type="button" className="viewer-close" onClick={() => viewer.current?.close()} aria-label="Close photo viewer">×</button>
      <button type="button" className="viewer-step viewer-prev" onClick={() => step(-1)} aria-label="Previous photo">←</button>
      <button type="button" className="viewer-step viewer-next" onClick={() => step(1)} aria-label="Next photo">→</button>
    </dialog>
  </>;
}
