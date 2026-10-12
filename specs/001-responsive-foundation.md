# Increment 001 — responsive website foundation

Status: Approved baseline scope; implementation authorized by the developer on 2026-10-12.

This file details the already-approved first responsive website milestone. It introduces no additional services, external integrations, or production deployment.

## Objective

Provide the first runnable website preview so the developer can review the visual direction, laptop and phone usability, service presentation, and navigation.

## Included

- One homepage with a header, hero, service overview, company introduction, contact entry point, and footer.
- In-page navigation to existing homepage sections. Full service, About, project, and contact routes remain future increments.
- Content based on the business name, Lusaka location, service list, and audiences provided in the master brief.
- A clearly identified infrastructure illustration; it must not imply a real completed project.
- An honest contact unavailable state while business phone, WhatsApp, and email are unconfirmed. No inquiry submission or personal-data collection.
- A shared typed content source and a small contact-link function that excludes missing or malformed destinations.
- Responsive styling, semantic landmarks, keyboard access, visible focus, and descriptive page metadata.
- Preview `noindex, nofollow` metadata until production content and launch are approved.

## Acceptance criteria

| ID | Observable behavior | Baseline trace |
| --- | --- | --- |
| FND-01 | `/` serves a page identifying Mias Energy Solutions and Lusaka, Zambia, with one main heading and a descriptive title/description. | FR-01, FR-13 |
| FND-02 | The service overview covers all supplied core services, without fabricated credentials, testimonials, prices, warranties, or project results. | FR-02, FR-04, FR-15 |
| FND-03 | Header navigation and primary/final contact entry points reach real sections. Mobile navigation is accessible by keyboard and touch and closes after selection. | FR-07, NFR-02, NFR-08 |
| FND-04 | Unknown contact destinations produce no phone, WhatsApp, or email links. The contact section clearly explains that contact details are awaiting confirmation and does not collect or pretend to send data. | FR-08, FR-15, NFR-06 |
| FND-05 | The actual contact-link function excludes blank/invalid values, creates correct URLs for valid test destinations, and safely encodes inquiry context. Test destinations are fixtures, never company facts. | FR-08, NFR-04 |
| FND-06 | All main sections remain available at 320, 390, 768, 1366, and 1440 CSS pixels without horizontal overflow. Controls and copy remain usable on phone and laptop layouts. | NFR-01, NFR-08 |
| FND-07 | Skip link, landmarks, heading order, visible keyboard focus, labelled navigation toggle, Escape-to-close, and appropriate illustration text alternatives are present. | NFR-02 |
| FND-08 | Preview prevents indexing, missing routes return 404 with a route home, and decorative visuals use local assets without third-party tracking or font requests. | FR-13, FR-15, NFR-06 |
| FND-09 | Pytest tests are defined and their initial failures validated before website feature implementation. Passing final tests, TypeScript checks, production build, setup instructions, and limitations are recorded. | Section 9, NFR-07 |

## Explicit limits

This increment is a preview rather than a launch-ready lead platform. The final MVP still needs individual pages, approved photographs/project material, real contact details, secure inquiry processing, complete SEO and launch QA. The proposed palette and text logo are reviewable design choices, not confirmed company branding. Lighthouse scores, full WCAG conformance, real inquiry delivery, 200% zoom, and physical Android testing are not implied by automated viewport checks.
