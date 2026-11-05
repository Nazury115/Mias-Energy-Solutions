# Image sources

Date: 2026-10-21. Two kinds of imagery are used, and they must not be mixed up.

## Illustrative stock photography (`public/images/stock/`)

Used for large, atmospheric spots (homepage hero, service visuals, detail heroes, About banner and the fictional story previews). These are **not** Mias work and must never be captioned or described as Mias projects, customers, staff or locations.

All are free under the [Unsplash License](https://unsplash.com/license): commercial use allowed, attribution not required, no reselling of unaltered copies. Downloaded from `images.unsplash.com` at the sizes shown.

| File | Size | Photographer | Unsplash page | Photo location (per Unsplash) |
| --- | --- | --- | --- | --- |
| `hero-solar-field.jpg` | 2400×1597 | American Public Power Association | [513dBrMJ_5w](https://unsplash.com/photos/solar-panels-on-green-field-513dBrMJ_5w) | Indiana, United States |
| `water-pipe-flow.jpg` | 1400×2100 | Gowtham AGM | [4FL8iqLdUP4](https://unsplash.com/photos/4FL8iqLdUP4) | Tamil Nadu, India |
| `electrical-panel-testing.jpg` | 2400×1800 | Toolmash Expo | [PkHf7BUWbtk](https://unsplash.com/photos/electrician-testing-electrical-panel-with-multimeter-PkHf7BUWbtk) | Not stated |
| `solar-installation.jpg` | 2400×1601 | Markus Spiske | [rNn_TU8dvoY](https://unsplash.com/photos/a-person-working-on-a-solar-panel-rNn_TU8dvoY) | Bavaria, Germany |
| `irrigation-pivot.jpg` | 1600×2400 | Karla Grobler | [cjXuvmLGMcU](https://unsplash.com/photos/cjXuvmLGMcU) | Bela-Bela, South Africa |
| `irrigated-valley-aerial.jpg` | 2000×1385 | Wynand Uys | [CgDZmgOBBu8](https://unsplash.com/photos/CgDZmgOBBu8) | Ohrigstad, South Africa |

Because none of these places are in Zambia, captions over them avoid location claims.

## Map data (`src/content/zambia-map.ts`)

Province outlines come from [geoBoundaries](https://www.geoboundaries.org) gbOpen ZMB ADM1, release `9469f09`, built Dec 12, 2023. The original source is the Zambia Data Hub (2020), via zambia-nsdi-mlnr.hub.arcgis.com. The data has 10 provinces, including Muchinga, and is licensed **CC BY 4.0**; the credit is shown under the map.

- The simplified GeoJSON (743 KB) was downloaded with Henry's approval on 2026-10-21 and kept outside the repository.
- `scripts/build-province-map.py` projects it, simplifies it and writes the 29 KB module.
- To regenerate: `python -I scripts/build-province-map.py <geojson> src/content/zambia-map.ts`.

## Mias work photographs (`public/images/work/`)

Used as proof of work in the "From the field" galleries. Copies of supplied WhatsApp photos; originals stay unchanged in `Proof of service/`. Captions describe only what is visible (see [the photo inventory](proof-of-service-inventory.md)); customer, date and scope remain unconfirmed.

| File | Original (`WhatsApp Image 2026-10-19 at …`) |
| --- | --- |
| `crane-lift.jpeg` | 09.26.34 |
| `pump-station.jpeg` | 09.26.36 (1) |
| `booster-set.jpeg` | 09.26.29 (1) |
| `rooftop-solar.jpeg` | 09.26.22 (1) |
| `control-panel.jpeg` | 09.26.24, cropped to rows 50–770 to remove the photographer's feet |
| `inverter-batteries.jpeg` | 09.26.21 (1) |
| `tank-equipment.jpeg` | 09.26.26 (1) |
| `vertical-pumps.jpeg` | 09.26.25 |
| `manifold-install.jpeg` | 09.26.31 |
| `pumps-and-panel.jpeg` | 09.26.26 |
| `site-lifting.jpeg` | 09.26.33 (1) |
| `tank-equipment-close.jpeg` | 09.26.27 |
| `pumping-set.jpeg` | 09.26.22 |
| `manifold-wide.jpeg` | 09.26.34 (1) |
| `pipe-assemblies.jpeg` | 09.26.35 |

Not used: 09.26.20 (soft), 09.26.32 (posed, identifiable person), 09.26.37 (repeats the indoor pump station) and other near-duplicate views.

Several photos show workers. Before public launch, confirm permission for people and client premises shown, as required in [the asset notes](003-assets-and-preview.md).

## Staff-managed publication photos (increment 009)

Each runtime upload is registered in the private `publication_images` inventory with its ID, draft association, source, description, permission evidence, uploader and date. The staff editor displays that inventory. Images are JPEG publication copies with metadata removed. The raw job-file store and `Proof of service/` remain separate.

The source and permission fields contain private review evidence and stay out of the public response and Git. A public image address is `/media/publishing/<registered-image-id>`. Only a currently published snapshot can authorize that response. The corresponding private preview requires Staff or Owner access.
