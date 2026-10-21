# Increment 005 — public-site completion and Zambia coverage map

Status: **Approved by Henry on 2026-10-21, with the recommended answers to decisions D-1 to D-6.** Next step: the implementation/test plan. Nothing in this file is implemented yet.

Builds on: increment 003 ([spec](003-public-website.md)), increment 004 (the scroll-driven redesign; see [CHANGELOG](../CHANGELOG.md)), the [expansion spec](002-business-platform-expansion.md) requirements PUB-03, 05, 06, 07, 09 and 10, and [feature backlog](../docs/plans/feature-backlog.md) §2.

## Outcome and scope

Finish the public website so it can show real evidence of Mias's work across Zambia, without adding a backend:

1. **Coverage map:** an interactive map of Zambia's 10 provinces on the Projects page, showing where Mias has recorded projects.
2. **Project records:** one structured, validated source of approved real projects. It feeds both the map and real case studies.
3. **Real case studies:** published from complete records, alongside the fictional previews, which remain preview-only.
4. **Contact page and 404** brought into the 004 design, with the map able to pre-fill the project area.
5. **Israel's portrait/bio and confirmed working hours**, displayed only once supplied and approved.
6. **Search and sharing groundwork:** sitemap, robots rules, Open Graph previews and LocalBusiness structured data limited to confirmed facts.
7. **Real high-resolution photos** replacing stock imagery where Mias supplies suitable, permitted photos.

Items 5 and 7 depend entirely on business inputs (see the inputs table below). The increment is complete when the behaviour for both cases (input supplied or not) works as specified; it does not wait for every input.

The site stays a local preview with `noindex`. There is no deployment, database, account system, form backend, analytics or paid map service.

### Projects page after this increment

In order (adjustable during design review):

1. Intro.
2. Coverage map with its province list.
3. Verified case studies, if any exist.
4. "From the field" work photos.
5. Fictional story previews, in preview mode only.

## Zambia's provinces

The map and all records use exactly these 10 names: **Central, Copperbelt, Eastern, Luapula, Lusaka, Muchinga, Northern, North-Western, Southern, Western**. Muchinga was created in 2011, so any boundary source must post-date that change.

## Acceptance criteria

### Project records

| ID | Observable result |
| --- | --- |
| REC-01 | Approved real projects live in one structured content source. Every record has a unique id, a province from the list above, a service family (water / electrical / renewable-energy), and an approval source and date. Optional fields: town/area, year, title, summary, customer name, photos, and story fields (problem, work done, outcome). |
| REC-02 | A customer name appears only when the record states permission to publish it. Photos may reference only files in `public/images/work/` that exist. |
| REC-03 | Invalid records fail an automated test rather than rendering silently. This covers an unknown province or family, a missing approval, a duplicate id, a customer name without permission, and a missing photo file. |
| REC-04 | Fictional stories are not project records. They never count toward the map and are never assigned a province. |

### Coverage map

| ID | Observable result |
| --- | --- |
| MAP-01 | The map shows all 10 provinces with correct, current boundaries and names, and marks Lusaka as Mias's base. The boundary source and its licence are recorded in the docs. Any attribution the licence requires is visible near the map. |
| MAP-02 | Province counts are computed only from approved records, plus owner-confirmed province totals if decision D-2 allows them; those totals are labelled with who confirmed them and when. Provinces with nothing recorded say "No recorded projects yet". No estimates or "100+" style figures appear. A headline such as "Projects recorded in N of 10 provinces" is computed, not typed. |
| MAP-03 | Shading uses a legend with at least four steps. Colour is never the only carrier of information: counts also appear as text, and the selected province is distinguishable without colour. |
| MAP-04 | Pointer hover, tap or keyboard selection of a province opens a detail panel. It shows the province name, recorded count, service mix, and towns or years where recorded. It links to that province's verified case studies (if any) and to "Discuss a project in [province]", which opens Contact with the area pre-filled (CON-03). |
| MAP-05 | An equivalent list or table of all 10 provinces, with the same counts, is always present. Selecting a province in the list selects it on the map. Each province is reachable and announced by keyboard and screen reader. |
| MAP-06 | When the map scrolls into view, provinces fill in one after another and the headline counts up. With reduced motion, everything appears static and complete. Neither version shifts the surrounding layout. |
| MAP-07 | No horizontal overflow at 320, 390, 768, 1366 and 1440 px. On phones the list is the primary control and the map is at least 280 px wide. |
| MAP-08 | The map is inline SVG generated ahead of time and committed, with no map service, external tiles, API key or tracking. Its size stays small enough not to slow the page noticeably (target under 100 KB uncompressed). |
| MAP-09 | If decision D-3 allows it, sample data may appear in preview mode until real records exist. It must be labelled on the map as "Sample data — not real projects" and never mixed with real records. It never appears when `MIAS_PUBLIC_LAUNCH=true`. In launch mode with no real records, the map section is omitted. |

### Case studies

| ID | Observable result |
| --- | --- |
| CASE-01 | A record with complete story fields and the required permissions publishes as a case study at `/projects/<slug>`. It has no fictional labelling, and shows province/area, service, year if recorded, photos with factual captions, and the problem, work done and outcome. |
| CASE-02 | The Projects page lists verified case studies before the fictional previews and visually separate from them. In launch mode only verified case studies appear. If there are none, the stories section is omitted while the map and work photos remain. |
| CASE-03 | Case-study photos open in the existing full-screen viewer. Captions describe only confirmed facts. |

### Contact page and 404

| ID | Observable result |
| --- | --- |
| CON-01 | Contact uses the 004 design: large intro, and large tappable cards for Call, WhatsApp and Email that each show the destination. The inquiry composer is restyled. A coverage note ("Based in Lusaka; projects across Zambia by arrangement") links to the map. Hours appear only when HRS-01 is satisfied. |
| CON-02 | All existing composer behaviour (WEB-07, WEB-08) is unchanged, and the existing contact tests pass without modification. |
| CON-03 | `/contact?area=<province>` pre-fills Project area with that province name when the value matches one of the 10 provinces (case-insensitive). Any other value is ignored. It can be combined with the existing `service` parameter. |
| ERR-01 | The 404 page uses the 004 design. It explains that the page wasn't found, links to Home, Services, Projects and Contact, keeps the HTTP 404 status and stays `noindex`. |

### People, hours and imagery

| ID | Observable result |
| --- | --- |
| PROF-01 | Once an approved portrait and short bio are supplied, About and the homepage leadership card show the portrait, with alt text naming Israel and his role, and the bio word for word as approved. Until then the "IM" monogram remains. No generated likeness is ever used. |
| HRS-01 | Once working days and hours are confirmed, they appear on Contact, in the footer and in structured data, stated in Zambia time (CAT, UTC+2). Until then, hours are omitted everywhere. |
| IMG-01 | Real photos supplied with permission, and roughly 2000 px or more on the long edge, replace stock images in the hero, service and banner spots they suit. Captions become factual and `docs/content/image-sources.md` is updated. Stock stays only where no suitable real photo exists, and is still never captioned as Mias work. |

### Search and sharing groundwork

| ID | Observable result |
| --- | --- |
| SEO-01 | `/sitemap.xml` lists every publishable route and excludes fictional stories when `MIAS_PUBLIC_LAUNCH=true`. Absolute URLs use a configured site address. Without one, the sitemap uses the local preview origin and is not treated as a launch artifact. |
| SEO-02 | `/robots.txt` blocks all crawling while the site is a preview. Switching it for launch is documented and deferred to the launch increment. Existing `noindex` metadata stays. |
| SEO-03 | Every page has Open Graph and Twitter title, description and a share image. The share image is built from brand assets (logo, colours, tagline), not from a stock photo that could be mistaken for Mias work. |
| SEO-04 | Home includes LocalBusiness structured data with confirmed facts only: name, phone, email, area served (Lusaka and Zambia) and logo. It omits address, hours (until HRS-01), ratings, reviews and prices. Its values match the visible page. |

### Quality

| ID | Observable result |
| --- | --- |
| QA-01 | Following the SDD process, tests are written and their expected failures recorded before implementation. Then the full pytest suite, type check and production build pass. Browser checks run at 320, 390, 768, 1366 and 1440 px, keyboard-only and with reduced motion. The CHANGELOG, image/data source docs and README are updated. Anything unfinished, such as an input not yet supplied, is listed explicitly. |

## Inputs and what happens without them

| Input from Henry/Israel | Unlocks | If not supplied |
| --- | --- | --- |
| Project list: one row per project with province and service, optionally town, year and customer with permission | Real map data, MAP-02 | Sample map in preview if D-3 allows; map omitted in launch mode |
| Owner-confirmed totals per province, if itemising every job is impractical | Fuller counts, if D-2 allows | Counts come from itemised records only |
| 1–3 complete project records using the [project record template](../docs/content/business-intake.md#project-record-template), plus a province field | Real case studies (CASE-01) | Fictional previews stay preview-only; no stories in launch mode |
| Israel's approved portrait and short bio | PROF-01 | Monogram stays |
| Confirmed working days and hours | HRS-01 | Hours omitted |
| Full-resolution photos with permission (sent in WhatsApp "as Document") | IMG-01 | Stock stays in hero/service spots |
| Permission for people and premises visible in the 15 work photos | Launch readiness of the gallery | Gallery remains preview-only content |
| Site domain, if already chosen | Correct absolute URLs in SEO-01/03 | Local preview origin is used |

## Open decisions for Henry

| ID | Decision | Recommendation |
| --- | --- | --- |
| D-1 | Province boundary source | An openly licensed admin-1 (province) dataset that includes Muchinga and permits commercial use with attribution, for example geoBoundaries or the OCHA/HDX Zambia boundaries. Confirm the licence during planning, then simplify the shapes to one SVG. |
| D-2 | Allow owner-confirmed province totals in addition to itemised records? | **Yes.** Label them "Confirmed by Mias Energy Solutions, [month year]". A total must never be lower than the itemised count for that province. |
| D-3 | Show a clearly labelled sample map in preview before real data arrives? | **Yes**, so the design can be reviewed now. It is automatically hidden in launch mode. |
| D-4 | Where the map appears | On Projects. Add a compact homepage teaser linking to it once real data exists. |
| D-5 | Province detail: a panel on the page, or separate province pages? | A panel now. Separate pages (useful for search, e.g. "solar installation Copperbelt") can come later. |
| D-6 | Show project years? | Only where recorded. Never infer them from photo filenames. |

## Explicit limits

This increment excludes:

- A backend inquiry form, email delivery and stored requests (increment 006).
- Accounts or logins (007).
- A staff editor; records are edited in the repository until increment 009.
- Testimonials, unless genuine approved quotes are separately supplied and approved.
- Per-province pages.
- Deployment, a domain or analytics.
- Any paid or external map service.

The `MIAS_PUBLIC_LAUNCH` flag continues to hide fictional content but does not itself approve launch or remove `noindex`.

## Approval record

| Date | Record |
| --- | --- |
| 2026-10-21 | Henry proposed a province coverage map, noting projects in the Copperbelt, Southern, Western, North-Western, Muchinga and Luapula provinces and across all provinces. He asked for the step-1 spec to be written. |
| 2026-10-21 | Henry approved this spec with the recommended answers. D-1: openly licensed boundary data including Muchinga, licence confirmed during planning. D-2: owner-confirmed province totals allowed, labelled. D-3: labelled sample map in preview only. D-4: Projects page, plus a homepage teaser once real data exists. D-5: detail panel now, province pages later. D-6: years only where recorded. |
