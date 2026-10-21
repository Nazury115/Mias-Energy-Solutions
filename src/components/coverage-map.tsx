"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { shadeLevel, shadeRanges, type Coverage, type Province, type ProjectFamily } from "@/lib/coverage";
import { zambiaMap } from "@/content/zambia-map";

const familyLabels: Record<ProjectFamily, string> = { water: "Water", electrical: "Electrical", "renewable-energy": "Renewable energy" };

// Province map of Zambia: shading, a detail panel and an equivalent list that keyboard and screen-reader users drive.
// Hovering only shows a floating label; the panel changes on click, tap or keyboard selection so it never shifts under the pointer.
export function CoverageMap({ coverage }: { coverage: Coverage }) {
  const ranked = [...coverage.provinces].sort((a, b) => b.projects - a.projects || a.province.localeCompare(b.province));
  const [selected, setSelected] = useState<Province>(ranked[0].province);
  const [hovered, setHovered] = useState<{ province: Province; x: number; y: number; flip: boolean } | null>(null);
  const [drawn, setDrawn] = useState(true);
  const [shown, setShown] = useState({ covered: coverage.covered, total: coverage.total });
  const root = useRef<HTMLDivElement>(null);
  const figure = useRef<HTMLDivElement>(null);
  const sample = coverage.mode === "sample";
  const byName = Object.fromEntries(coverage.provinces.map(item => [item.province, item]));
  const order = Object.fromEntries(ranked.map((item, index) => [item.province, index]));
  const active = byName[selected];
  const confirmation = coverage.provinces.filter(item => item.confirmedBy).sort((a, b) => (b.confirmedOn ?? "").localeCompare(a.confirmedOn ?? ""))[0];

  // Below the fold: provinces fill in one by one and the headline counts up when the map arrives.
  useEffect(() => {
    const element = root.current;
    if (!element || matchMedia("(prefers-reduced-motion: reduce)").matches || element.getBoundingClientRect().top < innerHeight * .8) return;
    let frame = 0;
    setDrawn(false);
    setShown({ covered: 0, total: 0 });
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      setDrawn(true);
      const start = performance.now();
      const tick = (now: number) => {
        const eased = 1 - Math.pow(1 - Math.min(1, (now - start) / 1400), 3);
        setShown({ covered: Math.round(coverage.covered * eased), total: Math.round(coverage.total * eased) });
        if (eased < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: .3 });
    observer.observe(element);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [coverage.covered, coverage.total]);

  const [cityX, cityY] = zambiaMap.lusakaCity;
  const selectedShape = zambiaMap.provinces.find(shape => shape.name === selected);
  const families = (Object.keys(familyLabels) as ProjectFamily[]).filter(family => active.services[family]);

  return <div ref={root} className={drawn ? "coverage is-drawn" : "coverage"}>
    <div ref={figure} className="coverage-figure">
      <p className="coverage-headline">Projects recorded in <strong>{shown.covered}</strong> of 10 provinces</p>
      <p className="coverage-subline">{sample ? `${shown.total} sample projects across Zambia` : `${shown.total} projects across Zambia`}{confirmation ? ` · Counts confirmed by ${confirmation.confirmedBy}, ${confirmation.confirmedOn}` : ""}</p>
      {sample && <p className="sample-badge">Sample data — not real projects</p>}
      <svg className="coverage-map" viewBox={zambiaMap.viewBox} role="img" aria-label="Map of Zambia's ten provinces, shaded by recorded projects. The same figures are in the province list.">
        {zambiaMap.provinces.map(shape => <path key={shape.name} d={shape.path} data-province={shape.name}
          data-level={shadeLevel(byName[shape.name].projects, coverage.max)} data-selected={selected === shape.name}
          style={{ "--order": order[shape.name] } as CSSProperties}
          onClick={() => setSelected(shape.name)} onPointerLeave={() => setHovered(null)}
          onPointerMove={event => { const box = figure.current!.getBoundingClientRect(); setHovered({ province: shape.name, x: event.clientX - box.left, y: event.clientY - box.top, flip: event.clientX - box.left > box.width * .55 }); }} />)}
        {selectedShape && <path className="coverage-outline" d={selectedShape.path} aria-hidden="true" />}
        {zambiaMap.provinces.filter(shape => shape.name !== "Lusaka").map(shape => <text key={shape.name} className="province-label" x={shape.label[0]} y={shape.label[1]}
          data-level={shadeLevel(byName[shape.name].projects, coverage.max)} aria-hidden="true">{shape.name}</text>)}
        <g className="base-marker" transform={`translate(${cityX} ${cityY})`} aria-hidden="true">
          <circle className="base-pulse" r="14" /><circle r="9" /><text x="16" y="-12">Lusaka · our base</text>
        </g>
      </svg>
      {hovered && <p className={hovered.flip ? "map-tooltip is-flipped" : "map-tooltip"} style={{ left: hovered.x, top: hovered.y }} aria-hidden="true">
        <strong>{hovered.province}</strong> {byName[hovered.province].projects || "No"} {sample ? "sample projects" : "projects recorded"}</p>}
      <ul className="coverage-legend" aria-label="Shading key">
        <li><span className="swatch" data-level="0" />No recorded projects yet</li>
        {shadeRanges(coverage.max).map(range => <li key={range.level}><span className="swatch" data-level={range.level} />{range.from === range.to ? range.from : `${range.from}–${range.to}`}</li>)}
      </ul>
      <p className="map-credit">Boundaries: <a href="https://www.geoboundaries.org" rel="noopener noreferrer">geoBoundaries</a> (Zambia Data Hub, 2020), CC BY 4.0</p>
    </div>

    <div className="coverage-side">
      <div className="province-panel" data-province-panel aria-live="polite">
        <p className="eyebrow">{active.province === "Lusaka" ? "OUR BASE" : "PROVINCE"}{sample ? " · SAMPLE DATA" : ""}</p>
        <h3>{active.province}</h3>
        <p className="panel-count">{active.projects ? <><strong>{active.projects}</strong> {sample ? "sample projects" : "projects recorded"}</> : "No recorded projects yet"}</p>
        {families.length > 0 && <ul className="service-mix">{families.map(family => <li key={family}>
          <span>{familyLabels[family]}</span><span className="mix-bar"><span style={{ width: `${(100 * active.services[family]!) / active.projects}%` }} /></span><strong>{active.services[family]}</strong>
        </li>)}</ul>}
        {active.areas.length > 0 && <p className="panel-detail"><span>Areas</span>{active.areas.join(", ")}</p>}
        {active.years.length > 0 && <p className="panel-detail"><span>Years</span>{active.years.join(", ")}</p>}
        {active.stories.length > 0 && <p className="panel-detail"><span>Stories</span>{active.stories.map((story, index) => <span key={story.slug}>{index ? ", " : ""}<a href={`/projects/${story.slug}`}>{story.title}</a></span>)}</p>}
        <a className="button" href={`/contact?area=${encodeURIComponent(active.province)}`}>Discuss a project in {active.province} <span aria-hidden="true">↗</span></a>
      </div>
      <ol className="province-list" aria-label="Provinces by recorded projects">
        {ranked.map(item => <li key={item.province}>
          <button type="button" data-province-option={item.province} aria-pressed={selected === item.province}
            onClick={() => setSelected(item.province)}>
            <span className="swatch" data-level={shadeLevel(item.projects, coverage.max)} aria-hidden="true" />
            <span>{item.province}</span><span className="province-count">{item.projects}<span className="visually-hidden"> {sample ? "sample projects" : "projects"}</span></span>
          </button>
        </li>)}
      </ol>
    </div>
  </div>;
}
