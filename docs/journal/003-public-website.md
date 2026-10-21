# Development journal — richer public website

Date: 2026-10-19. This project now progresses by approved increments, not fixed weeks.

## Accomplishments

Expanded the foundation into a public website with three service families, a shared solar-pumping page, project filters and three explicitly fictional example stories, About and Contact. Added the supplied customer names separately from the demo stories, Israel's approved contact channels and selected supplied work photos. Introduced a blue/yellow logo refinement while preserving the original.

Followed the approved specification, test plan and red-phase tests before implementation. The complete pytest suite passed 65 tests, TypeScript passed, and the final production build succeeded. See the [verification report](../testing/003-public-website-results.md) for exact scope and limitations.

## Decisions and ownership

Henry approved the public website direction, service additions, public contact details and illustrative stories. Existing Next.js/TypeScript/Tailwind and structured local content remain the architecture. No database, account system, new dependency, hosting service or recurring charge was introduced.

The contact form composes a WhatsApp message in the browser. It is useful now but does not pretend to store or deliver an inquiry. This choice and its alternatives are in [ADR 003](../decisions/003-public-inquiry-and-demo-content.md). A formal backend form and the private portal still require their own specification, provider/security decisions and approval.

## How it works

### Structured content and shared routes

`src/content/site.ts` contains typed service families and project records. Cards and detail templates read those records, so a service name or description is maintained in one place. `src/app/services/[slug]/page.tsx` uses the URL segment to select a service page; unknown segments return 404. The approach avoids separate, duplicated page implementations. A CMS would offer nontechnical editing but would also need storage, permissions and publishing controls; it is not necessary while Henry maintains the content.

### Server and browser responsibilities

Next.js renders the informational pages on the server, mostly at build time. Navigation, project filtering and inquiry preparation are small interactive client components. This keeps the readable business content available without making visitors wait for client-side content fetching. Contact reads an allowed service from its URL query; that is public context, not a stored job or confidential identifier.

### Validation versus delivery

`src/lib/inquiry.ts` validates the input and returns either field errors or a plain-text message. `inquiry-composer.tsx` displays that result, and the existing contact helper URL-encodes the message for the approved WhatsApp destination. The browser does not submit it to Mias automatically. Editing a field clears the old preview so the send link cannot retain stale details.

These are client-side usability checks. They would not protect a future backend: once a server accepts requests, it must validate again, enforce limits and handle delivery/storage errors. A prepared message is not a delivery receipt, and opening WhatsApp is not proof that the visitor pressed Send.

### Evidence and demo content

The three fictional examples demonstrate a problem/approach/outcome layout. They have no invented reviewer, named customer, completion date or success statistic. Supplied images are clearly described as illustrative in those stories. `src/lib/project-visibility.ts` excludes fictional records when public-launch mode is enabled; real stories still need documented approval. The future staff editor is recorded as a requirement, not represented by a nonfunctional login button.

## Problems and solutions

- Original contact actions were unavailable because destinations were unknown. User confirmation now supports working links without guessing.
- Early full-page screenshots did not trigger every lazy-loaded image. The capture script now scrolls and decodes each image before taking its snapshot.
- A generated-directory permission error interrupted one sandboxed build. The approved retry succeeded; no workaround was embedded in the application.
- CSS scaling was not equivalent to browser zoom. Reflow was checked with the appropriate reduced CSS viewport; native-browser zoom remains a manual verification item.

## What Henry should review next

1. Refresh the local website. Try a service page, open its inquiry link and confirm the service selection. Prepare a sample message without sending it unless you intend to contact Israel.
2. Switch project categories, open an example story and decide whether the story structure suits real Mias work.
3. Review the logo, colours and mobile layout. Supply one genuine project record using [the intake template](../content/business-intake.md), plus Israel's approved portrait when available.

## Remaining work

Human review, genuine case studies/reviews and publication permissions; backend lead handling; production SEO/performance/accessibility/device checks; deployment. Customer/company accounts, job tracking, staff photo/story publishing, invoices/quotations and the solar planner remain future SDD increments. Solar recommendations require owner-approved engineering assumptions, equipment and prices rather than guessed outputs.

## Knowledge check

1. Why can the website prepare a valid WhatsApp message without knowing whether Israel received it?
2. Which interactions require client components, and why can service descriptions remain server-rendered?
3. Why must a genuine project record include permissions and verified work details rather than only a photograph and a customer name?
