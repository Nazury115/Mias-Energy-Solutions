# Increment 001 — verification results

Date: 2026-10-12. Environment: Windows, Node 24.19.0, Next.js 16.4.0, TypeScript 7.0.2, Python 3.12.14, pytest 8.4.2, Playwright 1.55.0 with installed Chromium-based Microsoft Edge.

## Recorded results

| Check | Result |
| --- | --- |
| Initial pytest collection before feature implementation | 35 collected successfully. |
| Initial unit red phase | 13 expected missing-module assertion failures; documented before feature implementation. |
| Contact-link unit tests after implementation | 13 passed. |
| Full pytest suite against the actual production-build preview | **35 passed in 10.76 seconds**: 13 unit, 15 HTTP integration, 7 browser. |
| TypeScript | `pnpm typecheck` passed before and after route generation. |
| Production build | `pnpm exec next build --webpack` passed; the same built-in webpack option is recorded in `pnpm build`. Homepage and 404 content were prerendered. |
| HTTP readiness | `/` returned 200; automated test verified the missing-page route returned 404. |
| Responsive browser checks | 320, 390, 768, 1366 and 1440 CSS-pixel widths passed with no page-level horizontal overflow. |
| Interaction checks | Mobile menu selection, Escape-to-close, keyboard skip link, contact anchor and client-error checks passed. |
| Screenshot inspection | Desktop 1440×1080 and phone 390×844 screenshots, plus full-page versions, were captured and visually inspected. No clipping or overlap was observed. |

## Issues found and resolved

- The initial npm dependency fetch timed out. Retrying the approved installation with a longer fetch timeout completed successfully; the resulting dependency tree is locked in `pnpm-lock.yaml`.
- The default Turbopack CSS worker exited before connecting to the compiler, both inside and outside the sandbox. Next.js's built-in webpack build passed. See ADR 002; the underlying Turbopack failure is not claimed to be fully diagnosed.
- Sandbox localhost/socket restrictions prevented meaningful browser/HTTP verification on the first attempt. The owned preview server and tests were rerun with the required permissions. Interrupted and failing infrastructure runs are not counted as passed tests.

## Reproduction

Run `pnpm build`, then `pnpm start` in one terminal. In another, run `.\.venv\Scripts\python.exe -m pytest -q`. The site defaults to `http://127.0.0.1:3000`; set `MIAS_TEST_URL` to change it. Local sandbox permissions may be needed for the build worker, localhost sockets and browser processes.

Run `.\.venv\Scripts\python.exe scripts\capture-preview.py` against the running preview to recreate the ignored `test-results/desktop-preview.png`, `desktop-full-page.png`, `mobile-preview.png` and `mobile-full-page.png` artifacts.

## Limits and remaining checks

- No real phone, WhatsApp or email destination was supplied; real lead delivery and quote/contact forms are future increments.
- Lighthouse was not run. No performance score is claimed.
- Automated checks and screenshot review do not establish WCAG conformance. Full screen-reader, contrast, 200% browser-zoom and physical Android checks remain necessary before launch.
- Browser checks used installed Edge, not a complete Firefox/Safari/device matrix.
- Branding, copy and illustrative artwork remain reviewable. The artwork is not a real project photograph.
- The preview has `noindex, nofollow`; no domain, hosting service or production deployment was configured.
