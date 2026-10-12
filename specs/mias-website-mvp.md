# Mias Energy Solutions website MVP — specification

Status: **Approved for incremental development**  
Last revised: **2026-10-12**  
Delivery model: **Flexible milestones and iterative development; no fixed deadline**  
Source: User-provided master project brief and subsequent project instructions.  
Scope: Responsive, browser-based business website and digital inquiry platform for Mias Energy Solutions, Lusaka, Zambia, usable on laptops, desktops, tablets, and mobile phones.

## 1. Purpose and approval boundary

The website shall help a mobile visitor identify what Mias does, assess credible evidence, and start a relevant inquiry through WhatsApp, telephone, or a quotation/contact form in about 30 seconds. This document defines the production MVP. It is a product specification, not approval of a framework, provider, data store, cost, or deployment service.

The deliverable is a website customers access through a web address in a browser, with no application installation required. One responsive website adapts its content, layout, navigation, and controls to the visitor's screen and input method. Laptop and mobile visitors must both have access to the essential services and inquiry journeys.

Local development refers only to previewing and testing the website on the developer's computer before deployment. It is not a separate desktop product or the final delivery model. The production milestone makes the approved website publicly accessible over HTTPS.

The former 16-week schedule is retired. Development proceeds at the developer's pace in small, reviewable increments. Working website previews may be built while discovery continues, and findings from the website, user feedback, or defects may lead to specification changes. Completion is determined by acceptance criteria rather than elapsed weeks.

Website implementation begins after approval of this revised specification and definition and validation of tests for the selected increment. Each increment follows the SDD sequence in section 9: specification, approval, implementation/test planning, pytest tests and test validation, then implementation and verification. The entire production MVP does not have to be specified at implementation-level detail or tested before the first increment can be built.

Business claims and contact details remain unpublished until the business owner verifies them. Missing information may be represented by clearly identified placeholders in local development. Production deployment and unresolved major architecture, security, data-handling, service, or cost decisions still require human approval.

## 2. Users and primary journeys

| User | Need | Successful journey |
| --- | --- | --- |
| Prospective residential or commercial customer | Understand relevant services and ask for help | Arrives on a service or home page, understands the offer, and opens a service-contextual inquiry path. |
| Referral visitor | Check legitimacy and past work | Finds About and approved project evidence, then contacts Mias. |
| Business owner or designated lead recipient | Receive actionable inquiries | Receives a usable inquiry with a reply channel and enough context to respond. |
| Content maintainer | Correct facts as services or contacts change | Updates approved business information without leaving conflicting details elsewhere on the site. |

The exact customer segments and service priorities are **pending owner confirmation**. These journeys are working assumptions for approval, not claims about the business.

## 3. MVP scope

### Included

- Home, services overview, one detail page per confirmed service, About / Why Mias, projects or gallery, and contact pages.
- One responsive website with navigation, readable content, and clear calls to action on both laptop/desktop and mobile screens.
- WhatsApp, click-to-call, and validated quotation/contact form paths using confirmed contact details.
- Approved business copy and assets; semantic, accessible page structure; useful alt text.
- Page titles and descriptions, canonical URL policy, social sharing metadata, sitemap, robots configuration, internal links, and local business structured data only where facts are confirmed.
- Secure form processing, spam and abuse controls, observable delivery outcomes, production HTTPS, and operating documentation.

### Excluded from this release

Quote calculator, multi-step wizard, automated service selector, customer accounts, payments, advanced CMS or database, blog, analytics dashboard, complex animation, and multilingual support. Any addition requires a spec change and approval.

## 4. Functional requirements

Requirements use stable IDs so later acceptance checks can trace to them.

| ID | Requirement |
| --- | --- |
| FR-01 | Home page identifies Mias, states an owner-approved value proposition, summarizes confirmed services, presents approved trust evidence, and offers a prominent inquiry action at the start and end of the page. |
| FR-02 | Services overview lists every confirmed active service with a plain-language summary and a link to its detail page. Unconfirmed services shall not be advertised. |
| FR-03 | Each service page explains the customer problem, intended audience, Mias offering, relevant verified evidence, and a contact action carrying the service context. Its URL and page title shall distinguish the service. |
| FR-04 | About page presents verified identity, location or service area, team or credentials only when evidenced, and an inquiry path. It shall not imply certification or experience that has not been confirmed. |
| FR-05 | Projects/gallery publishes only owner-approved projects and media with permission to use them. Each published item identifies its subject sufficiently to be useful without exposing confidential customer information. If no projects are approved, the public page shall have a truthful empty state or be omitted from navigation until content is available. |
| FR-06 | Contact page presents confirmed public phone, WhatsApp, email, location or service area as applicable, response expectations only if approved, and the form. All repeated contact details shall draw from a consistent content source. |
| FR-07 | Primary navigation reaches all published primary pages, works by keyboard and touch, indicates the current location, and provides a visible route to contact. No primary page shall be orphaned. |
| FR-08 | WhatsApp and telephone actions use confirmed destinations. Service-specific actions shall preserve the service name or context in the prefilled message or inquiry route. If a destination is unconfirmed, its action shall not appear publicly. |
| FR-09 | The form collects only the information needed to reply and understand the request: name, at least one valid reply channel (phone or email), service or subject, and message. Required fields and limits shall be clear to the user. The exact field labels and maximum lengths are finalized during planning. |
| FR-10 | Client and server validate form data. Invalid submissions show field-level, accessible errors without losing valid input. Submitting shows a pending state that prevents accidental duplicate actions. |
| FR-11 | A success message appears only after the submission destination acknowledges acceptance. Failure shows an actionable error and an alternate contact path; it shall never report success for a failed delivery. The owner-designated recipient shall receive enough context to respond. |
| FR-12 | Form processing limits spam and request volume, rejects malformed input, protects secrets, and avoids exposing internal errors or recipient credentials to visitors. Storage and retention are determined before production use. |
| FR-13 | Each public page has a unique descriptive title and description, appropriate canonical URL, logical heading structure, and relevant internal links. Sitemap and robots rules reflect only publishable pages. |
| FR-14 | LocalBusiness structured data contains only approved facts and matches visible site content. Missing facts are omitted, not guessed. |
| FR-15 | The site provides a useful failure state for unavailable form delivery and for missing or invalid page routes. No development placeholder, dummy contact action, or fabricated claim may be published. |
| FR-16 | The content maintainer has documented steps to update services, contact destinations, approved projects, metadata, and images, plus a way to verify the resulting site. |

## 5. Quality and operational requirements

| ID | Requirement and acceptance threshold |
| --- | --- |
| NFR-01 | Layout and key journeys work without page-level horizontal overflow from 320 px mobile width through desktop widths. Verify representative viewport widths of 320, 390, 768, 1366, and 1440 CSS pixels, plus behavior between breakpoints. Text remains legible and controls remain operable at 200% browser zoom. |
| NFR-02 | Target WCAG 2.2 AA for the public experience: keyboard access, visible focus, meaningful labels, error association, adequate contrast, semantic landmarks, appropriate alternative text, and reduced-motion behavior where motion exists. Any exception requires a recorded defect and owner decision before launch. |
| NFR-03 | Lighthouse scores target 90 or higher for performance, accessibility, best practices, and SEO on representative published page types under a documented test profile. Scores are measured and recorded; a score is not claimed from code inspection alone. |
| NFR-04 | Public pages and form submission use HTTPS in production. Private credentials remain server-side. Untrusted form input is treated as data, never executable content, and logs avoid unnecessary personal information. |
| NFR-05 | A real end-to-end test inquiry reaches the designated recipient before launch. A failed delivery is visible to the sender and diagnosable by the operator without disclosing private details. |
| NFR-06 | Content, images, and external services have an identified owner and usage permission. The site avoids third-party tracking until the owner approves its purpose and privacy behavior. |
| NFR-07 | The product has setup, deployment, content update, recovery, and decision documentation sufficient for a maintainer to operate it. |
| NFR-08 | Essential content and inquiry actions remain available on both laptop/desktop and mobile layouts. Navigation supports mouse, keyboard, and touch; essential information is not available only on hover. Images, text, and form controls adapt to available width without reducing the mobile experience to a scaled-down desktop layout. Each completed UI increment includes verification on a laptop-sized and a phone-sized viewport. |

## 6. Acceptance scenarios

1. **Find and contact:** On a narrow mobile viewport, a visitor can reach a relevant confirmed service from the home page and start a contextual WhatsApp, phone, or form inquiry without searching through unrelated pages.
2. **Validate inquiry:** Submitting an empty form identifies required fields. Supplying a malformed reply channel identifies the relevant field. Correcting the values retains other entered data.
3. **Successful inquiry:** With a valid submission and working destination, the visitor receives confirmation only after acceptance, and the designated recipient receives the name, reply channel, service or subject, and message.
4. **Failed inquiry:** If the destination is unavailable or rejects the submission, the visitor receives a clear failure message and working alternative contact information; no success confirmation is shown.
5. **Verified content:** A review of every public page finds no unapproved service, project, credential, customer claim, number, or dummy contact detail. LocalBusiness data agrees with visible approved facts.
6. **Navigation and accessibility:** A keyboard user can reach and operate navigation, calls to action, and form controls; focus is visible, form errors are announced or associated, and the primary journeys remain usable on mobile and desktop.
7. **Search readiness:** Published pages expose correct titles, descriptions, canonical URLs, and indexability; excluded or missing pages do not appear in the sitemap.
8. **Launch check:** HTTPS is active, real contact actions reach the correct destination, a real form inquiry reaches the responsible person, and the owner approves the public content.
9. **Laptop journey:** At laptop-sized viewports, a visitor can read the homepage, browse services, navigate with a mouse or keyboard, and reach WhatsApp or the quotation/contact form. Content is readable without excessive line lengths or stretched layouts. Telephone links remain available where configured, although calling depends on the visitor's device and installed handler.
10. **Responsive continuity:** Moving between the specified mobile, tablet, and laptop/desktop widths preserves essential content and usable inquiry actions. Menus, service cards, images, and forms reflow without overlapping, clipping, or requiring hover for essential actions.

## 7. Business facts and decisions to resolve before production

These are explicit inputs, not permission to invent substitutes:

- Legal/public business name, address or service area, and authorized public phone, WhatsApp, and email.
- Active services, priority services, target customers, and the wording of the core value proposition.
- Approved logo, brand assets, photographs, projects, credentials, registrations, testimonials, and usage rights.
- Inquiry recipient, response process, acceptable form fields, privacy notice, data retention, and any legal constraints.
- Form delivery architecture and provider, spam controls, any data store, recurring cost, analytics, hosting, and domain.
- Content maintainer and final launch approver.

Owner interviews and discovery continue alongside development when useful. A complete interview is not a prerequisite for building a website increment that does not depend on the missing answers. Answers must be recorded and reviewed before replacing placeholders with public claims. A missing answer blocks only the affected public claim or destination, and blocks launch if it prevents a required inquiry path or truthful core page.

## 8. Definition of done

The MVP is done when FR-01 through FR-16 and NFR-01 through NFR-08 are verified, the acceptance scenarios pass, required owner approvals and business facts are recorded, severe defects are resolved, real lead delivery is confirmed, and operating documentation is available. Specification approval authorizes the next SDD stage, planning; it does not by itself approve production launch or unresolved business facts.

An individual increment is done when its approved acceptance criteria are met, applicable tests pass, relevant mobile and desktop behavior is checked, accessibility and performance implications are reviewed, meaningful decisions are documented, and the developer understands how it works. A completed increment does not imply that the whole MVP is production-ready.

## 9. Spec-driven development and change process

The following sequence applies to each substantial feature or material change:

1. **Specification:** Define the objective, relevant requirement IDs, scope, acceptance criteria, assumptions, and unresolved decisions in this specification or a linked increment specification. Obtain human approval before advancing. Existing approval remains valid for unchanged requirements.
2. **Planning:** Outline the implementation and test plan for the approved scope. Identify important alternatives and dependencies. Obtain any outstanding approval for major architecture, security, scope, recurring cost, storage, third-party service, deployment, or UX decisions before work that depends on them.
3. **Testing:** Write pytest unit/integration tests for the selected increment, trace them to its acceptance criteria, and validate test collection and behavior before feature implementation. Where application code does not yet exist, record the expected failing cases and confirm that failures reflect missing required behavior rather than a broken test setup. An expected failure is not a passed test.
4. **Implementation:** Implement the smallest complete increment only after its tests are defined and validated. Run the tests against the actual application, fix defects, complete appropriate browser/manual checks, and integrate the verified change into the application.
5. **Review and learning:** Document the outcome, explain how it works, check the developer's understanding, and select the next increment from evidence and business priorities.

Pytest is the requested test tool; its use does not select a Python application or backend. The planning stage shall explain how tests exercise the chosen stack. Tests must check actual application behavior rather than a separate reimplementation of its business logic. Any additional stack-specific test tooling requires an identified need and documented rationale.

Feedback and newly discovered issues may change the scope or ordering of future increments. Update the affected requirements and acceptance criteria before planning and testing changed behavior. Preserve stable requirement IDs and record approved changes. Routine fixes that restore already-approved behavior do not require approval of the entire specification again.

## 10. Flexible delivery milestones

These milestones describe outcomes, not deadlines or mandatory calendar phases. Work may overlap where dependencies permit, while every substantial increment follows section 9.

| Milestone | Outcome |
| --- | --- |
| Requirements baseline | Approved MVP boundary, initial journeys, explicit unknowns, and acceptance criteria for the first increment. Discovery can continue. |
| First responsive website preview | A browser-accessible website foundation with initial homepage content, primary navigation, and an honest contact entry point, verified on laptop and phone layouts. The first preview runs locally for development before later deployment. Missing contact details do not produce dummy external links or submissions. |
| Core customer experience | Home, services, About, projects/gallery, and contact journeys satisfy their approved requirements. |
| Reliable inquiry handling | Verified destinations and secure, validated submission processing with tested success and failure behavior. |
| Content and quality readiness | Owner-approved content, SEO, accessibility, performance, and critical customer journeys have documented verification. |
| Production launch | Approved deployment, domain/HTTPS configuration, final QA, and successful real lead delivery. |
| Handover and continued improvement | Operating guides, architecture decisions, testing evidence, and portfolio material are available; further work is prioritized from feedback. |

The first approved increment is the responsive website foundation, scoped in `specs/001-responsive-foundation.md`. The developer approved the revised baseline and implementation start, followed by Next.js, TypeScript, Tailwind CSS, and structured local content without a database. Hosting and production launch remain separate decisions.

### Design and implementation order

Approved approach: the desktop/laptop design may be developed and reviewed first within an increment, followed by its mobile layout and interactions before the increment is considered complete. Shared content and components must support both from the outset. A separate desktop-only website is not an intermediate delivery milestone.

Deferring all mobile work until after the entire desktop website is built is not recommended: navigation, content order, form usability, and image choices often need changes on small screens. Addressing those needs within each increment keeps feedback timely and reduces rework. This does not change the flexible schedule or require completing all page designs before beginning the first approved increment.

## 11. Documentation and progress tracking

- Maintain the project brief, requirements, sitemap, architecture, testing, accessibility, SEO, security, deployment, and content-update documentation as relevant work is completed.
- Record significant technical decisions in short ADRs covering context, options, decision, reasoning, trade-offs, and consequences.
- Replace mandatory weekly journals with entries after meaningful increments or development sessions. Record accomplishments, decisions, problems, solutions, learning, unfinished work, and next steps. Use dates or increment identifiers rather than required week numbers.
- Track progress by approved requirements, completed increments, open issues, and milestones. No 16-week completion target applies.
- `mias-energy-project-plan.html` is the historical 16-week plan. Its week numbers, progress controls, and calendar ordering are superseded by this specification; the HTML file has not been updated as part of this revision.

## 12. Revision history

| Date | Change | Approval state |
| --- | --- | --- |
| 2026-10-12 | Removed the fixed 16-week delivery model; allowed iterative local development alongside discovery; retained SDD gates and production requirements; replaced weekly reporting with increment/session records. | Revised specification awaiting human approval. |
| 2026-10-12 | Clarified the deliverable as a responsive website for laptops and phones, distinguished local preview from public hosting, expanded responsive acceptance criteria, and proposed desktop-first design within each increment with mobile verification before completion. | Revised specification awaiting human approval. |
| 2026-10-12 | Developer approved the revised specification and implementation start, then explicitly approved Next.js, TypeScript, Tailwind CSS, and structured local content without a database. | Approved for incremental development; production launch not yet authorized. |
