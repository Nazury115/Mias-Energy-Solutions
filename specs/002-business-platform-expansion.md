# Mias website and service platform — proposed expansion

Status: **Expansion direction approved by Henry; public website selected for the next increment.**  
Date: **2026-10-19**  
Stage: **Public increment authorized; portal, document and calculator implementation remain separately gated.**  
Delivery: Flexible increments; no fixed 16-week deadline.

**Scope amendment — Henry, 6 November 2026:** the solar planner (SOL-01–07) is removed from active delivery and remains a deferred suggestion. Improve the existing public site, inquiries, customer/staff jobs, messages, publishing and documents first. The historical calculator requirements below do not authorize implementation or block launch. See [the scope change](../docs/plans/planner-retirement.md).

## 1. Purpose and relationship to the approved website

Expand Mias Energy Solutions from its current responsive homepage into a credible public business website, a private customer/company service workspace, and a solar planning tool that helps customers prepare quotation requests.

The approved [MVP specification](mias-website-mvp.md) and [foundation increment](001-responsive-foundation.md) remain the implemented baseline. Accounts, stored job records, quotations/invoices and a calculator were previously excluded. This document proposes those additions; it does not silently approve a database, authentication provider, storage service, recurring cost or production deployment.

Public pages must remain usable without an account. Customers and staff use different authorized views of the service workspace. A login screen alone does not constitute a secure portal.

Supporting material:

- [Loxlak public website review](../docs/research/loxlak-review-2026-10-19.md)
- [Project photograph inventory](../docs/content/proof-of-service-inventory.md)
- [Business information and project intake worksheet](../docs/content/business-intake.md)

## 2. Facts supplied and publication boundaries

| Item | Recorded information | Publication state |
| --- | --- | --- |
| Business | Mias Energy Solutions, Lusaka, Zambia | Supplied in the approved brief. Exact registered name/address remain unconfirmed. |
| Director and CEO | **Israel Masauso** | Name corrected by Henry on 2026-10-19. About-page profile requested. No biography or credentials supplied. |
| Israel's email | `imasauso@gmail.com` | Henry explicitly permits public display. Keep the supplied email spelling; do not reconstruct it from the surname. |
| Israel's phone | `+260 977747285` | Henry explicitly permits public display and confirms WhatsApp. Normalized link value: `+260977747285`. Israel handles business inquiries. |
| Website manager | Henry Masauso | Responsible for website management. Keep personal contact information internal unless separately approved for display. |
| Henry's internal contact | `henrymasauso85@gmail.com`; `+86 158 8827 9619` | Requirements/coordination information, not automatically a public sales channel or an administrator account. |
| Future company mailbox | An address such as `miasenergysolutions@gmail.com` is proposed | Not created/verified; do not publish, send to, or use for account setup. |
| Additional active services | Irrigation, electrical upgrades, urgent breakdown call-outs | Explicitly confirmed by Henry. Exact scope and exclusions still need short service descriptions. |
| Hours | User supplied “09–05”; recorded as 09:00–17:00 | Operating days, holidays and explicit local-time wording need confirmation. Do not infer Monday–Friday or 24/7. |
| Coverage | Lusaka for faster response; elsewhere in Zambia generally takes a few days | Publish service by arrangement. Do not promise a fixed arrival time, same-day service, or guaranteed national response. |
| Evidence | 30 supplied JPEG photographs | Selected images approved for this local preview by the implementation request; public publication permissions and precise project facts remain to be recorded. |
| Selected customers | Lusaka Water and Sewerage Company; Plumbfix; Family Legacy | Supplied by Henry for the preview. Partial text list; no logos, endorsements or demo-story attribution inferred. |

Missing business facts use `TODO: Confirm with business owner` in internal drafts. Public pages omit unresolved claims rather than expose internal TODOs. Israel's profile needs his approved portrait and a short factual biography. A portrait does not establish qualifications or certification.

## 3. Users and intended outcomes

- Prospective homeowners, farms, businesses, NGOs, institutions and property developers: identify a suitable service, inspect credible work and contact Mias quickly.
- Existing individual or organizational customers: submit requests and see their own recorded jobs, updates, messages and issued documents.
- Mias operations staff: review requests, respond, manage assigned work and publish customer-facing progress.
- An authorized commercial/owner role: review and issue quotations/invoices, control staff access and correct records with accountability.
- Henry as technical maintainer: maintain the website and its operation. Technical responsibility does not automatically grant unrestricted customer-data access; operational permissions must be explicitly assigned.

## 4. Proposed public structure and service taxonomy

Primary navigation: Home, Services, Projects, About, Contact. Add a distinct service-request action. Add Customer Login and Solar Planner only when the corresponding approved features work.

| Service family | Included services | Notes |
| --- | --- | --- |
| Water solutions | Borehole pumps, booster pumps, solar water pumping, water treatment, irrigation, plumbing and water infrastructure | Describe each service separately where there is useful confirmed content. Borehole pump installation does not imply borehole drilling. |
| Electrical solutions | Electrical installations, upgrades, maintenance and fault support; pump/electrical control panels | Specific equipment, testing, inspection or certification claims require confirmation. |
| Renewable energy | Solar PV/electrical systems, solar water pumping, related installation and maintenance | Solar pumping is discoverable from both Water and Renewable Energy but has one authoritative detail page. Do not infer wind, biogas or other technologies. |

“Repairs & support” is a prominent cross-service inquiry path, not a competing fourth technical category. Use Mias's own wording rather than Loxlak's branded service name. Customer types belong in a separate “Who we serve” section; do not mix industries with services in the navigation.

Proposed page hierarchy:

```text
Home
Services
  Water / Electrical / Renewable energy
  Confirmed service detail pages
Projects
  Individual case studies with optional approved testimonial
About
  Company introduction and Israel's profile
Contact / Request a service
Solar planner                         [later approved increment]
Customer login / Customer workspace   [later approved increment]
Company workspace                    [authorized staff only]
Privacy information
```

The homepage should present, in order: a clear offer and contact action; approved customer names/logos when available; three image-backed service families; selected real projects; repairs/support availability; a concise introduction to Mias and its leadership; approved testimonials where available; a final inquiry action. Adjust ordering during design review if it improves discovery. Avoid filling every section with placeholders.

Project stories and testimonials are related but distinct. A project can be published without a review. A review needs exact approved words, attribution and permission; it must never be generated to fill an empty card. A separate testimonials page is optional if enough genuine material becomes available.

## 5. Public website requirements

| ID | Required behavior and acceptance condition |
| --- | --- |
| PUB-01 | Home identifies Mias, its services and location, presents the three service families with relevant approved imagery, and exposes contact/request actions on phone and laptop layouts. |
| PUB-02 | Each published service explains the problem, offering, audience, relevant limitations and inquiry path. Shared navigation remains consistent; every published destination resolves correctly. |
| PUB-03 | Each case study connects approved photos to a confirmed customer problem, Mias's actual role/work and a factual outcome. Dates, location precision, capacities and stage captions appear only when verified. |
| PUB-04 | A customer-name/logo section uses only approved identities. It distinguishes customers served from equipment brands, partners or authorized dealerships. A partial list is labelled as selected customers and produces no implied total. |
| PUB-05 | Testimonials preserve approved meaning and attribution. Anonymized reviews require permission too. No reviews/ratings/counts are fabricated or inferred from photos. |
| PUB-06 | About displays Israel's approved name, role, portrait/biography when provided, phone and email. Henry's private contact details do not appear by default. Missing portrait/biography does not cause invented content. |
| PUB-07 | Repairs/support presents confirmed hours, service area and a direct contact route. Requesting help is not confirmation of dispatch. Outside-area or scheduling requests remain possible without guaranteeing arrival. |
| PUB-08 | Visitors can inquire without registering. Collect a name, valid reply channel, service/problem and only the location detail needed at this stage. Preserve the selected service or planner summary when relevant. Success requires acknowledged receipt, with accessible errors, spam protection and a usable fallback contact. |
| PUB-09 | Published images have appropriate dimensions, descriptions and permission records. Original evidence stays outside the public asset directory. Remove unnecessary private metadata from publication copies and never imply that an in-progress view shows commissioned work. |
| PUB-10 | Public metadata, structured data and sitemap match approved content. No invented address, availability, ratings or credentials. Retain preview indexing restrictions until launch approval. |

## 6. Customer and company workspace

### Journeys

1. Visitor submits an inquiry without an account; the business receives it and can follow up.
2. A verified customer gains access to their records, requests a service and receives a reference after successful persistence.
3. Authorized staff review the request, ask questions, arrange assessment/quotation and create or associate a job when appropriate.
4. Staff publish dated progress and customer-visible messages. The customer sees the current status and history, including completed jobs.
5. Authorized commercial staff issue quotations/invoices. The customer can read/download only documents issued to them.

Account enrollment (invitation versus self-registration), organizational membership, email/phone verification and legacy-record linking must be approved before portal implementation. A matching typed email address alone must not expose historic jobs. An organization name/domain alone must not grant access to that organization's records.

### Proposed access boundaries

| Actor | Allowed scope |
| --- | --- |
| Public visitor | Public content and new inquiry; no customer records. |
| Customer | Own authorized requests, jobs, public-to-customer updates, conversation and issued documents. |
| Operations staff | Assigned/authorized work and operational communication; broader visibility requires an explicit business decision. |
| Commercial approver/owner | Authorized quotation/invoice actions and staff administration as specifically assigned. |
| Technical maintainer | Deployment/support responsibilities; access to business records only through an explicitly approved role. |

The same server-side access rules must cover lists, individual records, messages, attachments, exports and document downloads. Hiding a dashboard button is insufficient. This follows the per-request permission principle in [OWASP's authorization guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).

### Requirements

| ID | Required behavior and acceptance condition |
| --- | --- |
| PORT-01 | Authenticate users, provide logout and recovery, and verify the chosen identity channel. Staff access is explicitly granted, not publicly self-selected. Session expiry/revocation and additional protection for privileged accounts are specified before launch. |
| PORT-02 | Enforce access on the server for every resource/action. Customer A cannot read, modify, list, message or download Customer B's records by changing URLs or request data. |
| PORT-03 | Persist valid requests with a unique reference, owner, service, description and timestamps. Failed writes never show success; retrying after uncertain delivery must not silently create duplicate jobs. |
| PORT-04 | Customers see their current and historical recorded work with clear status, last update and next step. Old work appears only after authorized data entry/import and verified association with the customer. Photographs alone do not populate job histories. |
| PORT-05 | Authorized staff can review requests, assign responsibility and move jobs through approved transitions. Changes retain actor, time and history. Customers cannot directly mark a job completed or reassign it. |
| PORT-06 | Customer/staff messages belong to an authorized request/job. Distinguish internal notes from customer-visible updates; internal notes never leak through APIs, downloads or notifications. A simple conversation thread is sufficient initially; real-time chat is not required. |
| PORT-07 | Optional customer photos/documents remain private, with approved type/size/count limits, content validation and controlled downloads. Invalid or failed uploads are handled explicitly. Exact upload limits/storage choices are pending approval. |
| PORT-08 | Explicitly handle empty lists, pending requests, save failures, unauthorized access, expired sessions and stale/concurrent edits. Staff updates must not silently overwrite someone else's newer change. |
| PORT-09 | Account invitations and recovery cannot be reused after expiry/use or disclose other customers' records. Logging out or revoking access ends access as defined by the approved session policy. |
| PORT-10 | Private data is excluded from public pages, search indexes, shared caches and public asset paths. Record retention, deletion/export requests, backups and restoration ownership are agreed and verified before real use. |

Proposed statuses for business review: requests = Received / Under review / Awaiting information / Converted to job / Closed; jobs = Assessment / Awaiting quotation decision / Scheduled / In progress / On hold / Completed / Cancelled. These labels are proposals, not claims about Mias's current operations. Allow documented reasons and permitted transitions; an assessment may be unnecessary for some jobs. Do not confuse job status with payment status.

## 7. Quotations and invoices

| ID | Required behavior and acceptance condition |
| --- | --- |
| DOC-01 | Authorized staff create drafts with customer/job, line descriptions, quantities, units, prices, currency and approved tax/discount rules. Server calculations determine totals; browser-supplied totals are not trusted. |
| DOC-02 | A designated approver issues documents. Drafts are not customer-visible. Every issued document has a unique reference, date, version and issuing identity. |
| DOC-03 | Issued documents retain their original content; corrections create linked revisions/cancellation records rather than silently replacing what the customer saw. |
| DOC-04 | Customers can view/download only their issued documents. Generated PDFs and attachments enforce the same authorization as the job. |
| DOC-05 | Quote validity, acceptance/decline behavior, invoice due dates, deposits, payment status and credit/correction procedures follow approved business rules. No payment collection or binding electronic-signature workflow is implied. |
| DOC-06 | Use an owner-approved template with confirmed legal identity, tax details when applicable, numbering, currency, terms and payment instructions. Do not invent these or claim statutory compliance without review. |

Proposed boundary: document preparation and customer access, not a full accounting system. Online payments, tax filing, inventory purchasing, payroll and automated accounting integrations are outside this proposal.

## 8. Solar planning tool

Purpose: let a household describe what it wants to power, understand an indicative requirement and request a professional quotation with the inputs attached. This is not a final electrical design or guaranteed installed price.

Inputs should cover appliance/item, quantity, rated or measured watts, usage hours, essential loads, likely simultaneous use, desired backup duration and location. Unknown values need clear handling. Starter appliance defaults require an identified source, technical approval and editable values. Differentiate power (W/kW) from energy over time (Wh/kWh).

| ID | Required behavior and acceptance condition |
| --- | --- |
| SOL-01 | A visitor can add/edit/remove loads without an account. Validate negative/non-numeric values, quantities, daily hours and empty lists; explain missing data rather than producing plausible-looking results. |
| SOL-02 | Show calculated load/energy summaries with units and assumptions. Account for simultaneous demand and starting surge where applicable; never size every system from daily energy alone. |
| SOL-03 | Equipment recommendations use Mias-approved, versioned rules and a supported equipment catalogue, including battery usable energy/losses, inverter capability and relevant solar/site assumptions. Do not use free-form AI guesses for sizing. |
| SOL-04 | Motors/pumps, unknown surge requirements, complex or unsupported loads, and unsuitable inputs lead to an explicit technical-assessment path when the approved model cannot support a recommendation. No unsupported precision. |
| SOL-05 | Cost ranges use an approved dated price list and identify currency, labour, transport, tax, protection equipment and other inclusions/exclusions. Missing/stale prices produce “quotation required,” never invented or zero-cost components. Exact expiry policy is pending. |
| SOL-06 | Results state that Mias must confirm suitability, availability and site conditions. Provide a quotation action carrying the inputs and calculation/catalogue version; later authoritative processing recalculates rather than trusting a manipulated browser total. |
| SOL-07 | The calculator does not silently store personal data. Saving results to an account or inquiry is explicit. Previously saved estimates retain their assumptions/version when prices or rules change. |

Before equipment/cost recommendations: obtain a technical reviewer, real equipment options, approved load defaults and sizing rules, current pricing and at least three worked examples with expected answers. If these are unavailable, a separately approved load-summary-only version can still help collect inquiries; it must not pretend to recommend a complete system.

## 9. Quality and acceptance scenarios

The baseline responsive, accessibility, performance, SEO and honesty requirements remain applicable. Test laptop and phone journeys within each increment. Tables, messages, job timelines and PDFs must also be usable on small screens. No score or accessibility certification is implied by this specification.

| Scenario | Observable acceptance evidence |
| --- | --- |
| Find a service | A phone visitor identifies the relevant family and reaches an appropriate inquiry path; essential information is not hidden behind hover or account registration. |
| Read genuine proof | Each published photo/case study/customer/logo/review maps to an approved record. No equipment brand becomes an invented customer or partner. |
| Contact Mias | Phone/email use the approved values; WhatsApp is enabled only after confirmation. Coverage/hours do not imply 24/7 or guaranteed dispatch. |
| Receive a request | The actual destination/store acknowledges receipt; failures and retries preserve input and avoid false success or duplicate records. |
| Isolate customer records | Two distinct test customers cannot access each other's requests, messages, files, quotations or invoices, including by direct HTTP requests. |
| Operate a job | Authorized staff update permitted states; the customer sees the correct dated update; internal notes remain private and unauthorized actions fail. |
| Issue a document | Approved arithmetic and numbering produce a traceable issued document; revision history and protected downloads work. |
| Explain an estimate | Approved worked examples reproduce expected results with units; invalid, unsupported and stale-price cases behave as specified. |
| Recover and operate | Responsible staff can recover access, detect failed delivery, revoke access and restore data under the approved operating procedure. |

These are specification-level acceptance scenarios, not a test implementation plan or a claim of passing tests. After scope approval, define the implementation/test plan, write pytest tests against actual application behavior, validate the tests and expected failures, then implement the selected increment.

## 10. Proposed delivery boundaries and decisions

Recommended product order, subject to approval:

1. **Public website and evidence:** improved homepage, service taxonomy/detail pages, approved case studies, About/leadership and confirmed direct contacts. This makes the business visibly stronger with the material already available.
2. **Reliable service intake:** guest request processing and the agreed business response process.
3. **Customer/company workspace:** secure accounts, requests, jobs, progress and communication.
4. **Commercial documents:** quotations/invoices based on actual Mias templates and approval rules.
5. **Solar planner:** can be prioritized earlier once the technical rules and pricing are ready.

This is product sequencing, not authorization to build all five together. The public website can launch independently when its own baseline requirements pass; unfinished portal/planner controls remain absent. No fixed calendar is imposed.

The approved Next.js/TypeScript/Tailwind foundation can remain. Structured repository content remains suitable while Henry maintains public pages. Private multi-user records require persistent storage and an authentication/authorization design; the existing no-database decision applies to the current website, not to an implemented portal. Compare realistic providers and costs during the planning stage after approval. No provider, hosting region, CMS, notification API, payment service or database is selected here.

Approval/input gates:

- Approve this expansion direction and identify the next bounded increment.
- Before public launch: label real projects, confirm rights, supply portrait/biography if a photo profile is wanted and clarify working days. WhatsApp is now confirmed.
- Before portal planning is finalized: define staff roles, customer enrollment, organizational access, job stages, expected record volumes, retention and monthly operating budget.
- Before commercial documents: supply sanitized templates and issuing/numbering/calculation rules.
- Before solar recommendations: obtain approved technical examples, catalogue and prices.
- Before implementation of each increment: approved spec, implementation/test plan, defined and validated pytest tests.
- Before launch: remaining privacy/security/provider decisions, measured QA, real inquiry delivery and human launch approval.

The next implementation is scoped in [Increment 003](003-public-website.md). The broader portal and calculator requirements do not authorize selecting providers or implementing them before their own planning, approvals and tests.

### Company content publishing — requested addition

Future authorized staff should be able to prepare project stories and testimonials with photos, descriptions, client attribution and publication permissions. Require draft/preview/publish/unpublish states, separate public project assets from private job attachments, record the approver, and exclude fictional demo records from publishing. Customer reviews are moderated and published only with permission. This is recorded as `CMS-01`; no CMS/provider or staff editing interface is selected in the public increment.

## 11. Review record

| Date | Record |
| --- | --- |
| 2026-10-19 | Henry requested richer public pages, customer evidence, customer/staff accounts, requests/job tracking, responses, quotations/invoices and a household solar planner. Draft recorded; implementation approval pending. |
| 2026-10-19 | Henry confirmed irrigation, electrical upgrades, breakdown call-outs, 09–05 hours, faster Lusaka response and wider Zambia coverage generally taking a few days. |
| 2026-10-19 | Henry corrected Israel's surname to Masauso and authorized public phone/email display with an intended About-page portrait. Working days and WhatsApp remain unresolved. |
| 2026-10-19 | Henry approved proceeding with the suggested changes/public increment; confirmed Israel's number for WhatsApp and his role handling deals; supplied three customer names and an existing logo. Requested three fictional story examples for preview and future staff-managed project/testimonial publishing. |
