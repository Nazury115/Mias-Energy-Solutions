# Mias Energy Solutions website

Responsive website and digital lead platform for Mias Energy Solutions, Lusaka, Zambia. This repository is an incremental, spec-driven engineering project. It has no fixed 16-week deadline.

## Current increment

**Start here:** [CHANGELOG.md](CHANGELOG.md) (what changed and why), [docs/plans/feature-backlog.md](docs/plans/feature-backlog.md) (features still to build and the plan) and [AGENTS.md](AGENTS.md) (working rules for any AI assistant or new maintainer).

Increment 007 adds accounts.

- **Customers** sign up with email confirmation and see their own inquiries on **My account**.
- **Owners and Staff** use the company workspace at **`/staff`** to list, search and open every inquiry.
- **Owners** invite, change and deactivate team members at **`/staff/team`**.

Sign-in uses Better Auth, called only from server actions, and every protected page checks the role on the server. Account emails (confirmation, reset, invitation) land in the development inbox.

Increment 006 makes the Contact form work locally. Inquiries are saved with a reference number in a local PostgreSQL database (PGlite, created automatically in `.data/`), and notification emails are captured in a **development inbox at `/dev/inbox`** instead of being sent. The visitor is always told honestly whether the inquiry was received, saved without notification, or not saved. Nothing online is used or paid for yet.

Increment 005 adds the Zambia province coverage map on Projects (sample data for now), redesigned Contact and 404 pages, real-case-study support, and sitemap/robots/share-preview/structured-data groundwork. **Project stories and map figures are edited in one file, `src/content/projects.ts`**, whose header explains how to replace the sample values.

Increment 004 (branch `feature/004-scroll-redesign`) redesigns the public site around scroll-driven effects: a zoom hero, a pinned service story, parallax imagery, fade-in reveals and a "From the field" gallery of real work photos with a full-screen viewer. Large atmospheric spots use illustrative Unsplash photos that are never captioned as Mias work; see [image sources](docs/content/image-sources.md).

Increment 003 expanded the foundation into Home, Services, three service-family pages, a shared solar-pumping page, Projects with filters and three example stories, About and Contact. Israel's confirmed phone, email and WhatsApp are active links. The inquiry composer validates details and prepares a WhatsApp message; the visitor must still send it in WhatsApp. There is no backend submission, saved inquiry or delivery confirmation.

The three stories are visibly fictional, with no customer attribution or fabricated testimonials. Real customer names are listed separately. This preview remains `noindex, nofollow` and has not been deployed publicly.

## Approved direction and remaining work

The [business platform specification](specs/002-business-platform-expansion.md) records the approved direction. The implemented public increment is bounded by [its specification](specs/003-public-website.md) and [implementation/test plan](docs/plans/003-public-website.md). Customer/company workspaces, staff project/testimonial publishing, job tracking, quotations/invoices and a solar planner remain future increments with their own architecture and SDD gates.

See the [competitor review](docs/research/loxlak-review-2026-10-19.md), [photograph inventory](docs/content/proof-of-service-inventory.md) and [information worksheet](docs/content/business-intake.md). The final production MVP is not complete merely because the local public preview works.

## Stack and requirements

- Next.js App Router, React, TypeScript and Tailwind CSS.
- Next.js's built-in webpack path is used for development/build because the default Turbopack CSS worker failed on the initial Windows host; the webpack production build succeeded.
- Node.js 22.18 or newer (Node 24 used for initial verification).
- pnpm 11.25.0; framework dependencies are recorded in `pnpm-lock.yaml`.
- Python 3.12 or newer for pytest; Python is test infrastructure only.
- Microsoft Edge for browser tests, or another installed Playwright browser selected by `MIAS_BROWSER_CHANNEL`.

## Run the website

**Easiest, on this computer:** double-click `Start website.cmd` in the project folder (either copy). It finds Node, starts the development server and prints the address. When it says "Ready", open `http://127.0.0.1:3000`. To stop, close the window or press Ctrl+C. Only one copy of the website can run at a time. If one is already running (from the other folder, a terminal or an AI assistant's preview), the start file says so: use that one, or stop it first. If the packages are missing, it says which install command to run.

The rest of this section does the same by hand. Run commands from the folder containing `package.json`, not a parent folder. This computer has two working copies of the same repository (see [AGENTS.md](AGENTS.md#two-working-copies)):

```powershell
Set-Location "C:\Users\nazur\Desktop\AI Projects"
# or
Set-Location "D:\CS\Projects\Mias Enterprise Project\AI Projects"
```

If the current PowerShell cannot find `node` or `pnpm`, these commands use the runtime already available on this computer:

```powershell
$env:Path = "C:\Users\nazur\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;$env:Path"
& "C:\Users\nazur\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd" dev
```

This PATH change lasts only for that PowerShell session. Keep the terminal open while using the website. If the server is already running, refresh the browser instead of starting a second server. These bundled paths are specific to this computer.

On a machine where Node and pnpm are already on PATH, install dependencies once for a fresh checkout, then start the server:

```powershell
pnpm install --frozen-lockfile --ignore-scripts
pnpm dev
```

Open the Local URL printed by Next.js (normally `http://127.0.0.1:3000`). Stop the server with Ctrl+C.

The local database is created automatically the first time a page needs it. While the dev server runs, `http://127.0.0.1:3000/dev/inbox` shows saved inquiries and the notification emails Mias would receive, and has switches to simulate failures. `pnpm inquiry:delete <reference>` deletes an inquiry; stop the server first, since only one process can use the database at a time. **First Owner account:** stop the server, run `pnpm users:create-owner --email you@example.com --name "Your Name"`, start the server and open the printed link to choose a password. While the server runs you can use the development-only form on `/dev/inbox` instead. For `pnpm start` (production mode), create `.env.local` with `MIAS_FORM_SECRET=` and `BETTER_AUTH_SECRET=` (any long random text each), otherwise the form and sign-in stay switched off; see `.env.example`.

```powershell
pnpm typecheck
pnpm build
pnpm start
```

`pnpm start` serves the production build for local verification. It does not publish the website.

Stop the development server first if you want to run `pnpm start` on the same port. For ordinary editing, keep using `pnpm dev`.

## Run the tests

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-test.txt
.\.venv\Scripts\python.exe -m pytest --collect-only -q
.\.venv\Scripts\python.exe -m pytest -m unit -q
```

Keep the Next.js server running in another terminal for the full suite:

```powershell
$env:MIAS_TEST_URL = 'http://127.0.0.1:3000'
.\.venv\Scripts\python.exe -m pytest -q
```

Before the first browser test, the suite requests every page once so the development server builds them all. On a freshly started server this takes about a minute. Without it, a page built mid-test made already-open pages reload and lose what a test had typed. Browser tests use an isolated headless Edge profile, not your personal browsing session. `MIAS_BROWSER_CHANNEL=chrome` selects installed Chrome instead. `MIAS_NODE` can specify the Node executable used by unit tests. If it isn't set and Node isn't on PATH, the tests use the copy bundled on this computer automatically. Test contact destinations use fictional fixtures and are not published as business information.

## Where to make changes

| File/folder | Responsibility |
| --- | --- |
| `specs/mias-website-mvp.md` | Approved product baseline and SDD workflow. |
| `specs/001-responsive-foundation.md` | First increment's scope and acceptance criteria. |
| `specs/003-public-website.md` | Current public increment and demo-content boundaries. |
| `docs/plans/001-responsive-foundation.md` | Implementation/test plan and rationale. |
| `docs/plans/003-public-website.md` | Current increment's implementation and test plan. |
| `docs/testing/003-public-website-results.md` | Measured checks, results and remaining verification limits. |
| `docs/journal/003-public-website.md` | Explanation of the implementation and knowledge check. |
| `src/app/page.tsx` | Homepage section composition. |
| `src/app/layout.tsx` | Shared shell and page metadata. |
| `src/app/globals.css` | Visual tokens, component styles and responsive rules. |
| `src/content/site.ts` | Business identity, service groups, navigation, contact details, work photos, and the `operatingHours` / `leadership` slots (null until supplied). |
| `src/content/projects.ts` | **Project stories and coverage-map figures (sample data until replaced).** Validated on load. |
| `src/lib/coverage.ts`, `src/components/coverage-map.tsx` | Coverage counting/validation (unit-tested through Node) and the interactive province map. |
| `src/content/zambia-map.ts`, `scripts/build-province-map.py` | Generated province outlines and the script that builds them from geoBoundaries data. |
| `src/server/` | Server-only code: database (`db/`), inquiry saving/delivery (`inquiries.ts`), form tokens and hashing (`form-token.ts`), email transport (`mail/`). Never import it from client components. |
| `src/server/auth.ts`, `session.ts`, `team.ts`, `attempts.ts`, `src/lib/accounts.ts` | Accounts: Better Auth configuration (no public endpoints), `requireViewer` role gate, invitations/roles/audit, sign-in lockout, and the pure account rules (unit-tested). |
| `src/app/{sign-in,sign-up,verify-email,forgot-password,reset-password,invite,account,staff}/`, `src/app/forbidden.tsx` | Account and company-workspace pages; `forbidden.tsx` is the 403 page. |
| `src/lib/inquiry-submission.ts`, `src/app/contact/actions.ts`, `src/components/inquiry-composer.tsx` | Inquiry rules (unit-tested through Node), the server action, and the form. |
| `drizzle/`, `drizzle.config.ts`, `scripts/db.mjs` | Versioned database migrations (`pnpm db:generate` after schema changes) and database maintenance. |
| `src/app/dev/inbox/`, `src/app/privacy/` | Development-only inbox; draft privacy notice. |
| `src/app/sitemap.ts`, `robots.ts`, `opengraph-image.tsx`, `src/lib/site-metadata.ts`, `src/lib/structured-data.ts` | Search/sharing groundwork; `MIAS_SITE_URL` sets the absolute address once a domain exists. |
| `src/app/services/[slug]/page.tsx` | Shared service-detail template and metadata. |
| `src/app/projects` | Project listing and individual stories. |
| `src/components/project-gallery.tsx` | Browser-side category filtering. |
| `src/components/inquiry-composer.tsx` | Accessible inquiry fields and explicit WhatsApp handoff. |
| `src/lib/inquiry.ts` | Pure validation and message preparation, exercised directly by pytest through Node. |
| `src/lib/project-visibility.ts` | Excludes fictional stories when preparing for public launch. |
| `src/components/site-header.tsx` | Mobile navigation state and keyboard behavior. |
| `src/components/contact-panel.tsx` | Confirmed contact actions or truthful unavailable state. |
| `src/lib/contact-links.ts` | Validated destination URLs; no credentials or submissions. |
| `src/components/zoom-hero.tsx`, `scroll-statement.tsx`, `service-story.tsx`, `parallax-image.tsx` | Scroll-driven effects; all fall back to static layouts under reduced motion. |
| `src/lib/use-scroll-progress.ts` | Shared scroll-progress hook behind those effects (writes a `--progress` CSS variable). |
| `src/components/work-gallery.tsx` | "From the field" photo mosaic/strip and full-screen viewer. |
| `public/images/work`, `public/images/stock` | Supplied work photos (proof) and illustrative Unsplash photos; see `docs/content/image-sources.md`. Originals are preserved. |
| `public/brand/mias-logo-concept.png` | Generated logo refinement for review; original is in `docs/assets`. |
| `tests` | Pytest unit, HTTP integration and browser checks. |

## Content updates

Edit `src/content/site.ts` and confirm business facts with the owner before publication. Contact numbers must use international format such as `+` followed by a country code and digits, with no spaces; keep unknown values `null`. Confirm the destination's ownership separately: format validation cannot prove that a number belongs to Mias. Keep logo/palette choices provisional until reviewed. Update meaningful image alt text when replacing artwork; obtain usage permission for project photographs.

Run type checks, affected tests and a production build after changes. Service-family content and story records are structured in `src/content/site.ts`. The three demo records have `fictional: true`; do not change that flag simply to make them appear published. Replace them with real, approved records or remove them before launch. `MIAS_PUBLIC_LAUNCH=true` suppresses fictional stories from pages and detail-route generation after a rebuild. It does not authorize launch or remove noindex metadata.

No public CMS is implemented yet. Staff editing will need authenticated authoring, draft/review/publish states, permission records and separation from private job attachments. See the [asset and content notes](docs/content/003-assets-and-preview.md).

## Working process

Approved specification → implementation/test plan → defined and validated pytest tests → incremental implementation → verification → documentation and learning. See `docs/decisions/001-framework-and-content.md` for the approved architecture and `docs/testing/001-red-phase.md` for evidence that tests were defined before feature implementation.

## Before production

Backend form delivery/storage decisions, owner/client publication permissions, final branding, verified real stories, complete SEO, physical-device testing, deployment and domain configuration remain future work. Do not remove preview indexing restrictions or publish fictional stories. Direct contacts have been confirmed, but link checks do not establish that a human message was received. Do not commit secrets; `.env*`, build outputs, dependencies and test environments are ignored.

The original `mias-energy-project-plan.html` is retained as historical planning material. The approved specification supersedes its calendar schedule.
