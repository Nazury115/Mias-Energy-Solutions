# Feature backlog and implementation plan

Date: 2026-10-21  
Status: **Proposed for Henry's review.** This is a planning document, not approval to build any increment.  
Builds on: [next steps and launch readiness](next-steps-and-launch-readiness.md) (phases, safeguards, release gates) and the [business platform expansion spec](../../specs/002-business-platform-expansion.md) (requirement IDs such as PORT-01). Where this document and those disagree, raise it for a decision instead of silently choosing one.

Every increment below follows the project's SDD loop: **spec → implementation/test plan → tests first → build → review**, each with Henry's approval at the spec stage.

## 1. Where everything stands

| Area | Feature | Status | Requirement |
| --- | --- | --- | --- |
| Public site | Home, Services, 3 service families + solar water pumping, Projects, About, Contact | Done (local preview) | 003 |
| Public site | Scroll-driven redesign, real work gallery, stock imagery | Done | 004, see [CHANGELOG](../../CHANGELOG.md) |
| Public site | Contact page and 404 in the new design | Done | 005 |
| Public site | **Zambia province coverage map** on Projects | **Built with sample data**; waiting for real figures | 005: MAP-01–09 |
| Public site | Verified case studies replacing the 3 fictional stories | Template built; waiting for project records | PUB-03, 005 CASE |
| Public site | Israel's portrait and short bio | Waiting for photo/bio | PUB-06 |
| Public site | Confirmed working days and hours wording | Waiting | PUB-07 |
| Public site | Genuine testimonials | Waiting for approved reviews | PUB-05 |
| Public site | Real high-resolution photos replacing stock in the hero and service spots | Waiting for photos | PUB-09 |
| Public site | Final logo | Concept awaiting review | — |
| Public site | SEO: metadata, sitemap, robots, Open Graph, LocalBusiness data | Done for preview; domain and launch switch pending | PUB-10, 005 SEO |
| Intake | Inquiry form that really delivers (email and/or stored request) | Not started; WhatsApp composer only | PUB-08, FR-09–12 |
| Accounts | **Customer login** | Not started, see §3 | PORT-01, 02, 09 |
| Accounts | **Company/staff login** with roles | Not started, see §3 | PORT-01, 02 |
| Portal | Requests → jobs → status history | Not started | PORT-03–05, 08 |
| Portal | Customer/staff messages; internal notes kept private | Not started | PORT-06 |
| Portal | Private photo/document uploads | Not started | PORT-07 |
| Content | Staff publishing of projects, testimonials (and map data) | Not started | CMS-01 |
| Documents | Quotations and invoices | Not started | DOC-01–06 |
| Planner | Household solar planner | Not started | SOL-01–07 |
| Launch | Hosting, domain, full QA, Lighthouse, private pilot, launch approval | Not started | Phases 7–8 |

## 2. New: Zambia coverage map (Projects page)

**Recommendation: yes, build it.** "Working across Zambia" is currently only a claim in the hero. A map showing recorded projects in every province turns it into visible evidence, and it is the kind of interactive, scroll-revealed element that suits the new design.

### Proposed experience

- An inline SVG map of Zambia's 10 provinces: Central, Copperbelt, Eastern, Luapula, Lusaka, Muchinga, Northern, North-Western, Southern, Western.
- Each province is shaded by its number of recorded projects (light to deep blue). Lusaka is marked as the base with the brand's yellow dot.
- As the map scrolls into view, provinces fill in one by one and a headline counts up (for example "Projects recorded in 10 of 10 provinces").
- Hovering or tapping a province shows its name, project count and service mix (water / electrical / solar), with a link that filters the work gallery and stories to that province.
- An accessible list or table under the map gives the same numbers. On phones that list is the main view and the map stays compact.
- No map service or API key is needed (no Google Maps cost). Province shapes come from open boundary data, simplified into one small SVG, for example:
  - geoBoundaries ADM1 for Zambia (check its licence and attribution terms), or
  - Natural Earth admin-1 (public domain).
  
  Whichever is chosen must include **Muchinga** (created in 2011).

### Data it needs, and the main blocker

Counts must come from real records, the same rule as every other claim on the site. One row per project:

| Field | Required | Notes |
| --- | --- | --- |
| Province | Yes | One of the 10 above |
| Town/area | Optional | Shown only if not private |
| Service family | Yes | water / electrical / renewable-energy |
| Year | Optional | Only if known |
| Short description | Optional | What Mias actually did |
| Customer name | Optional | Only with the customer's permission |
| Photos | Optional | Filenames from the work archive, if any belong to this project |

If exact records are not available yet, Israel can confirm approximate counts per province. The page then says "recorded projects" and shows only the numbers he confirmed. No "100+" style totals unless he confirms them.

### Proposed requirements (to finalise in the increment 005 spec)

| ID | Requirement |
| --- | --- |
| MAP-01 | The map shows all 10 provinces with correct, current boundaries and names; Lusaka is marked as the base. |
| MAP-02 | Province shading and counts are computed from approved project records only; provinces without records show "no recorded projects yet", never an estimate. |
| MAP-03 | Each province is reachable by keyboard and touch and announces its name and count; an equivalent list or table is always present. |
| MAP-04 | Selecting a province filters the visible work photos/stories, or links to that filtered view. |
| MAP-05 | Works without horizontal overflow from 320px to 1440px, with a reduced-motion version that has no fill animation. |
| MAP-06 | Boundary data source and licence are recorded in `docs/content/image-sources.md` or a sibling data-sources file. |

Later, once staff publishing (increment 009) exists, staff add a project with its province and the map updates automatically.

## 3. Customer and company logins: what they involve

A login page is only the visible tip. Behind it, the spec requires accounts and verification, password or link recovery, roles, a database, and **server-side checks on every request** so that customer A can never see customer B's records, even by editing a URL (PORT-02). One sign-in system serves both entry points:

- **Customer login → customer workspace:** my requests, job status and history, messages, issued quotations and invoices.
- **Company login → staff workspace:** request triage, jobs, progress updates, internal notes, publishing and documents. Staff accounts are created by invitation only, never by public sign-up.

### Technology options to compare when increment 006 is specified

Check current prices and terms at decision time.

| Option | Shape | Why consider it |
| --- | --- | --- |
| A. Supabase (Postgres + Auth + Storage) | One provider | Row-level security enforces per-customer access inside the database; built-in email link/OTP login and private file storage; free tier to start. |
| B. Auth.js + managed Postgres (e.g. Neon) + object storage | Several smaller pieces | More control and portability; more setup and more places to secure. |
| C. Hosted auth (e.g. Clerk) + managed Postgres | Auth outsourced | Fast, polished login UI; monthly cost grows with users; data still needs its own access rules. |

Hosting for a Next.js app with server features: Vercel or a similar host. Vercel's free Hobby tier is for non-commercial use, so a business site needs a paid plan or another host.

### Login method

Start with email (magic link or password). Phone or WhatsApp one-time codes suit Zambian customers well but cost money per message, so they are a later decision.

### Decisions Henry and Israel must make first (spec 002 §6)

- Invitation-only or self-registration for customers.
- Which staff roles exist (owner, operations, commercial approver, technical maintainer).
- How organisations such as LWSC share access.
- The real job stages.
- The expected number of customers and jobs.
- How long records are kept.
- The monthly budget.

## 4. Implementation plan

Order chosen so that each step delivers something usable and unblocks the next. Logins need a host and database, which are decided in 006. The map and content work in 005 need no backend, so they can start now.

| # | Increment | Includes | Needs from Henry/Israel | Done when |
| --- | --- | --- | --- | --- |
| **005** | **Public-site completion + coverage map** | Province map (§2); Contact page and 404 in the new design; real case studies replacing fictional stories where records exist; Israel's portrait/bio; hours wording; sitemap, Open Graph, LocalBusiness data | Project list with provinces; at least 1–3 full project records; portrait/bio; working days; permission for people/premises in photos | Map shows only confirmed data; no fictional content in launch mode; all pages pass phone/laptop checks |
| **006** | **Hosting + reliable inquiries** (first backend) | Choose host, database and email provider (§3 options); inquiry form with server validation, spam protection, real delivery to Israel and honest success/failure messages; staging site behind access control | Receiving mailbox, who responds, budget approval, company email account if wanted | A consented real test inquiry reaches Israel; failures are visible, not reported as success |
| **007** | **Accounts: customer + company login** | Sign-in, logout, recovery, email verification, invited staff accounts, roles, server-side permission checks, session expiry | Enrollment rules, staff roles, organisation access rules | Two test customers and two staff roles cannot see or change each other's data, including by direct requests |
| **008** | **Requests, jobs and progress** | Logged-in requests with reference numbers; staff triage → job; status history; customer-visible updates vs internal notes; optional private uploads | Real job stages, upload limits, retention | Request → job → progress → completion works end to end; internal notes never leak |
| **009** | **Staff publishing (CMS-01)** | Staff create/edit projects (with province, so the map updates), photos and genuine testimonials; draft → preview → publish/unpublish with approval record | Who approves publishing; testimonial permissions process | Staff update public content without code; drafts stay private |
| **010** | **Quotations and invoices** | Drafts, approval, issue, numbering, revisions, PDF download limited to the right customer | Sanitised real quote/invoice samples, tax/rounding/validity rules | Owner-approved worked totals reproduce exactly; only the intended customer can download |
| **011** | **Solar planner** | Load summary first (appliances, hours, energy); equipment/cost suggestions only with approved rules | Technical reviewer, product catalogue, price list, 3 worked examples | Approved examples reproduce; unsupported loads route to assessment. Can move earlier, since it needs no login |
| **012** | **Release verification and launch** | Production-build test run, real devices, Lighthouse, accessibility, security/privacy review, private pilot, domain, launch | Launch approval, domain, operating owner | All release gates in the [launch-readiness plan](next-steps-and-launch-readiness.md#6-release-gates) pass |

### Current step

Increment 005 built 2026-10-21 with sample data ([results](../testing/005-results.md)). To finish it, replace the sample values in `src/content/projects.ts` with real figures, and add the portrait/bio, hours and real photos as they arrive. Next increment: 006, hosting and reliable inquiries. Meanwhile, Henry and Israel can fill in the project list (§2 table). It can be a spreadsheet, a WhatsApp message or a markdown table; one row per project is enough to begin.
