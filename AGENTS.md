# Working on this repository

Guidance for AI assistants (Claude, ChatGPT/Codex) and new maintainers. Read first: [README.md](README.md), [CHANGELOG.md](CHANGELOG.md) and [docs/plans/feature-backlog.md](docs/plans/feature-backlog.md).

## Project

Website and future service platform for Mias Energy Solutions (Lusaka, Zambia), maintained by Henry Masauso. The stack is Next.js 16 App Router, React 19 and TypeScript. Styling is mostly plain CSS in `src/app/globals.css`, with Tailwind 4 installed. Tests use pytest with Playwright driving Microsoft Edge. The site is a local preview only: it is not deployed, and pages are `noindex`.

## Two working copies

The same git repository exists in two folders:

- `D:\CS\Projects\Mias Enterprise Project\AI Projects` (git remote name: `desktop` points to the other copy)
- `C:\Users\nazur\Desktop\AI Projects` (git remote name: `ddrive` points to the other copy)

Work in one copy at a time. Before starting, pull what the other copy committed. In the D: copy, run `git pull desktop <branch>`. In the Desktop copy, run `git pull ddrive <branch>`. Commit before switching folders. `node_modules`, `.venv` and `Proof of service/` are not in git; each copy has its own.

## Commands (PowerShell)

Node is not on PATH on this computer; prefix the session first:

```powershell
$env:Path = "C:\Users\nazur\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;$env:Path"
node node_modules/next/dist/bin/next dev --webpack --hostname 127.0.0.1   # dev server on :3000
node node_modules/typescript/bin/tsc --noEmit                              # type check
node node_modules/next/dist/bin/next build --webpack                       # production build
node node_modules/drizzle-kit/bin.cjs generate --name <change>             # new migration after editing src/server/db/schema.ts
node scripts/db.mjs migrate | delete <reference>                           # database maintenance (server must be stopped)
.\.venv\Scripts\python.exe -m pytest -q                                    # full suite (dev server must be running)
.\.venv\Scripts\python.exe -m pytest -m unit -q                            # unit tests only
```

If `next` cannot be found, the pnpm links are broken. This happens after copying the folder. Delete `node_modules` and run `pnpm install --frozen-lockfile --ignore-scripts` with the bundled pnpm described in the README.

## Process

Spec-driven: **spec → implementation/test plan → tests first → build → review**. Henry approves each spec before implementation. Do not start a backlog increment from the backlog alone. Keep commits focused, and update `CHANGELOG.md` with every increment.

## Content rules (do not break)

- Never invent facts: customers, reviews, ratings, project counts, certifications, capacities, prices, dates or locations.
- `public/images/stock/` is illustrative Unsplash photography. Never caption or describe it as Mias work, staff, customers or Zambian locations.
- `public/images/work/` holds real proof photos. Captions describe only what is visible until project facts are confirmed. Record every image in `docs/content/image-sources.md`.
- Project stories and coverage-map figures live only in `src/content/projects.ts`. Sample items keep `sample: true` / `fictional: true` and stay labelled. Real ones need `confirmedBy`/`confirmedOn` or `approval`. Sample and real data are never shown together, and `MIAS_PUBLIC_LAUNCH=true` hides all sample content.
- Map outlines are generated: edit `scripts/build-province-map.py` and regenerate `src/content/zambia-map.ts`; never hand-edit the module.
- `Proof of service/` holds the raw originals. It stays out of git and is never modified.
- Hours, portrait and bio stay `null` in `src/content/site.ts` until supplied. Never fill them with guesses.
- Henry's private contact details never appear on the site. Israel's phone, email and WhatsApp are approved for display.

## Backend conventions

- Server-only code lives in `src/server/` and is used only from server components, server actions and route handlers.
- The local database is PGlite in `.data/pglite`; only one process can open it at a time. The website writes `.data/pglite.lock`, and `scripts/db.mjs` refuses to run while that process is alive. Never point a second server at the same folder; use `MIAS_DB_DIR` for a separate one.
- Schema changes go through Drizzle migrations in `drizzle/`; never edit generated migration files.
- Paths resolve from `process.cwd()`, so start the server from the project folder.
- Visitors only see success after data is saved. Failures stay visible, never silent (spec 006).
- Development switches (`mias-simulate` cookie, `/dev/inbox`) must stay inert when `NODE_ENV=production`.
- Secrets come from environment variables (`.env.local`, never committed); see `.env.example`.

## Design conventions

- Scroll effects use `src/lib/use-scroll-progress.ts`, which writes a `--progress` CSS variable that CSS reads. Do not add animation libraries without a reason.
- Every effect needs a `prefers-reduced-motion` fallback (see the end of `globals.css`).
- Fade-ins use `data-reveal` or `data-reveal-group`. Do not use them on lists that re-render after load, such as filtered galleries, because newly rendered items would stay hidden.
- Pages must not scroll horizontally at any width from 320px to 1440px; the browser tests check this.
- Photos: use stock only where a large sharp image is essential. Show the 1080px work photos at tile sizes, never stretched.
