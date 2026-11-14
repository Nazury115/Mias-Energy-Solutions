# Mias Energy Solutions website

Responsive website and digital lead platform for Mias Energy Solutions, Lusaka, Zambia. This repository is an incremental, spec-driven engineering project. It has no fixed 16-week deadline.

See the [customer, staff and Owner review checklist](docs/testing/role-review-checklist.md) for a hands-on walkthrough.

For the Gwembe release, verification results and online review setup, see the [14 November launch review](docs/testing/2026-11-14-launch-review.md).

## Current increment

Workspace review corrections add submission before template setup (Owner review is still required before issue), existing-project management with recoverable Owner-only Trash, and a development-only [mobile preview](http://127.0.0.1:3000/dev/mobile?path=%2Fstaff). See the [review walkthrough](docs/journal/workspace-corrections.md).

The current core-quality pass preserves the chosen reply method after inquiry validation, puts saved projects/documents before creation forms, and adds shortcuts to create new records. Owner document review stays first.

Henry removed the solar planner from the active scope on **6 November 2026**. Its page, navigation and submission flow are retired; solar customers use the normal assessment inquiry and staff prepare quotations using current prices. The planner remains only a [deferred idea](docs/ideas/solar-planner.md). Earlier saved request details remain readable through existing protected job access. The current priority is improving inquiries, jobs, messaging, publishing, documents and mobile usability; see the [scope change and improvement plan](docs/plans/planner-retirement.md). The local 010 milestone is `c055dc6`; later portal, workspace and security changes are recorded in the [changelog](CHANGELOG.md).

The customer portal now leads with linked jobs, uses scope as the job title, provides section shortcuts and shows issued dates/totals with PDF and Excel downloads. See the [approved follow-up](specs/008-customer-portal-usability.md) and [9 November verification closure](docs/testing/commit-review-2026-11-09.md).

The first local slice of increment 010 adds **Documents** in the staff workspace. Staff prepare, edit and submit a quotation or invoice for a job. Owners preview the submitted version, then approve and issue or deny it with a return reason. Both portals offer PDF and Excel downloads; draft access is limited to Staff and Owners. The design follows Henry's corrected invoice workbook, with fixed issue dates, exact decimal totals, separate line and overall discounts, and frozen issued copies. This local slice uses TEST numbers; live tax treatment and commercial rules still require business confirmation. See the [010 specification](specs/010-quotations-and-invoices.md), [walkthrough](docs/journal/010-quotations-and-invoices.md) and [verification results](docs/testing/010-results.md).

Increment 009 adds **Publishing** at `/staff/content`. Staff create project stories and testimonials, register JPEG/PNG photographs, save drafts and preview them. An Owner approves a saved version or unpublishes it. Editing a published entry keeps the previous approved version public until a replacement is approved. Test content keeps its fictional label and is hidden in launch mode. See the [009 specification](specs/009-staff-publishing.md), [walkthrough](docs/journal/009-staff-publishing.md) and [verification record](docs/testing/009-results.md).

**Start here:** [CHANGELOG.md](CHANGELOG.md) (what changed and why), [docs/plans/feature-backlog.md](docs/plans/feature-backlog.md) (features still to build and the plan) and [AGENTS.md](AGENTS.md) (working rules for any AI assistant or new maintainer).

Increment 008 adds the core customer job portal on top of the accounts from 007.

- A guest or signed-in request is saved with a reference and creates a local receipt email if the customer supplied an email address.
- Staff use **Review / accept** beside an inquiry at `/staff`, then create a job with agreed work, responsible staff and a next step. The inquiry detail page also has an **Accept request** shortcut near the top.
- `/staff/jobs` lists jobs. Each job has stages/history, customer updates/messages, private staff notes, notification delivery status and customer access controls.
- Staff verify the customer contact and send a seven-day invitation. New customers set a password; existing customers sign in with the invited email before accepting. A matching inquiry email alone never grants access.
- Customers see their authorized jobs under `/account` and open `/account/jobs/<reference>` for progress and messages. Staff notes never appear there.
- **Job conversation** shows previous messages above the reply box in both portals. A saved outgoing message shows **Sent**. When a recipient views the bubble in a focused portal tab, its sender sees **Read by** with the recipient’s display name and Zambia time. The open thread checks for replies every three seconds. Scrolling up preserves your place and offers **New messages** when a reply arrives.
- **Job files and company contacts.** On an active job, open **Job files**, choose a JPEG, PNG or PDF (up to 5 MiB), and select **Upload file**. A job holds up to 20 files. Downloads require current job access. Staff can remove a file with a private reason. On the staff job page, use **Customer access** to enter the company and invite each contact separately. Each person gets their own login and sees that job’s full customer-visible history and files. Revoke the selected person to end their access. Real email delivery remains for launch; all current messages are captured locally at `/dev/inbox`.

Specs and plan: [008 specification](specs/008-requests-jobs-and-progress.md), [implementation/test plan](docs/plans/008-requests-jobs-and-progress.md). See the [verification record](docs/testing/008-results.md) for measured checks and the [review walkthrough](docs/journal/008-requests-jobs-and-progress.md) to try the complete journey.

Increment 007 provides the account foundation:

- **Customers** sign up with email confirmation and see their own inquiries on **My account**.
- **Owners and Staff** use the company workspace at **`/staff`** to list, search and open every inquiry.
- **Owners** invite, change and deactivate team members at **`/staff/team`**.

Sign-in uses Better Auth, called only from server actions, and every protected page checks the role on the server. Account emails (confirmation, reset, invitation) land in the development inbox.

**Approved 008 workflow:** Assessment → Awaiting quotation decision → Scheduled → In progress → Completed, with On hold and Cancelled where needed. These are the approved local-build stages; Israel confirms the actual operating process before real use. Acceptance sends a local email confirmation when an email address is available; progress and messages stay in the portal. Portal invitations use email.

Increment 006 makes the Contact form work locally. Inquiries are saved with a reference number in a local PostgreSQL database (PGlite, created automatically in `.data/`), and notification emails are captured in a **development inbox at `/dev/inbox`** instead of being sent. The visitor is always told honestly whether the inquiry was received, saved without notification, or not saved. Nothing online is used or paid for yet.

Increment 005 adds the Zambia province coverage map on Projects (sample data for now), redesigned Contact and 404 pages, real-case-study support, and sitemap/robots/share-preview/structured-data groundwork. **Project stories and map figures are edited in one file, `src/content/projects.ts`**, whose header explains how to replace the sample values.

Increment 004 (branch `feature/004-scroll-redesign`) redesigns the public site around scroll-driven effects: a zoom hero, a pinned service story, parallax imagery, fade-in reveals and a "From the field" gallery of real work photos with a full-screen viewer. Large atmospheric spots use illustrative Unsplash photos that are never captioned as Mias work; see [image sources](docs/content/image-sources.md).

Increment 003 expanded the foundation into Home, Services, three service-family pages, a shared solar-pumping page, Projects with filters and three example stories, About and Contact. Israel's confirmed phone, email and WhatsApp are active links. The inquiry composer validates details and prepares a WhatsApp message; the visitor must still send it in WhatsApp. There is no backend submission, saved inquiry or delivery confirmation.

The three stories are visibly fictional, with no customer attribution or fabricated testimonials. Real customer names are listed separately. This preview remains `noindex, nofollow` and has not been deployed publicly.

## Approved direction and remaining work

The [business platform specification](specs/002-business-platform-expansion.md) records the approved direction. The public website, saved inquiries, accounts, job portal, staff publishing, local quotation/invoice workflow and the solar load-summary/inquiry slice are implemented. Commercial follow-ups and solar equipment sizing/pricing retain their own SDD gates.

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
| `src/lib/jobs.ts`, `src/server/jobs.ts` | Job stage/validation rules and server transactions: acceptance, customer association, invitations, progress, messages and private-note filtering. |
| `src/app/staff/jobs/`, `src/app/account/jobs/`, `src/app/job-invite/`, `src/components/job-forms.tsx`, `job-history.tsx` | Staff workflow, private customer job pages, invitation acceptance, draft/version handling and dated history. |
| `src/server/mail/outbox.ts`, `transport.ts` | Email notification rows, conditional delivery claims, local capture and bounded retries. |
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
