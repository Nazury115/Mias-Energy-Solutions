# Increment 005 — verification results

Date: 2026-10-21. Scope: [spec 005](../../specs/005-public-completion-and-coverage-map.md), including its 2026-10-21 amendment, built with sample data. Red phase: [005-red-phase.md](005-red-phase.md).

## Automated

| Check | Result |
| --- | --- |
| Full pytest suite against the dev server | **115 passed** (66 earlier + 49 new) |
| `tsc --noEmit` | clean |
| `next build --webpack` | succeeds; new routes `/sitemap.xml`, `/robots.txt`, `/opengraph-image` |
| Launch mode (`MIAS_PUBLIC_LAUNCH=true` production build on port 3100) | `/projects` has no `#coverage` section, no "Sample data" label and no fictional stories; the work gallery remains; the sitemap omits demo stories; `/projects/home-water-pressure` returns 404 |

Defects found by the new tests during implementation, and fixed:

1. **Missing share image.** Inner pages had no `og:image`, because a page's own `openGraph` replaces the inherited file-based image. The shared helper now names the image explicitly.
2. **Panel changed on hover.** Hovering changed the detail panel, so scrolling under a resting pointer silently switched it to another province, and the "Discuss a project in…" link followed. Hover now only shows a floating label; the panel changes on click, tap or keyboard selection. The spec was amended, and the test now uses exact names: "North-Western" contains "Western", which let the first version pass wrongly.

## Visual review (screenshots, Edge)

- Desktop 1440×900: the outline is correct, and the four requested provinces (Lusaka 24, Copperbelt 22, Southern 20, Western 19) are in the darkest band. Lusaka is marked as the base; the selected province has a yellow outline; the hover label flips on the right half of the map.
- Mobile 390×844 and 320×700: no horizontal overflow. Map labels are hidden, and the two-column province list is the main control.
- Contact (`?area=Copperbelt&service=water`) shows three contact cards and the pre-filled area; the 404 page shows four route cards.

## Not verified yet

- **Real case-study template.** No real story exists yet; the template renders only once `fictional: false` records are added.
- **Portrait, bio and hours rendering.** Their slots are `null` until inputs arrive. The structured-data test confirms `openingHours` is absent while hours are unconfirmed.
- Physical phones, Safari/Firefox and Lighthouse.
