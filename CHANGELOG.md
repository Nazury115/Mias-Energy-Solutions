# Changelog

Newest first. Each entry records what changed, where, and why, so work can continue in any tool (Claude, ChatGPT/Codex) or folder. For what is still to build, see [the feature backlog](docs/plans/feature-backlog.md).

## Where the project lives

- Two working copies of one git repository: `D:\CS\Projects\Mias Enterprise Project\AI Projects` and `C:\Users\nazur\Desktop\AI Projects`, kept in sync on branch `feature/004-scroll-redesign`. Increment 005 continues on that branch. `main` still points at the 001 foundation commit until the branch is merged.
- How to keep them in sync: [AGENTS.md › Two working copies](AGENTS.md#two-working-copies).
- `Proof of service/` (the 30 original WhatsApp photos) exists in both folders but is deliberately not in git.

## [009] Staff publishing — 2026-11-04

- Added project and testimonial drafts, protected previews, Staff editing and Owner publication/unpublication with dated approval reasons. A separately stored public snapshot keeps draft edits private.
- Added a private photo inventory with source and permission evidence. JPEG/PNG uploads are decoded, resized and stripped of metadata. Public photo requests require a current published reference.
- Public projects, detail pages, testimonials, coverage and sitemap read approved snapshots through `src/content/projects.ts`. Repository stories remain supported. Fictional entries keep their classification and are hidden in launch mode.
- TypeScript, production build, 170 unit checks and targeted publishing/public-page checks passed across verification and the unpublish rerun. See the [results](docs/testing/009-results.md), [specification](specs/009-staff-publishing.md) and [implementation plan](docs/plans/009-staff-publishing.md).

## [008 follow-up] Staff and customer job conversations

- Added the [approved conversation view](specs/008-job-conversations.md) to both job portals. It shows earlier messages and shared updates, a reply box, and live replies alongside separate progress and private staff history.
- Added first-view receipts per message and reader. Focused, visible messages can record a receipt. Access checks cover both reads and writes. Existing jobs keep their messages and begin with empty receipt history.

## [008 follow-up] Private job files and shared company access — 2026-11-02

- Linked customers and active Mias staff can share JPEG, PNG and PDF files on active jobs. Each job has 20 slots and each file can be up to 5 MiB. A protected download checks current access. Staff can remove a file with a private reason.
- Staff can record a company on the job, invite separate verified contacts and revoke one person's access. Existing individual grants and pending invitation tokens survive the migration.
- File contents and metadata commit together in the private database. Sharp and pdf-lib validate uploads on the server. The [approved scope](specs/008-follow-up-job-files-and-company-access.md) and [implementation plan](docs/plans/008-job-files-and-company-access.md) cover both slices.

## [008 core] Requests, jobs and customer portal — 2026-10-26

Training guides on 2026-10-29: added a reproducible screen recorder and narrated customer, Staff, Owner/local-testing and complete video exports with captions, chapters and a transcript. The recording uses a separate fictional database and local-only email/SMS captures. Large generated videos and private recording checkpoints stay out of Git. See the [video guide notes](docs/journal/008-video-guide.md).

Handoff resumed on 2026-10-29: the D: copy had no newer commits. Restarted the Desktop preview on port 3000 and confirmed Contact, customer invitation and protected staff-job routing. The saved full-suite report still records 254 tests with zero failures, errors or skips. No application behavior changed in this follow-up.

Review feedback on 2026-10-29: added a visible **Review / accept** action beside each eligible inquiry, top-of-page review/acceptance shortcuts, and clearer walkthrough instructions. Acceptance now explicitly opens the new job at its main content, including plain form submissions. TypeScript, desktop/phone navigation checks, four targeted workflow checks, production build and the production customer journey/eight route checks passed. Those checks also exposed and fixed test waits that could mistake another form's success message for the action being tested. The original full-suite result below predates this navigation follow-up; follow-up evidence is in the verification record.

Spec: [008](specs/008-requests-jobs-and-progress.md). Plan: [implementation and tests](docs/plans/008-requests-jobs-and-progress.md). Red phase: [expected failures](docs/testing/008-red-phase.md). [Verification](docs/testing/008-results.md): **254 tests passed**, standalone TypeScript and production build passed, and the production staff/customer journey plus eight route/status checks passed. Local core is ready for Henry's review; launch and follow-up slices remain separate.

- Staff review requests, accept them into one linked job, assign responsible staff, update the agreed scope/next step and move through the approved stages. Version checks reject stale edits; dated history retains changes and private reasons.
- Customers gain job access through a reviewed, expiring invitation. New-account setup and job association commit together; existing users authenticate with the invited verified email. Resends cancel earlier links; staff can cancel invitations or revoke access.
- Customer job views show progress and conversation. Internal staff notes are filtered out in SQL. Customer/staff action permissions are checked on the server, including direct requests.
- Inquiry receipt and acceptance create independent email/SMS events for supplied contacts. Local captures, per-channel failure switches, unique event keys, claimed delivery and bounded retries provide honest delivery states without sending external messages.
- Added generated migration `0002_jobs_and_notifications`, new job/invitation pages, responsive workspace styles and privacy wording. Multiple notification rows cannot duplicate inquiries in the existing list. Linked inquiries are retained with their jobs.
- Local verification can use a separate Next.js build directory. No new application libraries or paid services were added.
- Patched the existing Next.js dependency from 16.4.0 to 16.4.1 after its build security check reported the [14 October advisories](https://nextjs.org/blog/nextjs-security-update-october-14-2026). The lockfile change stays within Next.js and its versioned dependencies/peer references.
- Staff edits retain non-secret drafts after rejected saves, and dirty forms keep their original record version across another form's refresh. Contact browser helpers wait for hydration before filling; the no-JavaScript journey remains separate.
- Fixed the public inquiry form erasing details typed before JavaScript finished loading. A delayed-script regression reproduced the loss before the fix; initialization now adopts the visitor's existing form values before its first controlled re-render.
- Henry chose core first: private uploads and shared company access remain a follow-up slice; provider setup/budget and real delivery remain launch work.

## Planning: requests, jobs and customer notifications — 2026-10-26

- Added [draft spec 008](specs/008-requests-jobs-and-progress.md) for the flow Henry accepted: staff review/acceptance, job creation, customer invitation or verified linking, progress and messages.
- Recorded Henry's decision to use **both email and SMS** for customer receipt confirmations, distinct from business acceptance and portal invitations. Both are used when both valid destinations are supplied; otherwise the available channel is used. Each channel has independent delivery/retry tracking. Live provider and spending cap remain pending for launch.
- Updated the backlog and README. This is planning only: detailed spec approval, actual job stages and remaining scope decisions precede tests and implementation. No real messages are sent or services purchased.

## [007] Customer and company accounts — 2026-10-22

Reverified with Codex on 2026-10-22: all 201 tests passed in a fresh, separate test database; production build and 15 production-route checks passed. Updated `scripts/capture-preview.py` to skip responsive images hidden at the current viewport and use reduced motion so full-page captures include scroll-reveal content. No application behavior changed. See [reverification results](docs/testing/007-reverification-2026-10-22.md).

Spec: [specs/007-accounts-and-logins.md](specs/007-accounts-and-logins.md), including the 2026-10-22 amendment. Plan: [docs/plans/007-accounts-and-logins.md](docs/plans/007-accounts-and-logins.md). Results: [docs/testing/007-results.md](docs/testing/007-results.md). Made with Claude.

### What it does

- **Customers** sign up, confirm their email, sign in and out, and reset a forgotten password.
  - **My account** shows their details (editable name and phone) and the inquiries they sent while signed in.
  - The Contact form pre-fills their details and links the inquiry to their account.
- **Owners and Staff** use the company workspace at `/staff`: every inquiry, searchable by reference, name, phone (any format) or email, each with a detail page.
- **Owners** manage the team at `/staff/team`:
  - Invite people by email, using single-use links that expire after 7 days.
  - Cancel invitations, change roles, and deactivate or reactivate accounts.
  - See a record of who changed what. The last active Owner can't be removed.
- **The first Owner** is created with `pnpm users:create-owner --email … --name "…"` while the server is stopped, or with the development-only form on `/dev/inbox`.
- **Security:**
  - Every protected page and server action checks the role on the server, and refuses with 403 or a redirect to sign in.
  - Messages never reveal whether an email is registered.
  - Five wrong passwords in 15 minutes pause sign-in.
  - Passwords are stored as one-way hashes; reset and invitation tokens are hashed and single-use.
  - Staff and Owner sessions end after 12 hours; customer sessions last 30 days.

### Added

- **Login library:** Better Auth 1.7.12 (pinned, MIT licence). Its HTTP endpoints are never mounted; all flows go through server actions in `src/app/account/actions.ts`.
- **Database:** migration `drizzle/0001_accounts.sql` adds `user`, `session`, `account`, `verification`, `invitations`, `auth_attempts` and `audit_log`, plus `inquiries.user_id` and `notifications.kind`.
- **Server code:**
  - `src/server/auth.ts`, `session.ts` (`getViewer`, `requireViewer`), `attempts.ts` and `team.ts`.
  - `mail/outbox.ts`: one email outbox for inquiries and account emails.
  - `src/lib/accounts.ts`: the pure rules (unit-tested).
- **Pages:**
  - `/sign-up`, `/sign-in`, `/verify-email`, `/forgot-password`, `/reset-password` and `/invite`.
  - `/account`, `/staff`, `/staff/inquiries/[reference]` and `/staff/team`.
  - `src/app/forbidden.tsx` (403) and `/api/session`.
- **Header:** Sign in, or My account / Staff plus Sign out.
- **Development inbox:** lists account emails with their links, and has the Owner invitation helper.
- **Privacy notice (draft):** what accounts store, the sign-in cookie, and how to close an account.
- **`Start website.cmd`:** double-click to run the website locally without a terminal. It finds Node, checks the packages are installed, and refuses to start if port 3000 is already in use.

### Changed

- `next.config.ts` enables `experimental.authInterrupts` for real 403 responses.
- Email delivery moved from `inquiries.ts` into the shared outbox.
- `.env.example` adds `BETTER_AUTH_SECRET`; README and AGENTS are updated.
- The website refuses to open the local database while another running copy holds it, and the error says which process to close. Before, a second copy started from the other folder could fail in confusing ways.

### Found by verification and fixed

- **Production build pre-rendered the signed-in pages.** With nobody signed in at build time, they always redirected to sign in. Protected pages are now always rendered per request.
- **Intermittent first sign-up test failure.** This affected the tests only, never visitors. On a freshly started dev server, the first build of a page made every open page reload, which wiped the form the test had just filled in. The browser tests now request every page once before opening a browser.

### Paid services at launch

None new: accounts use the planned database and email service.

### Tests

41 new tests (31 unit, 10 browser). The full suite passes: 201 tests. Unit tests now find the Node bundled on this computer by themselves when Node isn't on PATH.

## [006] Local backend and working inquiry form — 2026-10-21

Spec: [specs/006-local-backend-and-inquiries.md](specs/006-local-backend-and-inquiries.md). Plan: [docs/plans/006-local-backend-and-inquiries.md](docs/plans/006-local-backend-and-inquiries.md). Results: [docs/testing/006-results.md](docs/testing/006-results.md). Made with Claude.

### What it does

The Contact page form now saves every inquiry with a reference such as `MES-26-7K3QP` and queues a notification email to Mias. It tells the visitor honestly what happened:

- **Received:** the reference, and how Israel will reply.
- **Saved, but Mias couldn't be notified:** the reference, plus "please also call/WhatsApp"; the notification is retried automatically.
- **Not saved:** what was typed is kept, and the direct contacts are shown.

Everything runs locally and costs nothing. Notifications go to a **development inbox** at `/dev/inbox`, which exists only in development.

### Added

- **Database:** PostgreSQL via [PGlite](https://pglite.dev) with Drizzle ORM. Data lives in `.data/pglite` (git-ignored) and is created automatically on first use. The schema is in [src/server/db/schema.ts](src/server/db/schema.ts), and versioned migrations in `drizzle/`.
- **Inquiry logic** [src/server/inquiries.ts](src/server/inquiries.ts):
  - Validation, plus spam checks: a hidden trap field and a signed "form opened" time (minimum 3 s).
  - Rate limits: 5 an hour per network (stored only as a one-way hash), and 3 a day per phone or email.
  - Duplicate protection through a per-form key, and saving in one transaction.
  - Delivery and retries (up to 4 attempts).
- **Validation rules** [src/lib/inquiry-submission.ts](src/lib/inquiry-submission.ts): Zambian phone normalisation (`0977 123 456` → `+260977123456`), the field rules, readable reference codes (no I, L, O or U) and spaced phone display.
- **Contact form** [inquiry-composer.tsx](src/components/inquiry-composer.tsx):
  - Name, phone and/or email, how Israel should reply (WhatsApp / phone call / email), service, area and details.
  - "Send inquiry to Mias" works with or without JavaScript. "Prepare WhatsApp message" remains as the second option.
- **Development inbox** `/dev/inbox`: every saved inquiry with its notification email and delivery status, buttons to simulate database or notification failures (this browser only), and delete.
- **Privacy notice** `/privacy` (draft, awaiting the owner's approval), linked from the form and the footer.
- **Scripts:** `pnpm db:migrate`, `pnpm inquiry:delete <reference>` (refuses to run while the website is running) and `pnpm db:generate` (after schema changes).
- **`.env.example`** documents every setting. In a production build, `MIAS_FORM_SECRET` is required, otherwise the form switches off gracefully.

### Changed

- `next.config.ts` marks PGlite as an external server package.
- `tsconfig.json` allows `.ts` extensions in imports, so unit-tested modules can share code.
- The Claude preview config starts the dev server inside the project folder.
- `/privacy` was added to the sitemap.

### Dependencies

`@electric-sql/pglite` 0.5.10, `drizzle-orm` 0.45.4 and `drizzle-kit` 0.31.11 (dev). All are free and open-source.

### Paid services this will need at launch (increment 012)

- An email-sending service (usually free at this volume).
- A hosted PostgreSQL database (free to about $25/month).
- Hosting that runs server code ($0–20/month).

### Tests

45 new tests (32 unit, 13 page/browser), so the suite now has 160.

## [005] Coverage map and public-site completion — 2026-10-21 (sample data)

Spec: [specs/005-public-completion-and-coverage-map.md](specs/005-public-completion-and-coverage-map.md), including Henry's amendment. Plan: [docs/plans/005-public-completion.md](docs/plans/005-public-completion.md). Results: [docs/testing/005-results.md](docs/testing/005-results.md). Made with Claude.

### Where to edit content now

**[src/content/projects.ts](src/content/projects.ts) is the one place for project stories and map figures.** It holds sample data, with instructions at the top of the file. To go live, change the values and flip `sample` / `fictional` to `false` with a confirmation or approval. Mistakes stop the page with a message listing what to fix.

### Added

- **Zambia coverage map** on `/projects#coverage` ([coverage-map.tsx](src/components/coverage-map.tsx)):
  - Covers all 10 provinces, shaded in four bands with a legend. Lusaka is marked as the base.
  - Provinces fill in and the headline counts up as the map scrolls into view.
  - Hovering shows a floating label. Clicking, tapping or keyboard selection opens a panel with the count, service mix, areas and stories, plus "Discuss a project in [province]".
  - An accessible province list mirrors the map, and a "Sample data — not real projects" label shows while data is sample.
  - Sample figures: Lusaka 24, Copperbelt 22, Southern 20, Western 19 (darkest); Central 10, North-Western 7, Eastern 5, Northern 4, Luapula 3, Muchinga 2.
- **Coverage logic** [src/lib/coverage.ts](src/lib/coverage.ts): province list, count building, shade bands and content validation. Sample and real data are never mixed, and sample data never reaches launch mode.
- **Map geometry**: [src/content/zambia-map.ts](src/content/zambia-map.ts), generated by [scripts/build-province-map.py](scripts/build-province-map.py) from geoBoundaries (CC BY 4.0).
- **Contact page redesign:** three large Call / WhatsApp / Email cards and a coverage note linking to the map. `?area=<province>` pre-fills Project area; other values are ignored.
- **404 page redesign:** four route cards (Home, Services, Projects, Contact).
- **Project story pages:**
  - A facts row (province, area, service, year; customer only with permission).
  - A separate real case-study template ("The challenge / What we did / The result", plus that project's photos). The fictional template keeps its labels.
  - "Discuss a similar need" pre-fills service and area.
- **Projects page order:** intro → coverage map → real case studies (once any exist) → work photos → fictional previews (preview only).
- **Search and sharing:**
  - `/sitemap.xml` and `/robots.txt` (crawling blocked during the preview).
  - Per-page Open Graph and Twitter previews, and a brand-only share image (`/opengraph-image`).
  - LocalBusiness structured data on Home with confirmed facts only.
  - `MIAS_SITE_URL` sets the absolute address once a domain exists.
- **Slots for supplied inputs** in `src/content/site.ts`:
  - `operatingHours` feeds Contact, the footer and structured data.
  - `leadership.portrait` and `leadership.bio` feed Home and About.
  - Both are `null` until supplied.

### Changed

- `projectStories` moved from `site.ts` to `projects.ts`, and each fictional story gained a sample province and area.
- The "Fictional example" badge on project cards now shows only for fictional stories.
- Page metadata goes through `pageMetadata()` in [src/lib/site-metadata.ts](src/lib/site-metadata.ts).

### Tests

49 new tests (`tests/test_coverage_units.py`, `tests/test_coverage_pages.py`). The full suite now has 115 passing. A launch-mode production build was checked separately.

## [004] Scroll-driven redesign — 2026-10-21

Commit `f6cf9dc` (branch `feature/004-scroll-redesign`), built on the 003 baseline commit `5abb1a9`. Made with Claude.

### Why

Increment 003 worked but felt static. Every section repeated the same eyebrow + heading + three-card grid, nothing responded to scrolling, the type was Arial, and 1080px WhatsApp photos were stretched into large hero spots where they looked soft.

### Design system (`src/app/globals.css`)

- **Typography:** system font stack via `--font-ui` (SF Pro on Apple devices, Segoe UI on Windows, Roboto on Android) replaces Arial.
- **New tokens:** `--header-h` (72px desktop, 64px mobile) and `--ease`.
- **Header:** the navy contact strip scrolls away. The main bar stays pinned and frosted, and gains a shadow after 40px of scroll (`is-scrolled`). The logo shrinks from 220px to 180px.
- **Buttons:** pill-shaped, with press feedback and arrows that nudge on hover. Adds `.button-dark`.
- **Cards and controls:** cards have a 20px radius and lift on hover, with images zooming slightly. Tags, badges, filters, inputs and panels are rounded to match.
- **Reveals:** elements marked `data-reveal`, or children of `data-reveal-group`, fade and slide in as they enter the viewport ([reveal-on-scroll.tsx](src/components/reveal-on-scroll.tsx), mounted in `layout.tsx`). Content stays visible without JavaScript.
- **Reduced motion:** with the operating-system "reduce motion" setting, every effect falls back to a static layout.
- **Cleanup:** removed the old two-column hero rules and the CSS crop workarounds that existed only for the low-resolution photos.

### New components

| File | What it does |
| --- | --- |
| [src/lib/use-scroll-progress.ts](src/lib/use-scroll-progress.ts) | Hook that writes scroll progress (0–1) to a `--progress` CSS variable without re-rendering. Modes: `pin` (sticky section), `read` (text passing mid-screen), `pass` (element crossing the viewport). |
| [src/components/zoom-hero.tsx](src/components/zoom-hero.tsx) | Homepage hero. The photo starts as a rounded card under the headline, grows to full screen as you scroll, and its caption fades in. |
| [src/components/scroll-statement.tsx](src/components/scroll-statement.tsx) | Large sentence whose words light up as it is read. Screen readers get the plain sentence. |
| [src/components/service-story.tsx](src/components/service-story.tsx) | On desktop, the photo stays pinned while Water, Electrical and Renewable energy scroll past; photos crossfade and a 01/02/03 rail jumps between them. On mobile, services stack with inline photos. |
| [src/components/parallax-image.tsx](src/components/parallax-image.tsx) | Large photo that drifts and settles as it scrolls past. |
| [src/components/work-gallery.tsx](src/components/work-gallery.tsx) | Real work photos as a packed mosaic (`grid`) or swipeable strip (`strip`). Opens a full-screen viewer (arrow keys, Escape) that never enlarges a photo beyond its original size. |

### Pages

- **Home** ([src/app/page.tsx](src/app/page.tsx)), in order: zoom hero → scroll statement → selected customers → pinned services (`#services`) → yellow repairs callout → "Real work. Real sites." (8 real photos) → about → contact.
  - The three fictional story cards were removed from the homepage. They remain on `/projects`.
  - The hero description is now "Pumping, plumbing, electrical and solar services for homes, farms and businesses."
  - "Explore our services" now scrolls to `#services` instead of opening `/services`.
  - Removed the hero footnote (Installation • Maintenance • Technical support).
  - The hero caption now reads "Renewable energy / Putting sunlight to work." It no longer implies the stock photo is Mias work.
- **Services** (`/services`): large intro plus the pinned service story, replacing the card grid.
- **Service detail** (`/services/[slug]`):
  - Parallax stock hero; the old "Supplied work photograph" caption is removed.
  - Offerings fade in, and the "brief" card stays in view on desktop.
  - New "From the field" swipe strip of that service's real photos. It is omitted on solar water pumping because no verified matching photos exist.
- **Projects** (`/projects`):
  - Now titled "Our work".
  - Real photos come first (`#work`, all 15). Fictional story previews follow, with the notice "Their photos are illustrative stock images."
  - Updated page title and description.
- **Project story** (`/projects/[slug]`): parallax stock image with the caption "Illustrative stock photograph; not verified as this example project." Sections fade in.
- **About:** large intro, aerial banner ("Water and energy, working together."), scroll statement and reveals.
- **Contact, 404 and footer:** only global styling changed. They are not yet redesigned.

### Content and images

- [src/content/site.ts](src/content/site.ts):
  - Service families and fictional stories now use stock images.
  - New `stockImages` (hero, solarPumping, about).
  - New `workPhotos`: 15 records with source, caption, service family, pixel size and tile shape. The order is chosen so the 4-column mosaic packs without gaps.
- `public/images/stock/`: 6 Unsplash photos (Unsplash License). They are never captioned as Mias work, and none was taken in Zambia, so their captions avoid locations.
- `public/images/work/`: 15 supplied photos copied from `Proof of service/` with descriptive names.
  - `control-panel.jpeg` is cropped to remove the photographer's feet.
  - Excluded: 09.26.20 (soft), 09.26.32 (posed, identifiable person), 09.26.37 and other near-duplicates.
- Removed `public/images/{control-panel,pumping-equipment,rooftop-solar,solar-battery}.jpeg` (superseded single copies).
- Docs:
  - [docs/content/image-sources.md](docs/content/image-sources.md) lists every source, photographer, licence and original filename.
  - `docs/content/003-assets-and-preview.md` points to it.
  - The README "Where to make changes" table lists the new files.

### Tests and verification

- New browser test `test_work_gallery_viewer` in `tests/test_public_website.py`.
- 66 tests passed against the development server.
- `tsc --noEmit` is clean and `next build --webpack` succeeds.
- Screenshot checks at 1440×900 and 390×844, plus with reduced motion; no horizontal overflow.
- **Not yet done:** physical phone, Safari/Firefox, Lighthouse, and a test run against the production server.

### Environment notes (outside git)

- Copying the folder to D: broke pnpm's links (`node_modules\next` was an empty folder), so `node_modules` was deleted and reinstalled there. If a copy shows "Cannot find module", do the same: `pnpm install --frozen-lockfile --ignore-scripts`.
- A preview config for the Claude desktop app's browser pane lives at `D:\CS\Projects\Mias Enterprise Project\.claude\launch.json`, outside the repo.

### Known follow-ups

- Workers appear in several work photos. Get permission before public launch.
- Replace stock hero and service images with real high-resolution photos when available. Ask for photos to be sent in WhatsApp **as a Document** so they keep full resolution.
- The Contact page and 404 still use the older layout.
- The logo is still the generated concept awaiting review.

## [003] Public website — built 2026-10-19, committed 2026-10-21

Commit `5abb1a9`. Built earlier with ChatGPT/Codex and committed unchanged as the baseline for 004:

- Services and the three service-family pages, plus a shared solar water pumping page.
- Projects, with three filterable fictional story previews.
- About, and Contact with the WhatsApp inquiry composer.
- Specs, plans, research, test results and four photo copies.

Details: [specs/003-public-website.md](specs/003-public-website.md) and [docs/journal/003-public-website.md](docs/journal/003-public-website.md).

## [001] Responsive foundation

Commits `1e03024` and `9be117e`. See [specs/001-responsive-foundation.md](specs/001-responsive-foundation.md).
