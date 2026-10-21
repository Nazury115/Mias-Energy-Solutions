# Increment 003 — implementation and test plan

Approved scope: [WEB-01–WEB-10](../../specs/003-public-website.md). No new dependencies.

## Implementation approach

1. Define typed public content for service families, customer names and explicitly fictional stories. Keep public/private information separate. Derive reusable cards and detail routes from this content.
2. Refresh the shared visual system around the supplied blue/yellow branding. Preserve the original logo; generate a sibling concept. Use approved-for-preview local photo copies with provenance documented.
3. Build the public pages with server-rendered content. Limit client components to navigation, project filtering and the WhatsApp composer.
4. Use the existing contact-link helper. Add one pure inquiry validation/message function, tested directly from pytest through Node, without duplicating calculations/logic in Python.
5. Retain noindex and useful 404 behavior. Add a server-only visibility guard for fictional projects in public-launch mode. No unrelated service integrations.

## Decisions and trade-offs

- Structured local content is sufficient while Henry maintains pages. A future staff publisher needs authenticated editing/storage and draft/publish permission rules; no mock admin panel that pretends to save data.
- WhatsApp composition offers a usable inquiry path without selecting a backend provider. Its limit is explicit: preparing/opening a message does not prove it was sent or received. The formal stored inquiry flow remains future work.
- Fictional stories are permitted as labelled preview content. They never use real client names or testimonials, and are suppressed by the public-launch visibility guard.
- Service families provide depth without creating many thin pages. Solar pumping has a single shared detail destination. Further individual service pages can build on the same content model.

## Tests defined before implementation

- Keep existing contact-link unit tests, identity, core-service, noindex, image, 404 and viewport tests. Update only changed expectations: direct contacts now exist; navigation now opens real routes.
- Pytest unit tests call the actual inquiry module: required fields, invalid service, length bounds, trimming, reserved-character encoding and valid message context. Tests also exercise the actual demo-visibility guard.
- HTTP integration tests cover new routes, unique titles, actual phone/email/WhatsApp destinations, customer list, demo disclosure, absence of customer attribution in demos, image alt text and invalid slugs.
- Playwright through pytest covers filters, service-context handoff, validation, preparing a message without sending, invalidating stale previews, mobile navigation, keyboard entry and responsive pages. Do not click external send/call actions or contact the business during tests.
- Collect tests and run the selected new tests against the unchanged foundation. Record expected missing-feature failures, distinguishing server/tool failures from assertions.
- After implementation: complete pytest suite, TypeScript, webpack production build, screenshots of home/contact/projects/detail pages on desktop and phone. Fix observed problems; no unmeasured Lighthouse/WCAG claim.

## Integration and learning

Document asset provenance, demo limitations and what each module owns. Explain server-rendered routes versus interactive client components, URL query context, validation versus delivery, and the distinction between an example case study and verified project evidence.
