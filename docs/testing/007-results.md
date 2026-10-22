# Increment 007 — verification results

Dates: 2026-10-21 to 2026-10-22. Scope: [spec 007](../../specs/007-accounts-and-logins.md), including the 2026-10-22 amendment. Plan: [007 plan](../plans/007-accounts-and-logins.md). Red phase: [007-red-phase.md](007-red-phase.md).

## Automated

| Check | Result |
| --- | --- |
| Account browser tests (`tests/test_accounts.py`, 10) | **10 passed** on an undisturbed run |
| Unit tests | 118 passed, including 31 account-rule tests |
| Full pytest suite | **201 passed** (7 min 58 s), after the warm-up fix |
| Full suite on a freshly started server | All 10 account browser tests passed. One contact-form test (`test_hourly_limit_per_network_address`) timed out once, then passed 3 of 3 reruns; the cause is not identified. Someone was browsing the site in another browser during that run. The run also had 118 unit failures because Node wasn't on PATH in that shell; the tests now find the bundled Node themselves |
| `tsc --noEmit` | clean |
| `next build --webpack` | succeeds; every account and workspace page is dynamic (`ƒ`) |

## Problems found and fixed

1. **Production pages pre-rendered with nobody signed in.** Found by the production check, not by the dev-server tests. In a production build, `/account`, `/staff` and `/staff/team` were pre-rendered at build time. With no secret configured during the build, the viewer check skipped reading the request, so a "go to sign-in" redirect was baked into those pages. Even a signed-in Owner was then always sent to sign in. Two fixes: the viewer check now reads the request first, and the protected pages declare `dynamic = "force-dynamic"`. The production run then passed (below).
2. **`createUser` needs a provisioning source.** Better Auth 1.7 requires a second argument when creating invited accounts; `{ method: "email-password" }` is now passed.
3. **Ambiguous "Sign out" in a test.** The account page and the header both have a Sign out button, the header's for visitors without JavaScript. The test now targets the page's own button.
4. **Alert lookups scoped to `<main>`.** Next.js renders a hidden route announcer with `role="alert"`; see the red-phase record.
5. **Intermittent first sign-up failure (test setup, development only).** `test_sign_up_confirm_and_sign_in` failed in two full runs, including one undisturbed run, and in one of two runs on a freshly started server. The first failure was blamed on editing files mid-run, but the undisturbed failure ruled that out. A probe found the cause: on a freshly started dev server, building a page for the first time triggers a Fast Refresh rebuild, and every open page then does a full reload. The probe filled in the sign-up form, requested four pages that hadn't been built, and saw `[Fast Refresh] rebuilding`, a new `GET /sign-up` document request and an empty name field. When this happened mid-test, the test submitted an empty form and waited in vain for "Check your email". Production servers have no Fast Refresh, so visitors are never affected. Fix: `tests/conftest.py` now requests every route once before launching the browser. Afterwards the 10 account tests passed in two runs on freshly started servers, and the full suite passed (above). Editing `src/` mid-run causes the same reloads, so that lesson still stands.
6. **Layout.** Card headings on My account were sized like section headings, and the sign-in error box had a stray gap. Both fixed.

## Production verification (port 3100, separate temporary database, secrets set)

| Check | Result |
| --- | --- |
| `/dev/inbox` (including the Owner helper) | 404 |
| `/staff`, `/account` signed out | 307 → `/sign-in?next=…` |
| `pnpm users:create-owner` with the server stopped | Printed a single-use link (valid 24 hours) |
| Opening that link on the production server and choosing a password | Landed on `/staff` as **Owner** |
| Reopening the same link | "This invitation has already been used…" |
| Production without `BETTER_AUTH_SECRET` | `/sign-in` 200 with "Accounts aren't switched on" |
| Setup command while the dev server runs | Refused by the lock guard (as in increment 006) |

## Running the website without an assistant

- **`Start website.cmd`** (project root). Double-clicking it finds Node, checks that packages are installed, refuses to start if port 3000 is busy, then runs the dev server. It was checked by running a copy, started from another folder the way a double-click does, with a stand-in for the website so a second server could never start. With port 3000 busy, it printed the "already running" message and exited. With the port free, it found Node (not on PATH here) and started. Typing `cmd /c Start website.cmd` without quotes runs Windows' own `start` command instead; double-clicking is unaffected.
- **Second copy guard.** The website now records its process in `.data/pglite.lock` and refuses to open the database while another live process holds it. The error names that process and says how to clear a stale lock. A lock left by a process that is no longer running is replaced silently.

## Other observations

- **Cookies.** A sign-in sets exactly one cookie, `better-auth.session_token`: http-only, `SameSite=Lax`, 30 days. The privacy notice says this. Staff and Owner sessions are ended on the server 12 hours after signing in, even though the cookie lives longer (spec amendment 3).
- **Local test accounts.** A test customer and a test Owner were created in the D: copy's development database. Their sign-in details are in `.data/test-accounts.txt`, which git ignores and which lives beside that database only.

## Not verified yet

- Real email delivery and hosting (increment 012).
- Two-step sign-in for Owners (D-7, decided at launch).
- Physical phones, Safari/Firefox and Lighthouse.
