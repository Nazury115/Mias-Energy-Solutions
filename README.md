# Mias Energy Solutions website

Responsive website and digital lead platform for Mias Energy Solutions, Lusaka, Zambia. This repository is an incremental, spec-driven engineering project. It has no fixed 16-week deadline.

## Current increment

Increment 001 implements the homepage, service overview, About section, contact entry point, responsive navigation and a useful 404 page. Phone, WhatsApp and email remain unconfirmed, so no inquiry submissions or dummy contact links are offered. This preview is marked `noindex, nofollow` and has not been deployed publicly.

## Stack and requirements

- Next.js App Router, React, TypeScript and Tailwind CSS.
- Next.js's built-in webpack path is used for development/build because the default Turbopack CSS worker failed on the initial Windows host; the webpack production build succeeded.
- Node.js 22.18 or newer (Node 24 used for initial verification).
- pnpm 11.25.0; framework dependencies are recorded in `pnpm-lock.yaml`.
- Python 3.12 or newer for pytest; Python is test infrastructure only.
- Microsoft Edge for browser tests, or another installed Playwright browser selected by `MIAS_BROWSER_CHANNEL`.

## Run the website

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
| `docs/plans/001-responsive-foundation.md` | Implementation/test plan and rationale. |
| `src/app/page.tsx` | Homepage section composition. |
| `src/app/layout.tsx` | Shared shell and page metadata. |
| `src/app/globals.css` | Visual tokens, component styles and responsive rules. |
| `src/content/site.ts` | Business identity, service groups, navigation and contact details. |
| `src/components/site-header.tsx` | Mobile navigation state and keyboard behavior. |
| `src/components/contact-panel.tsx` | Confirmed contact actions or truthful unavailable state. |
| `src/lib/contact-links.ts` | Validated destination URLs; no credentials or submissions. |
| `public/water-energy-illustration.svg` | Original illustrative artwork, not a real project. |
| `tests` | Pytest unit, HTTP integration and browser checks. |

## Content updates

Edit `src/content/site.ts` and confirm business facts with the owner before publication. Contact numbers must use international format such as `+` followed by a country code and digits, with no spaces; keep unknown values `null`. Confirm the destination's ownership separately: format validation cannot prove that a number belongs to Mias. Keep logo/palette choices provisional until reviewed. Update meaningful image alt text when replacing artwork; obtain usage permission for project photographs.

Run type checks, the affected tests and a production build after changes. Services currently link to the contact section; individual service routes will be a later approved increment.

## Working process

Approved specification → implementation/test plan → defined and validated pytest tests → incremental implementation → verification → documentation and learning. See `docs/decisions/001-framework-and-content.md` for the approved architecture and `docs/testing/001-red-phase.md` for evidence that tests were defined before feature implementation.

## Before production

Real contact destinations, form delivery and privacy decisions, owner-approved branding/content, individual pages, full SEO, physical-device testing, deployment and domain configuration remain future work. Do not remove the preview indexing restriction or publish placeholder content until launch has been approved. Do not commit secrets; `.env*`, build outputs, dependencies and test environments are ignored.

The original `mias-energy-project-plan.html` is retained as historical planning material. The approved specification supersedes its calendar schedule.
