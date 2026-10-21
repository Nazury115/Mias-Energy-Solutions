# Increment 003 — public website verification

Date: 2026-10-19. Scope: [approved public increment](../../specs/003-public-website.md). This is a local preview report, not production certification.

## SDD evidence

The specification and implementation/test plan preceded feature implementation. Tests exercised actual TypeScript functions via Node, HTTP responses from the running Next.js application and interactions in headless Microsoft Edge through Playwright. The [red-phase record](003-red-phase.md) distinguishes missing-feature failures from environment issues. No business messages were sent during verification.

## Executed checks

| Check | Observed result |
| --- | --- |
| Pytest collection before implementation | 65 tests collected. |
| `pnpm typecheck` | Passed. |
| `python -m pytest -m unit -q --tb=short` | 22 passed, 43 deselected. |
| `python -m pytest -q --tb=short` | **65 passed in 112.24 seconds.** |
| New-page browser regression after final card-alignment/favicon changes | 7 passed, 14 deselected in 67.21 seconds. |
| Final `pnpm build` | Passed: webpack compilation, TypeScript, page generation and build tracing completed; 15 generated entries including framework/icon entries. |
| Screenshot capture after final visual changes | Passed; each image was scrolled into view and decoded before capture. Desktop 1440 px and phone 390 px screenshots reviewed. |
| Additional reflow check | Home, water services, projects and contact had no horizontal overflow at a 640 CSS-pixel viewport, representing the available width of a 1280-pixel viewport at 200% zoom. This is not a native-browser zoom interaction test. |
| JavaScript-disabled contact check | Direct WhatsApp link remained visible; prepare button remained disabled; pressing Enter in the name field did not submit a native GET or put the entered name into the URL. |

The full suite ran against the existing development server at `http://127.0.0.1:3000`. The optimized production build succeeded, but the suite was not repeated against a separately running production server.

## Coverage and observations

- Unit checks: existing contact-link formatting/encoding; required and maximum-length inquiry fields, service allowlist, trimming, optional area, message context; fictional-content visibility function.
- HTTP checks: original foundation and new routes, invalid-route 404s, headings, metadata/noindex, image alternatives, approved contact destinations, supplied customers, demo disclosures and absence of Henry's private contact details.
- Browser checks: service context reaching the form, invalid-input feedback, preparation without sending, clearing stale prepared text on edit, category filters/result counts, responsive navigation and representative layouts at 320, 390, 768, 1366 and 1440 px.
- Visual review: homepage, service details, projects, story and contact screenshots on desktop/phone. Project-card links were aligned after review. A blank below-fold image in an early capture was a lazy-loading capture issue; scrolling and decoding images before screenshots resolved it without altering the source photographs.

Local screenshots are in ignored `test-results/`, including `desktop-full-page.png`, `mobile-full-page.png`, `desktop-projects.png`, `mobile-contact.png` and `contact-zoom-equivalent.png`. Reproduce captures with `scripts/capture-preview.py` while the local server is running.

## Environment issues, not hidden passes

One final sandboxed build compiled successfully but failed creating a generated `.next` directory with `EPERM`. The permitted retry outside the sandbox completed with exit code 0. No dependency or application-code change was needed for that retry.

An initial diagnostic applied CSS `zoom: 2` to the document. It overflowed, while `innerWidth` remained 1280 and the phone media query remained false. CSS-only scaling did not reproduce browser zoom's viewport change. The subsequent check used a 640 CSS-pixel viewport and passed. Actual browser-menu zoom remains a manual check; this report does not label the first diagnostic as a pass or claim complete zoom accessibility.

## Remaining limits and launch gates

- No Lighthouse scores were measured. No WCAG compliance claim, screen-reader certification, physical Android test, Safari/Firefox coverage or production-device performance claim is made.
- Link correctness and message preparation do not establish real WhatsApp delivery or human response. Test a real inquiry with the owner before launch, with their consent.
- The public-launch visibility helper is unit-tested; a separate build with `MIAS_PUBLIC_LAUNCH=true` and its empty/public gallery state still belongs in launch verification. The flag does not remove noindex or authorize publication.
- Fictional stories must be removed or replaced with verified content. Confirm customer/photo publication permissions, final branding, portrait, operating days and the eventual company mailbox.
- Server-side form delivery, portal authentication/authorization, storage, staff publishing, quotations/invoices and the solar planner are not implemented here and have no claimed test coverage.
- Preview indexing restrictions remain enabled. Domain setup, deployment, complete production SEO and security/privacy reviews remain separate work.

Technical verification is complete for this local increment. Henry's design/content review and understanding are still required for final human acceptance.
