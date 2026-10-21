# Public preview — assets, content and publishing boundary

Date: 2026-10-19. See [Increment 003](../../specs/003-public-website.md).

## Asset provenance

| Local asset | Source and meaning |
| --- | --- |
| `docs/assets/mias-original-logo.png` | User's attached existing logo, preserved unchanged. |
| `public/brand/mias-logo-concept.png` | New concept created with the built-in image-generation tool from the supplied logo. Blue/yellow identity and the energy mark retained; upright typography replaces the compressed italic text. Reviewable, not final brand approval. |
| `public/images/work/`, `public/images/stock/` | Supplied work photos (proof) and illustrative Unsplash photos. Superseded the four single copies on 2026-10-21; see [image sources](image-sources.md). |

Original photographs remain in `Proof of service/`. Next Image generates appropriately sized browser assets. CSS crops select a viewing window; the source copies are not retouched. Public launch still requires permission review for premises/people and removal of unnecessary metadata. These photos do not identify the fictional example projects.

## Logo prompt and method

Built-in image generation, transparent-background edit using the user's attachment. Final prompt:

> Use case: logo-brand. Edit the supplied Mias Energy Solutions logo into one refined, professional, very legible horizontal website logo on a truly transparent background. Preserve the business identity and blue/yellow palette and recognizable yellow lightning/energy mark. Modernize the typography to confident upright geometric sans-serif, not italic, with strong spacing. A simple yellow lightning mark at left, then large blue 'MIAS' on the top line and smaller widely spaced blue 'ENERGY SOLUTIONS' below. Exact words only: 'MIAS' and 'ENERGY SOLUTIONS'. Omit the tiny tagline for header legibility. Flat solid royal blue #0759B9 and golden yellow #F4C71E, no gradients, no shadows, no 3D, no mockup, no extra symbols, no watermarks. Tight balanced horizontal lockup with modest transparent margins, roughly 3:1 composition. One logo concept only, not a sheet of alternatives. It must look appropriate for an established water, solar and electrical engineering business in Zambia.

Generated source: `C:\Users\nazur\.codex\generated_images\01a09dbf-6acd-7f93-b25d-0d7c27b5afc0\exec-c8123229-1d82-494b-a120-1fa4eca56dc2.png`. The application references the workspace copy, not that external path. The image is a raster concept; a final production brand package may later need approved vector artwork.

## Content rules

- Customer names are a user-supplied partial list. No customer logos, partnership claims, reviews or counts are invented.
- Three example stories are fictional, not completed projects. Their photo captions explicitly say the photos are not verified as those examples. No real customer is associated with a demo.
- Set `MIAS_PUBLIC_LAUNCH=true` before a public-ready build to exclude fictional stories. Replace demos with verified records; never relabel a fictional story as real. This guard does not itself approve deployment or change noindex.
- Israel's approved phone/email/WhatsApp are configured centrally. Henry's private contact details and the uncreated company email do not enter the application content.
- There is no portrait of Israel yet; initials are a text monogram, not a generated likeness.

## Future staff publishing requirement

The requested company-portal content editor is recorded as CMS-01 in the expansion spec. It should let authorized staff add images/descriptions, draft case studies and manage genuine testimonials, with preview/publish/unpublish controls and an approval record. Private customer-job attachments must never automatically become public gallery images. No portal/editor or data store has been implemented in this increment.
