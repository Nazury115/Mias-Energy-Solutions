# Changelog

Newest first. Each entry records what changed, where, and why, so work can continue in any tool (Claude, ChatGPT/Codex) or folder. For what is still to build, see [the feature backlog](docs/plans/feature-backlog.md).

## Where the project lives

- Two working copies of one git repository: `D:\CS\Projects\Mias Enterprise Project\AI Projects` and `C:\Users\nazur\Desktop\AI Projects`. On 2026-10-21 both were synced to the same commit on branch `feature/004-scroll-redesign`. `main` still points at the 001 foundation commit until this branch is merged.
- How to keep them in sync: [AGENTS.md › Two working copies](AGENTS.md#two-working-copies).
- `Proof of service/` (the 30 original WhatsApp photos) exists in both folders but is deliberately not in git.

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
