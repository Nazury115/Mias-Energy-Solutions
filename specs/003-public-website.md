# Increment 003 — public website, evidence previews and contact

Status: Approved direction and implementation requested by Henry on 2026-10-19. This file bounds that request using the existing approved stack. The fictional examples are expressly requested demonstration content, not real business claims.

Implementation record: local preview implemented and tested on 2026-10-19; see [verification results](../docs/testing/003-public-website-results.md). Human visual/content review and the [knowledge check](../docs/journal/003-public-website.md) remain part of acceptance. No public launch has occurred.

## Outcome and scope

Provide a richer responsive local website: homepage, services index, three service-family pages, a shared solar-pumping detail page, projects index with category filtering, three fictional project-detail examples, About, and Contact. Add approved direct contacts and a browser-only WhatsApp inquiry composer. Keep preview `noindex, nofollow`; no public deployment or database.

Use the supplied blue/yellow logo as the branding reference. Generate a refined logo concept and preserve the original separately. This is a reviewable branding direction, not a claim of final brand approval. Use selected supplied work photographs for service imagery. In fictional stories, any supplied photo is explicitly illustrative and not verified as that story's project.

Customer names, supplied for display: Lusaka Water and Sewerage Company, Plumbfix, Family Legacy. Present these as selected customers, with no invented logos, endorsements, numbers, or association with the fictional stories. Owner/client publication permissions remain a launch check. The full list is still developing.

Israel Masauso, Director & CEO, handles business inquiries. Public phone and WhatsApp: +260977747285. Public email: imasauso@gmail.com. Do not publish Henry's private contact information or the proposed, uncreated company mailbox. Do not invent Israel's portrait/biography. Use a text-only leadership profile until an approved portrait is supplied.

## Acceptance criteria

| ID | Observable result |
| --- | --- |
| WEB-01 | Home and all named routes resolve with one main heading, meaningful titles/descriptions and preview noindex metadata. Invalid service/project slugs return 404. Navigation indicates the current section and works by keyboard and touch. |
| WEB-02 | Water, Electrical and Renewable Energy group all confirmed services. Image-backed cards link to real pages. Solar pumping links from both relevant families to one detail page. No unconfirmed service is added. |
| WEB-03 | Home shows the three supplied customer names without fabricated logos or testimonials. None is attributed to a fictional story. |
| WEB-04 | Exactly three project demos show a prominent “Fictional example” label on cards and detail pages, explain that they are not completed customer projects, and contain no fabricated client, reviewer, date, metric or certification. Photo captions distinguish supplied work imagery from the fictional scenario. |
| WEB-05 | Project category controls filter the visible cards and announce the result count; returning to All restores three cards. |
| WEB-06 | Approved phone, email and WhatsApp destinations are correct. About presents Israel's supplied role and contacts, no invented portrait. Henry's private contacts are absent. Coverage does not imply guaranteed dispatch or 24/7. Unconfirmed working days are omitted; ask the business about availability. |
| WEB-07 | Contact can prepare a WhatsApp message from name, service and project details, with optional area. Validate required fields, lengths and allowed service values. Show accessible errors and preserve input. The visitor must explicitly open WhatsApp and send; no claim of delivery or stored request. No server submission or persistence. |
| WEB-08 | Inquiry links from services preserve context. Prepared text is URL-encoded. Editing inputs invalidates the previous prepared message, preventing stale details being sent. Invalid query service values fall back to general inquiry. |
| WEB-09 | Main journeys work at 320, 390, 768, 1366 and 1440 px with no horizontal overflow. Images have local optimized sources and useful alt text; controls have visible focus, labels and adequate touch space. Confirm representative new pages and 200% zoom-equivalent reflow. |
| WEB-10 | SDD test definitions and expected failures are recorded before implementation, followed by actual pytest, type checking, production build and visual browser checks. Document what remains unfinished. |

## Explicit limits

No customer login, jobs database, invoices, staff CMS, email-delivery provider, solar equipment/cost calculator, payments, analytics or public deployment in this increment. Those remain recorded future capabilities. The contact composer hands off to WhatsApp and is not the production backend form promised by the final MVP. Individual service pages beyond the shared solar-pumping page remain further content increments; service-family pages explain the current offerings.

Prototype stories must be replaced with approved real stories or removed before launch. A server-side content guard hides fictional stories when `MIAS_PUBLIC_LAUNCH=true`; this flag does not itself approve deployment or remove noindex. No fake review quotes are generated.

## Approval record

Henry requested implementation, supplied customers/logo, explicitly requested example project stories, and approved Israel's WhatsApp in the current message. Existing Next.js/TypeScript/Tailwind and local-content architecture approval persists. There is no new provider, storage service or recurring cost.
