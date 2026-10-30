# Increment 007 — local launch and reverification

Date: 2026-10-22. Run by Codex at Henry's request to launch and test the current site.

Baseline: `057b5b3` on `feature/004-scroll-redesign`. Desktop and D: copies were synchronized before testing; the pull was already up to date. Verification ran from the Desktop copy.

## Results

| Check | Result |
| --- | --- |
| Full pytest suite, headless Microsoft Edge | **201 passed in 598.68 seconds** |
| Production build, including TypeScript | **Passed** (`next build --webpack`) |
| Production HTTP smoke checks | **15 passed**, with runtime secrets configured |
| Production browser inspection | Home rendered; Copperbelt selection updated the map panel and pre-filled Contact; no warning/error entries in the inspected browser tab |
| Screenshot helper | Passed at 1440×1080 and 390×844; displayed images decoded successfully |
| Visual inspection | Desktop/mobile home, mobile Contact and Projects captures inspected; Contact content and form visible with reduced motion |

The full suite covers account registration/confirmation/sign-in/reset, invitations and role boundaries, deactivation, inquiry linking, successful and failed submissions, duplicate protection, rate limits, no-JavaScript forms, map interaction, gallery viewing, navigation, metadata, and responsive layouts.

Production responses checked on port 3100:

- 200: `/`, `/services`, `/services/water`, `/projects`, `/about`, `/contact`, `/privacy`, `/sign-in`, `/sign-up`, `/api/session`.
- 404: `/dev/inbox`, `/missing-page`.
- 307 to sign-in: `/account`, `/staff`, `/staff/team`.
- Contact rendered its submit button; sign-in was enabled; the signed-out session endpoint returned `null`.

## Test isolation and artifacts

Development tests used `.data/verification-2026-10-22/development/pglite`. Production smoke checks used `.data/verification-2026-10-22/production/pglite`. These are separate from the normal `.data/pglite` database. No real email transport was configured.

The temporary test servers were stopped after verification. The normal Desktop development preview was then started on port 3000 using its default database.

Local ignored artifacts:

- `test-results/verification-2026-10-22.xml`: full-suite JUnit results.
- `test-results/desktop-*.png` and `test-results/mobile-*.png`: refreshed Home, Water service, Projects, sample story and Contact captures.

## Screenshot helper repair

The older helper tried to scroll to service images intentionally hidden by responsive CSS and timed out. It now skips images that are not visible at the active viewport. Captures also use reduced motion, so full-page screenshots include sections that normally appear only after scrolling. The helper passed after these changes. Application code and appearance were unchanged.

## Environment notes and limits

The sandbox initially blocked a generated build directory and localhost connections. Repeating the affected build/server/test commands outside the sandbox resolved those environment failures.

This verifies the local preview and existing automated coverage, not public-launch readiness. Real email delivery, hosted infrastructure, physical devices, Safari/Firefox and Lighthouse were not tested. The production checks were a route/browser smoke test, not the full development-only test suite run against production. Sample data and noindex restrictions remain in place.
