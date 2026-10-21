# Private development roadmap and launch-readiness plan

Date: 2026-10-19  
Status: **Proposed for Henry's review — planning only, not feature implementation or deployment approval.**  
Schedule: Outcome-based increments; no fixed deadline.

## 1. Objective and boundaries

Build a dependable Mias Energy Solutions website and service platform, demonstrate that its important journeys work, and keep it private until Henry and the business owner explicitly approve launch. “Ready” means meeting agreed acceptance criteria with evidence; it cannot mean a guarantee that software will never have a defect.

This roadmap includes the full requested direction: public pages, reliable inquiries, customer/company portals, job tracking and communication, staff-managed project/testimonial publishing, quotations/invoices and a household solar planner. Working assumption: develop and review these privately before deciding what belongs in the public release. Do not silently drop a requested module or treat every future module as already approved for implementation.

This is a product sequencing and verification roadmap. Detailed implementation/test plans are written only after approval of each feature specification. No database, authentication system, media store, email service, hosting plan or recurring cost is selected here. The existing approved Next.js/TypeScript/Tailwind stack stays unchanged.

## 2. Starting position

The local website has Home, service-family pages, shared solar pumping, a filterable Projects area with three labelled fictional stories, About, direct contacts and a browser-only WhatsApp composer. It has no persisted requests, accounts, staff editor, billing documents or solar calculator. The logo concept and content still need human review.

The previous verification recorded 65 passing tests, a successful TypeScript check and production build. Those results cover that increment, not this proposed roadmap. The suite was run against the development server, not a separately running production server. Physical-phone, broader-browser, native zoom, Lighthouse and real inquiry-delivery verification remain incomplete.

References: [MVP baseline](../../specs/mias-website-mvp.md), [expansion direction](../../specs/002-business-platform-expansion.md), [implemented public increment](../../specs/003-public-website.md), [verification report](../testing/003-public-website-results.md).

## 3. SDD checkpoints for every increment

1. **Specification:** define the problem, users, scope/exclusions, data, acceptance criteria, failure cases and open decisions. Give requirements stable IDs. Henry reviews and explicitly approves before planning implementation.
2. **Implementation and test planning:** explain realistic alternatives and trade-offs. Resolve major security, storage, provider, cost and UX decisions through separate approval when needed. Update the spec if a decision changes its requirements.
3. **Tests first:** write pytest tests against the actual application/TypeScript behavior, collect them, and verify that expected failures reflect missing behavior rather than a broken setup. Do not duplicate application logic in Python simply to make a test pass.
4. **Implementation:** build the smallest complete approved slice. Run tests, fix defects and check both phone and laptop behavior. Keep changes and commits focused; do not commit secrets or raw private evidence.
5. **Review:** record results and limitations, demonstrate the journey, explain the important files/data flow and give Henry 2–3 short knowledge-check questions. Human acceptance is separate from passing automated tests.

Maintain a simple requirement-to-test record in each increment. New requirements require spec review; ordinary fixes restoring already-approved behavior do not require restarting the whole process. Approval of this roadmap is not blanket approval of future feature specifications.

## 4. Proposed delivery order

### Phase 0 — review the current website and settle the next scope

**Work:** Walk through Home → service → inquiry, Projects → story, and About → contact on laptop and phone-sized layouts. Record concrete feedback by page, expected behavior and screenshot where useful. Distinguish defects from preferences and new features.

Reconcile the baseline and expansion documents before the next implementation. In particular, the baseline asks for individual confirmed-service pages and a backend form; the current family pages and WhatsApp composer are partial delivery, not replacements silently accepted as complete. Keep already-confirmed facts; do not repeat questions about Israel's approved contacts.

**Deliverables:** prioritized review list, current requirement status, and a draft next-increment specification for public-site completion.

**Exit:** Henry explicitly approves that specification and identifies the public design/content direction. No code changes are bundled into the approval request.

### Phase 1 — finish the customer-facing website

**Work:** Apply approved design refinements on laptop and phone; review logo treatment; complete useful individual service content under the three families. Replace the fictional project examples with verified records, or agree a truthful empty/hidden presentation where evidence is unavailable. Add Israel's approved portrait/biography when supplied. Confirm operating days and wording, customer permissions and final contact details. Prepare page-specific metadata alongside the content.

**Inputs from Henry:** layout/logo feedback; actual project descriptions linked to image filenames; permission to show customers, premises and people; portrait; operating days; confirmed service descriptions. A partial customer list is acceptable. Missing testimonials are omitted, not invented. A street address is not required if only a service area is intended for publication.

**Verification:** content review, working links/404 behavior, service context in inquiry links, mobile/keyboard interaction, alt text and image loading. Check that factual stories do not retain fictional-only headings/captions from the demo template. Test the public-ready mode and all entry points to ensure demos are absent, including direct URLs and future sitemap entries.

**Exit:** all agreed public pages are useful and factually approved, with no fabricated claims or unresolved demo content in the release version.

### Phase 2 — reliable inquiry receipt

**Work:** Specify a visitor request flow that does not require an account. Decide whether acceptance means delivery to an approved inbox or durable request storage, how Israel is notified and how failed delivery is detected. Compare practical delivery/storage options and costs before choosing one. Do not add a database to the current site merely in anticipation of the portal; if shared request storage is justified and approved, document its relationship to the upcoming portal.

Collect only necessary fields and a reply channel. Implement server validation, accessible pending/success/failure states, abuse controls, retry/duplicate handling and a direct-contact fallback. Agree retention, operator access, redacted logging and privacy wording. A notification being accepted by a provider is not proof that Israel has read it.

**Inputs:** receiving mailbox/channel, who responds, acceptable fields, desired records/retention and operating budget. The proposed company mailbox is not used until created and verified.

**Verification:** valid receipt, malformed input, service-context handling, provider/storage failure, timeouts, repeated submission and rate limits. Conduct a clearly identified real test inquiry with Israel's agreement; confirm receipt directly.

**Exit:** acceptance and failure messages reflect what actually happened, and the business can receive and act on a request.

### Phase 3 — secure customer/company portal and jobs

**Prerequisites:** approved roles, customer enrollment and organization-membership rules, actual job lifecycle, expected usage, access/retention rules and budget. Record architecture alternatives and approval for authentication, persistent storage and private attachments before implementation.

Split this phase into separately reviewed slices:

1. Accounts, identity verification, recovery/logout and server-enforced permissions.
2. Staff request triage and creation/assignment of jobs.
3. Customer view of their own requests, status history and next steps.
4. Staff progress updates and customer-visible communication, kept separate from internal notes.

Prefer a simple dated conversation to real-time chat unless a requirement justifies it. Imported historic work requires verified customer association; matching a typed email or company name is not sufficient authorization.

**Verification:** use two customers and different staff roles. Attempt forbidden list/detail/update/download actions directly, not only through hidden buttons. Test revoked access, expired sessions, invalid job transitions, failed writes and attachment restrictions where uploads are included.

**Exit:** the approved request → job → progress → completion journey works, and one customer cannot access another customer's records or internal staff notes.

### Phase 4 — company-managed public content

**Work:** Give authorized staff a way to create project stories, attach approved images and manage genuine testimonials. Provide draft, preview, publish and unpublish behavior, an approval record and validation. Reuse the approved identity/access foundation rather than introducing another login system without need.

Keep private job files separate from public publishing. Enforce image type/size rules, handle failed uploads and remove unnecessary metadata from publication copies. Do not automatically turn job attachments or customer messages into public content.

**Verification:** publishing permissions, draft confidentiality, public rendering, image descriptions, failed saves/uploads and unpublishing behavior. Fictional demo records must not become publishable by simply changing a label.

**Exit:** designated staff can update approved public content without editing code, and private content remains private.

### Phase 5 — quotations and invoices

**Work:** Use sanitized real document examples to specify numbering, line items, currency, calculations, terms, approval/issue states and corrections. Build drafts first, then controlled issue and protected customer view/download. Track document versions rather than silently overwriting an issued record.

**Inputs:** quotation/invoice samples and owner-approved rules for tax where applicable, rounding, discounts, transport/labour, validity, due dates and payment-status recording. Do not guess financial rules or imply online payment processing/full accounting is included.

**Verification:** owner-approved worked totals, invalid/edge values, unique numbering, permission checks, draft/issued visibility, revision behavior and readable generated documents on phone and laptop.

**Exit:** an authorized staff member can issue a correct document and only the intended customer can retrieve it.

### Phase 6 — solar planning and quotation handoff

**Work:** First specify appliance entry and an explainable load summary. Then, only with approved engineering rules, extend it to supported equipment and indicative pricing. Show units, assumptions, exclusions and when technical assessment is required. Preserve the inputs with a quotation inquiry; do not treat the result as a final design or guaranteed price.

**Inputs:** a Mias technical reviewer, supported products, approved appliance assumptions and sizing rules, current prices and at least three independently worked examples. Unsupported or unknown requirements should request assessment, not generate plausible-looking answers.

**Verification:** approved examples, invalid/missing inputs, unit handling, unsupported loads, stale/missing prices and faithful inquiry handoff. Any server-side use must not trust a customer-edited browser total.

**Exit:** results are reproducible and explainable and have technical approval. If only a load-summary tool is ready, reducing the promised feature scope requires Henry's approval; do not label it a complete system/cost recommender.

### Phase 7 — integrated release verification and private pilot

Quality checks happen in every phase; this is the final combined rehearsal, not the first testing stage.

- Run the full suite against the optimized production build, not just the development server. Exercise complete journeys across the included modules.
- Test physical Android/mobile use and laptop use, agreed major browsers, keyboard/screen-reader behavior, real 200% browser zoom, contrast, slow connections and layout stability.
- Measure Lighthouse performance/accessibility/best-practices/SEO targets of 90+ on representative page types under recorded conditions. Fix measured causes; document any accepted exception without claiming full WCAG compliance from a score.
- Complete canonical URLs, Open Graph, sitemap, robots and confirmed local-business structured data. Exclude private pages and demos; do not expose drafts through metadata or assets.
- Review secrets/dependencies, access controls, logs, privacy, error handling, upload limits and failure/abuse scenarios. Confirm private data does not leak through caches, downloads or notifications.
- Verify backup restoration for stored data, recovery from a failed deployment, account recovery and who handles failed inquiries. Agree recovery expectations rather than inventing service guarantees.
- Run a private pilot with Henry and Israel and separate controlled test-customer accounts. Start with synthetic data; use real information only with permission. Record problems and repeat affected tests after fixes.

**Exit:** the release gates below pass with evidence, and Henry can demonstrate and explain the included workflows.

### Phase 8 — explicit launch approval and controlled release

Agree the exact included feature list, hosting/domain, costs, account ownership and launch operator. No unfinished module is advertised. Obtain Henry/business-owner go-ahead before production deployment, domain changes or opening access/indexing.

Deploy the approved version over HTTPS, configure approved secrets privately, run production smoke tests and a consented real inquiry, then open the site to the public. Check public indexing settings at this point. Monitor failures through the agreed operating process and keep a tested rollback route. A failed release check means pause/rollback, not announce completion.

## 5. Private development safeguards

- Keep using the local preview now. No new deployment or external service is authorized by this document.
- If remote testing is needed, first approve an access-controlled staging environment and its costs. `noindex` is a search directive, not an access-control mechanism.
- Keep staging and production records/credentials separated. Do not import real customer files for convenience or send test notifications to customers.
- Preparing a message, selecting a provider or displaying a success screen is not evidence of a completed real-world business action.

## 6. Release gates

Public launch requires all of the following for the explicitly included scope:

1. **Scope/content:** approved release specification, genuine permitted content, no demo claims, no advertised broken/unimplemented controls.
2. **Functionality:** mapped acceptance tests and real end-to-end journeys pass on the production-like build; inquiry receipt is confirmed.
3. **Security/privacy:** no unresolved high/critical defects; permissions and data isolation verified wherever accounts/storage exist; approved data handling and protected secrets.
4. **Usability/quality:** phone and laptop journeys pass, measured performance/accessibility findings are reviewed, and blockers are fixed. Automated scores alone are insufficient.
5. **Operations:** named owner/maintainer, approved recurring costs, documented update/recovery procedures and tested restore/rollback where relevant.
6. **Human sign-off:** Henry understands the architecture/data flow and Israel confirms business accuracy and operational usability. Explicit launch approval is recorded.

Blocking defects include data disclosure, lost requests reported as successful, unauthorized access, incorrect issued totals and inability to complete a core customer journey. Lower-severity issues need recorded impact, an owner and a decision; deferral cannot silently waive an approved requirement. This roadmap does not promise zero future defects.

## 7. Immediate next action

Recommended next increment: **public-site completion and verified project content**, starting with specification only.

Henry's first inputs:

1. Review the current pages and list what to keep/change, including the logo concept.
2. Complete one real project record from the [intake worksheet](../content/business-intake.md), linking the relevant filenames to the work Mias actually performed. More records can follow.
3. Provide Israel's approved portrait when available and confirm working days/time wording.
4. Describe, in a few sentences, what Israel currently does after receiving a customer inquiry. This informs the next intake/portal specifications without delaying unrelated content review.

Then draft the bounded feature specification for Henry's approval. Do not start implementation from this roadmap alone. As facts arrive, record which items are confirmed, pending or explicitly deferred instead of filling gaps with invented content.
