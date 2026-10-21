# Increment 006 — verification results

Date: 2026-10-21. Scope: [spec 006](../../specs/006-local-backend-and-inquiries.md). Plan: [006 plan](../plans/006-local-backend-and-inquiries.md). Red phase: [006-red-phase.md](006-red-phase.md).

## Automated

| Check | Result |
| --- | --- |
| Full pytest suite (dev server started from the project folder) | **160 passed** in one final run (3 min 48 s) |
| `tsc --noEmit` | clean |
| `next build --webpack` | succeeds; `/privacy` static, `/dev/inbox` dynamic |

Problems found and fixed during implementation:

1. **No-JavaScript test never settled.** With JavaScript off, Playwright's automatic scrolling fought the site's CSS smooth scrolling, so the target never stopped moving. The no-JavaScript context now uses "reduce motion", which the site already honours by disabling smooth scrolling. Submission without JavaScript is verified end to end.
2. **"Too fast" spam test was timing-dependent.** In a slow full run the page took over 3 s to load, so the submission legitimately counted as human. The test now swaps in a freshly issued token just before sending, and has passed three consecutive reruns.
3. **Contact page could crash in production.** A production build without `MIAS_FORM_SECRET` would have crashed the Contact page. The form now switches off and directs visitors to the call, WhatsApp and email buttons.
4. **Phone readability.** Stored numbers (`+260977555123`) are now displayed spaced (`+260 977 555 123`).

## Manual verification

| Check | Result |
| --- | --- |
| Production build on port 3100, separate temporary database | `/dev/inbox` → **404** (DEV-01). A real inquiry was accepted: reference `MES-26-4N7AS`, phone normalised, WhatsApp reply sentence correct |
| `node scripts/db.mjs delete <ref>` on the stopped production database | "Deleted MES-26-4N7AS and its notifications."; rerun → "No inquiry with reference …" (PRIV-03) |
| Same command while the dev server holds the database | Refused: "The website (process 2452) is using the database. Stop it first, or delete inquiries from /dev/inbox." |
| Production without `MIAS_FORM_SECRET` | `/contact` 200 with the "online inquiry form isn't switched on" fallback |
| Screenshots | Validation errors, received, saved-but-not-notified (yellow edge), and the inbox showing a notification delivered after one retry (2 attempts) |
| Database location | Created at `.data/pglite` in the project, with `.data/pglite.lock` holding the server's process id |

## Not verified yet

- Real email delivery, a hosted database and hosting. Deliberately deferred to increment 012.
- The privacy notice wording. It remains a draft awaiting the owner's approval, and the retention period is undecided (D-5).
- Physical phones, Safari/Firefox and Lighthouse.
