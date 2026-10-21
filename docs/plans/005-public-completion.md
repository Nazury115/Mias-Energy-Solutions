# Increment 005 — implementation and test plan

Date: 2026-10-21. Implements [spec 005](../../specs/005-public-completion-and-coverage-map.md) (approved, plus the amendment recorded there on the same date). Henry asked to start building with sample data, so the plan is short.

## Data flow

```text
scripts/build-province-map.py ──(one-off, from geoBoundaries GeoJSON)──▶ src/content/zambia-map.ts   (SVG paths)
src/content/projects.ts  (ALL sample/real project content: province totals + project stories)
        │  validated at import by src/lib/coverage.ts › validateProjectContent  → build/page fails on bad data
        ▼
src/lib/coverage.ts › buildCoverage(totals, stories, publicLaunch)  → per-province counts, shading, mode
        ▼
src/components/coverage-map.tsx  (client: SVG map, legend, detail panel, accessible list, scroll-in fill)
        ▼
/projects#coverage   → "Discuss a project in X" → /contact?area=X  (matchProvince validates the value)
```

Rules that keep the sample honest:

- If any real (non-sample) total or story exists, every sample item is excluded from the map, so sample and real data are never mixed.
- With only sample data, the map is labelled "Sample data — not real projects" in preview and omitted when `MIAS_PUBLIC_LAUNCH=true`.

## Files

| Area | Files |
| --- | --- |
| Records and map | `src/content/projects.ts` (moved `projectStories` here with sample provinces; new `provinceTotals`), `src/lib/coverage.ts` (pure: provinces, `buildCoverage`, `shadeLevel`, `validateProjectContent`, `matchProvince`), `src/content/zambia-map.ts` (generated), `src/components/coverage-map.tsx` |
| Pages | `src/app/projects/page.tsx` (coverage section; verified stories before previews), `src/app/projects/[slug]/page.tsx` (real vs fictional template), `src/app/contact/page.tsx` + `inquiry-composer.tsx` (`area` prefill, redesign), `src/app/not-found.tsx` |
| People/hours | `src/content/site.ts` (`operatingHours`, `leadership` — both `null` until supplied), About + homepage card, footer, Contact |
| Search/sharing | `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/opengraph-image.tsx`, `src/lib/site-metadata.ts` (per-page Open Graph helper), `src/lib/structured-data.ts` (LocalBusiness JSON-LD) |

## Tests (written before implementation)

| Test | Type | Requirements |
| --- | --- | --- |
| `test_coverage_units.py`: province list, sample/real/launch modes, no mixing, max(total, itemised), shade bins, validation cases, `matchProvince` | unit | REC-01–04, MAP-02, MAP-03, MAP-09, CON-03 |
| `test_coverage_pages.py`: map markup (10 provinces + 10 list options, sample label, attribution, headline) | integration | MAP-01, 02, 05, 09 |
| same file: `?area=` prefill accepted/ignored | integration | CON-03 |
| same file: sitemap, robots, Open Graph/Twitter tags on every route, LocalBusiness JSON-LD content | integration | SEO-01–04, HRS-01 |
| same file: 404 links to Home/Services/Projects/Contact | integration | ERR-01 |
| same file: keyboard selection via list, map click selection sync, panel → contact handoff | browser | MAP-04, MAP-05, CON-03 |
| existing suite (contact composer, reflow at 5 widths, fictional labels, filters) | all | CON-02, MAP-07, QA-01 |

Not automatable here (recorded in results): visual review of the map shape and colours, real case-study rendering (no real record exists yet), portrait/bio and hours rendering until inputs arrive.
