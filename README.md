# Mias Energy Solutions website

Responsive website and digital lead platform for Mias Energy Solutions, Lusaka, Zambia. This repository is an incremental, spec-driven engineering project. It has no fixed 16-week deadline.

## Current increment

Increment 003 expands the foundation into Home, Services, three service-family pages, a shared solar-pumping page, Projects with filters and three example stories, About and Contact. Israel's confirmed phone, email and WhatsApp are active links. The inquiry composer validates details and prepares a WhatsApp message; the visitor must still send it in WhatsApp. There is no backend submission, saved inquiry or delivery confirmation.

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

Run commands from the folder containing `package.json`, not a parent folder. On this computer that is:

```powershell
Set-Location "C:\Users\nazur\Desktop\AI Projects"
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

Browser tests use an isolated headless Edge profile, not your personal browsing session. `MIAS_BROWSER_CHANNEL=chrome` selects installed Chrome instead. `MIAS_NODE` can specify the Node executable used by unit tests. Test contact destinations use fictional fixtures and are not published as business information.

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
| `src/content/site.ts` | Business identity, service groups, navigation and contact details. |
| `src/app/services/[slug]/page.tsx` | Shared service-detail template and metadata. |
| `src/app/projects` | Project listing and individual stories. |
| `src/components/project-gallery.tsx` | Browser-side category filtering. |
| `src/components/inquiry-composer.tsx` | Accessible inquiry fields and explicit WhatsApp handoff. |
| `src/lib/inquiry.ts` | Pure validation and message preparation, exercised directly by pytest through Node. |
| `src/lib/project-visibility.ts` | Excludes fictional stories when preparing for public launch. |
| `src/components/site-header.tsx` | Mobile navigation state and keyboard behavior. |
| `src/components/contact-panel.tsx` | Confirmed contact actions or truthful unavailable state. |
| `src/lib/contact-links.ts` | Validated destination URLs; no credentials or submissions. |
| `public/images` | Selected local-preview copies of supplied work photos; originals are preserved. |
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
