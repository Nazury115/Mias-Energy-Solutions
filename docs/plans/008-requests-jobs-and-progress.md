# Increment 008 — core implementation and test plan

Date: 2026-10-26. Implements [spec 008](../../specs/008-requests-jobs-and-progress.md), including Henry's explicit choices of stages, core-first scope and acceptance channels.

## Scope

Guest request → email/SMS receipt → staff review → accept/create job → email/SMS acceptance → reviewed customer invitation → authorized job view, dated progress and messages. Staff notes remain private. One customer can have several jobs. Uploads and shared company access remain the agreed follow-up slice and are not counted as delivered here. Provider integration remains 012.

## Architecture

- Reuse Next.js server actions, Better Auth, Drizzle and PGlite. No new packages or paid services.
- Pure `src/lib/jobs.ts` holds status labels/transitions, field rules, version validation and fixed receipt templates. Unit tests exercise that TypeScript module through the existing Node bridge.
- Add request status/version, jobs (one per inquiry, assigned staff, scope, next step, version), dated job events/messages with explicit audience, and customer invitations bound to one job/contact. Tokens are random and stored as SHA-256 hashes.
- Customer invitations stay separate from staff invitations, so customer setup can never grant company roles. A new customer can set a password after proving possession of the invitation. An existing account must sign in, have verified matching email and be active; neither a matching guest email nor account registration links historic records. Resends cancel old pending tokens. Owner/Staff can revoke a job association, with an audit trail and immediate server-side enforcement.
- Staff read/write operations recheck roles; customer operations recheck membership using the job reference. Unauthorized customers receive the same 404 as an unknown job. Customer data queries select only customer-visible fields/events; internal notes do not reach client props, HTML, RSC payloads or outgoing messages.
- Accepting a request uses a database transaction plus optimistic version comparison. One unique job per inquiry and one event key per notification channel prevent repeated conversion and message enqueue. Changes to stage, assignment or access compare the expected version; stale edits show a conflict. Terminal jobs cannot be changed into active work in this slice.
- Extend the shared outbox with channel and event key. Existing company-inquiry joins explicitly select kind `inquiry` so multiple customer receipts never duplicate staff list rows. Customer receipts are written in the same transaction as the inquiry; acceptance notices are written with job creation. Email/SMS statuses and bounded retries are independent. Local captures say captured locally; they never imply provider or handset delivery. Real providers are unavailable until configured and approved at launch.
- Development switches simulate email/SMS failure independently; production ignores every simulation switch. Delivery claims use a conditional database update so concurrent retry triggers do not send the same row twice. Unknown interrupted attempts remain visible for operator review instead of blind resends. Four attempts maximum. Staff can trigger safe retries and see exhausted/unknown attempts.
- Fixed guest receipts contain only a reference and generic acknowledgment, never arbitrary user content or access links. Existing network/contact limits and honeypot checks apply before notifications are queued. Resends are capped per job and review; message sizes are bounded. No automatic external alerts on progress/internal edits.

## Pages and components

- `/staff`: review status on inquiry list.
- `/staff/inquiries/[reference]`: review/close, accept and assign, linked job and delivery state.
- `/staff/jobs` and `/staff/jobs/[reference]`: list/search/filter, customer access, assignment/stage/next step, customer updates/messages, internal notes, event history and notification states.
- `/account`: own inquiries plus authorized jobs with status and next step.
- `/account/jobs/[reference]`: customer-visible details/history and messages only.
- `/job-invite`: new-account setup or authenticated acceptance by an existing account; no automatic mutation on GET.
- `/dev/inbox`: existing inbox plus local email/SMS events and independent failure switches.
- Shared form state handles field errors, focus, pending and visible failures, including ordinary form posts with JavaScript disabled. Reuse existing workspace styling and responsive rules; no animation dependencies.

## Test-first coverage

| Test | Evidence |
| --- | --- |
| Job-rule unit tests | Allowed/forbidden transitions, terminal states, field bounds, safe version parsing, fixed receipt templates and per-destination channel selection |
| Receipt browser checks | Both channels, email-only/phone-only, no-send on spam/save failure, independent failure/retry and no duplicate rows |
| Staff review → job | Validation, required scope/next step/assignment, one job on repeated/stale conversion, audit/history |
| Customer invitation | New account, existing verified account, wrong account, used/cancelled link, resend and access revocation |
| Job operations | Status/reason/assignment/next-step updates, stale edit rejection and terminal rules |
| Privacy and authorization | Two customers isolated by direct URL/action requests; customer cannot post staff updates/notes; internal sentinel absent from customer HTML/RSC and messages |
| Communication | Staff public update vs internal note, customer reply, bounded input, no-JavaScript reply |
| Regression/layout | Existing account/inquiry suites, new route warm-up, phone/desktop no overflow, production dev-tools 404 and signed-out redirects |

First run the new unit tests against the missing module and record the expected failures. Then add browser tests before page implementation. After building, run the targeted tests, full suite, TypeScript and production build, fix material failures, and inspect screenshots. Use a separate test database/server; never migrate or test against another live process's database. New routes join `WARM_UP_PATHS` before the full run. No source edits while browser tests run.

## Rollout and review

Add a generated Drizzle migration; never hand-edit SQL or snapshots. Existing records start as Received. Existing company notifications and accounts retain their meaning. Core acceptance preserves inquiries after job creation and closes access cleanly when revoked. The development delete helper must not cascade-delete an accepted job accidentally.

Record measured results and remaining limits in `docs/testing/008-results.md`. Update README, CHANGELOG, AGENTS and backlog to show the core result and the still-open uploads/shared-access slice. Human review of the local journey remains separate from automated passes and public launch approval.
