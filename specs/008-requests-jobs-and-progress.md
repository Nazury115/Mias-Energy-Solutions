# Increment 008 — requests, jobs, customer access and notifications

Date: 2026-10-26.

Status: **Approved for the core local build by Henry on 2026-10-26.** Henry requested planning and execution, then approved the stages, core-first scope, and email/SMS acceptance messages. Uploads and shared company access remain an explicit follow-up slice; delivery providers, budget, retention and Israel's operational confirmation remain launch decisions. This status is authorization to implement, not a claim of completion.

Builds on [spec 002](002-business-platform-expansion.md) (PORT-03–08, PORT-10), [spec 006](006-local-backend-and-inquiries.md) (saved inquiries and notification failures) and [spec 007](007-accounts-and-logins.md) (accounts, roles and invitations).

## Agreed direction

1. A visitor can request service without creating an account.
2. Mias reviews the request and contacts the customer to clarify the work.
3. When Mias agrees to proceed with an assessment or other agreed work, authorized staff accept the request and create a job.
4. Staff invite the customer to set up portal access, or link the job to the customer's existing verified account through a verified association.
5. Customers sign in to see their own jobs, progress, next steps and messages.
6. Existing customer self-registration stays available. One account can hold several jobs; registration alone never reveals earlier work.
7. Request-received confirmations use both email and SMS when both valid contact details are supplied. If only one is supplied, that available channel is used; requesting service still does not require both. Each channel has its own delivery status and retries.

Receipt, business acceptance and portal access are separate events. An automatic receipt means the request was saved; it does not promise an appointment, quotation, dispatch or acceptance of the work.

## Proposed customer messages

Examples are interface wording for review, not messages already sent:

| Event | Proposed message | When it may be queued |
| --- | --- | --- |
| Request received | "Mias Energy Solutions has received your request. Reference: {reference}. Our team will review it and contact you. Work has not yet been confirmed." | After the request and receipt event are saved successfully |
| Request accepted | "Mias Energy Solutions has accepted your request for {agreed scope}. Job reference: {job reference}. Next step: {staff-confirmed next step}." | After an authorized staff acceptance and job creation are saved |
| Portal invitation | "You have been invited to view your Mias job. Use this secure link to confirm your email and set up access." | After staff verify the contact association and create an invitation |

A receipt sent to an unverified guest contact uses fixed wording and a reference only. It contains no customer-written message, private job details or portal access link. Acceptance messages and invitations use the contact approved for that job. Existing account confirmation and password-reset messages retain their own purposes.

## Acceptance criteria

### Request review and job creation

| ID | Observable result |
| --- | --- |
| REQ-01 | Guest and signed-in requests continue to save with a reference and the honest success/failure behavior from 006. An unsaved or detected-spam request sends no customer receipt. |
| REQ-02 | Owner/Staff can review a request, record follow-up and accept or close it with a reason. The final state names and permitted transitions follow the approved job-stage decision below. |
| JOB-01 | Accepting a request creates a linked job with its own reference, agreed scope, responsible staff member and next step. Repeated or concurrent acceptance cannot create two jobs or two acceptance events for the same conversion. |
| JOB-02 | Staff change a job only through permitted transitions. Changes retain actor, time and history; stale edits receive a visible conflict rather than overwriting a newer change. |
| JOB-03 | Customers see current and historical authorized jobs, including reference, agreed description, current stage, latest dated update and next step. Empty and unavailable states are explicit. |

### Customer access and communication

| ID | Observable result |
| --- | --- |
| ACCESS-01 | Authorized staff can invite a customer after acceptance using a secure, expiring, single-use link. The account has the customer role; customer invitations cannot grant Staff or Owner access. No password is sent in a message. |
| ACCESS-02 | New customers confirm their email and choose a password. Existing customers authenticate as the intended verified account before accepting access. The invitation is bound to the reviewed job/contact association; a matching form email or company name alone never grants access. |
| ACCESS-03 | Earlier guest inquiries or historic work require an explicit staff association and verified customer identity. A customer can access several jobs through one account. Relinking/revoking access records who did it and takes effect at the next request. |
| ACCESS-04 | Every protected page, server action, lookup and future attachment download checks the viewer and job authorization on the server. Customer A cannot discover or access Customer B's job by changing references or request fields. |
| MSG-01 | Customer/staff messages and customer-visible progress updates belong to an authorized request/job and retain their sender and time. Internal staff notes are stored and rendered separately and never appear in customer views, exports or notifications. |

### Receipt and acceptance notifications

| ID | Observable result |
| --- | --- |
| NOTIFY-01 | A successfully saved request queues a customer receipt through **both email and SMS** when both valid contact details are supplied, without requiring registration. If only one valid destination is supplied, only that channel is queued. The request reference remains visible on screen even if either message fails. |
| NOTIFY-02 | Receipt channels are separate from the customer's preferred method for a human reply. The form explains that supplied contact details are used for receipt confirmations. Existing phone-and/or-email inquiry validation remains; a visitor is not forced to provide both. A failure in one channel does not prevent delivery or retry in the other, and does not duplicate a successful delivery. |
| NOTIFY-03 | A saved acceptance/job-creation event can queue a separate acceptance message. Portal access is provided through its own secure invitation; receipt alone creates no account and grants no job access. |
| NOTIFY-04 | Request/job changes and their outgoing events are saved consistently. Each business event and channel has a stable identity so repeated submissions and retries do not enqueue another receipt or invitation. Where a provider supports idempotency, retries reuse its key. Unknown delivery outcomes remain distinguishable from confirmed failures. |
| NOTIFY-05 | Staff see queued, provider-accepted, failed and delivery-confirmed states where supported, plus retry count and exhausted retries. Provider acceptance is not labelled as customer receipt or reading. A bounded retry policy is defined in the implementation plan. Customer-message failure never turns an already saved request into "not saved". |
| NOTIFY-06 | Automated receipts use fixed templates, not arbitrary visitor-written content. Existing spam checks remain active; recipient/network resend caps, duplicate protection and a launch spending cap prevent repeated submissions from producing unlimited messages. Limits and any additional live bot check are specified before real sending. |
| NOTIFY-07 | Local development captures both email and simulated SMS in a development-only outbox. It does not contact real recipients or buy messaging services. Production transports are enabled only after the provider, destinations and budget are approved at launch. |
| NOTIFY-08 | Draft privacy wording explains notification destinations and purpose. Notification preferences are recorded separately from human reply preference; no marketing messages are included in this increment. |

### Quality

| ID | Observable result |
| --- | --- |
| QA-01 | After spec approval, an implementation/test plan precedes tests and implementation. Tests cover guest receipt, email-and-SMS receipts, email-only/phone-only input, independent channel failures and retries, no-send on failed save/spam, acceptance/conversion duplicates, invitations (new and existing customers), role/job boundaries by direct request, private-note exclusion, stale edits and no-JavaScript forms. |
| QA-02 | Required unit/browser checks, TypeScript and production build pass. Phone/desktop layouts, empty states, inaccessible jobs and notification failures are reviewed. Results and outstanding launch limits are documented. |

## Agreed core scope and launch decisions

| Decision | Proposal / status |
| --- | --- |
| Receipt channels | **Chosen by Henry: both email and SMS.** Use both when both valid contact details are supplied, otherwise the available channel. Implementation includes local simulation for both; real sending starts at launch. Provider selection and an agreed spending cap remain pending. |
| Job stages and transitions | Henry approved Assessment / Awaiting quotation decision / Scheduled / In progress / Completed, with On hold and Cancelled. Every change records a reason. Completed and Cancelled are terminal in the core build. On-hold work can resume at a nonterminal stage. These are local-build stages; Israel confirms the operating process before real use. Requests use Received / Under review / Awaiting information / Accepted / Closed. |
| Who accepts requests and invites customers | Owner and Staff, using the same authorized inquiry access as 007. Every acceptance, association and invitation records its actor. |
| Invitation policy | Seven-day customer invitation; explicit staff resend cancels the previous unaccepted invitation. Reset/confirmation rules remain those of 007. The implementation plan defines existing-account acceptance and recovery. |
| Email availability | Existing accounts require email. Phone-only customers may still make requests, but need an email address before using the current login system. SMS receipt does not introduce phone-based sign-in. |
| Private uploads | Henry chose core first; private uploads remain a follow-up slice of 008 needing file types, size/count limits and retention. They are not counted as delivered by the core. |
| Company/shared accounts | Henry chose individual customer access first. Shared company access remains a follow-up slice of 008 requiring organization-membership and invitation rules. |
| Retention and operation | Decide retention for jobs/messages/notifications, deletion/export process and backup/restore ownership before real customer use. |
| Acceptance and progress alert channels | Henry chose email and SMS for acceptance, using supplied reviewed contact details. Progress and messages appear in the portal with no automatic external alerts. Secure portal invitations use email. |

Core transition policy: Assessment → Awaiting quotation decision or Scheduled; Awaiting quotation decision → Assessment or Scheduled; Scheduled → Assessment or In progress; In progress → Scheduled or Completed. Any nonterminal state may move to On hold or Cancelled. On hold may resume to Assessment, Awaiting quotation decision, Scheduled or In progress. No progress change sends external notifications. A saved acceptance does not automatically grant access based on a typed email: staff explicitly review the destination before invitation, and existing-account acceptance requires authenticated matching verified email.

## Launch services and costs

Email uses the existing outbox concept and the real email service selected for 012. SMS additionally needs a sending provider with suitable destination coverage, sender setup, delivery reporting and an agreed spending cap. Compare current terms/costs when choosing services; none is purchased or connected here.

SMS length affects cost: for example, Twilio bills by message segment, and encoding can split a short-looking message into more segments ([primary documentation](https://www.twilio.com/docs/glossary/what-sms-character-limit), checked 2026-10-26). This is a cost consideration, not a provider selection. Keep SMS templates concise; final prices and coverage remain unconfirmed.

## Relationship to earlier decisions

Spec 006 deliberately deferred customer confirmation emails (D-3) and excluded SMS. Henry has now chosen both email and SMS receipts for the next increment. This extends the planned scope prospectively; it does not rewrite what 006 delivered or claim that real sending is already working.

Staff publishing (009), quotations/invoices (010), solar planning (011), real delivery/hosting (012), SMS login and payment processing retain their existing boundaries.

## Review record

| Date | Record |
| --- | --- |
| 2026-10-26 | Henry accepted the proposed flow: guest inquiry, Mias review/acceptance, job creation, customer invitation or verified account linking, then customer job access. Existing self-registration remains available. |
| 2026-10-26 | Henry requested confirmation of received requests, then selected **both email and SMS**. Receipt-channel choice is settled; the complete 008 specification, remaining workflow decisions and live sending provider/budget still need review. |
| 2026-10-26 | Henry requested executing 008 and approved the recommended local job stages, core-first scope (uploads/shared access follow later), and acceptance by email/SMS with portal-only progress updates. Authorized core implementation proceeds through the plan, tests, build and review. |
