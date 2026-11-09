# Increment 006 — local backend foundation and reliable inquiries

Status: **Approved by Henry on 2026-10-21 with the recommended answers to decisions D-1 to D-7.** Next: the implementation/test plan.

Builds on: [feature backlog](../docs/plans/feature-backlog.md) §4–5, which records the local-first decision and budget. It also builds on the expansion spec's [PUB-08 and PORT-03](002-business-platform-expansion.md), the MVP requirements [FR-09 to FR-12, FR-15, NFR-04 and NFR-05](mias-website-mvp.md), and increment 005 (Contact page, `?area=` pre-fill).

## Outcome and scope

Turn the Contact page into an inquiry form that really works, and lay the backend foundation that logins, jobs and staff publishing will reuse. Everything runs locally with free tools; no online service is used or paid for.

**Validation retry correction — 6 November 2026:** during Henry's requested core-quality pass, a failed submission was found to reset the reply radio from Email to WhatsApp. Preserve all customer choices through validation errors and retries, including reply method and service. A valid corrected submission must work without re-entering unrelated fields. JavaScript-disabled submission and pre-hydration typing remain supported.

1. **A local database:** PostgreSQL-compatible, with versioned schema changes, so the same design moves to a hosted database at launch.
2. **An inquiry form that saves every valid inquiry** with a unique reference number, never creates duplicates, and tells the visitor honestly what happened.
3. **A notification email to Mias for each inquiry,** captured in a local **development inbox** instead of being sent. Delivery failures are recorded and retried, not hidden.
4. **Spam protection** using free, local techniques.
5. **A privacy notice** explaining what is collected and why, as a draft for owner approval.
6. **Swappable services:** moving to a real email service and hosted database later only means configuration and account keys, not a rewrite.

The existing WhatsApp option stays available as an alternative (D-2).

## How an inquiry flows

```text
Visitor fills the form ──▶ server validates ──▶ spam checks ──▶ save inquiry + reference (one transaction)
                                                                     │
                                         queue notification email ◀──┘
                                                     │
                     development inbox (local) / email service (at launch)
                                                     │
Visitor sees one honest outcome:
  ✓ Received: "Your reference is MES-26-7K3QP. Israel will reply by WhatsApp."
  ! Saved, but Mias could not be notified yet: reference shown, plus "please also call/WhatsApp"; retried automatically
  ✗ Not saved: nothing lost from the form; error message with the direct phone, WhatsApp and email
```

## Acceptance criteria

### Form and validation

| ID | Observable result |
| --- | --- |
| INQ-01 | Contact offers "Send inquiry to Mias" with these fields: name (required, ≤80), phone and/or email (at least one valid), preferred reply method (phone call / WhatsApp / email; it must match a channel provided), service (existing list), project area (optional, ≤120; still pre-filled by `?area=`), and project details (required, ≤1,500). Labels state which fields are required. |
| INQ-02 | Phone numbers accept common Zambian and international forms (`0977 123 456`, `+260 977 123 456`, `260977123456`) and are stored normalised (`+260977123456`). Invalid numbers or emails show a clear field error. |
| INQ-03 | The server validates every field with the same rules, whatever the browser sent. Invalid submissions show field-level, accessible errors linked to their fields, focus the first error, and keep all valid input. |
| INQ-04 | While sending, the button shows "Sending…" and cannot be pressed again. The outcome is announced to screen readers. |
| INQ-05 | The form also works without JavaScript: it submits normally and returns the same outcomes. |
| INQ-06 | The homepage still has no form. The WhatsApp option, if kept (D-2), works as in increments 003–005, and the existing WhatsApp tests pass. |

### Saving, references and duplicates

| ID | Observable result |
| --- | --- |
| REQ-01 | A valid inquiry is saved with a unique, non-sequential reference such as `MES-26-7K3QP`, the submitted fields, the page/service/area it came from, and a timestamp. The reference reveals nothing about how many inquiries exist. |
| REQ-02 | The visitor sees success **only after** the inquiry is saved. Success shows the reference, a summary, the reply method and next steps, with no promise of a reply time. |
| REQ-03 | Submitting the same form twice, through a double click, a retry after a slow response, or browser back and resubmit, never creates a second inquiry; the visitor gets the original reference. |
| REQ-04 | If saving fails, the visitor sees an error with Israel's phone, WhatsApp and email, nothing they typed is lost, and no success is shown. |

### Notification delivery

| ID | Observable result |
| --- | --- |
| DLV-01 | Each saved inquiry queues one plain-text notification to Mias's inquiry address (D-6). It contains the reference, name, contacts, preferred reply method, service, area, details and time. Reply-To is the visitor's email when given. Visitor input never appears in email headers other than a validated Reply-To. |
| DLV-02 | Locally, notifications are written to the **development inbox** instead of being sent. Nothing leaves the computer. |
| DLV-03 | If a notification fails, the inquiry stays saved and the visitor sees the "saved, but please also contact Mias directly" outcome. The failure is recorded with its error and retried at least three times. Failed and pending notifications are listed in the development inbox. |
| DLV-04 | No confirmation email is sent to the visitor (D-3). The on-screen reference is their receipt. |

### Spam and abuse

| ID | Observable result |
| --- | --- |
| SPAM-01 | Submissions are rejected when a hidden field that people never see is filled, or when the form is sent too quickly after opening (default under 3 seconds). Detected spam is neither saved nor notified, and the response does not reveal that it was detected. |
| SPAM-02 | Rate limits apply: by default at most 5 inquiries an hour from one network address, and 3 a day using the same phone or email. Limited visitors see a polite message with the direct contacts. The address is stored only as a one-way hash, never in plain form. |
| SPAM-03 | Over-long input, too many links in the details, and malformed requests are rejected safely without exposing internal errors. |

### Development inbox and test switches

| ID | Observable result |
| --- | --- |
| DEV-01 | `/dev/inbox` lists saved inquiries and captured notifications (newest first, with delivery status) and lets you open each. It exists **only in development**: production builds return 404. It is `noindex` and not linked from the site. |
| DEV-02 | Development-only switches simulate a database failure and a notification failure so the honest-failure paths can be tested and demonstrated. They have no effect in production builds. |

### Privacy and data handling

| ID | Observable result |
| --- | --- |
| PRIV-01 | A short privacy notice is linked beside the submit button and from the footer. It says what is collected, why (only to reply about the inquiry), who sees it (Mias), how long it is kept (D-5) and how to ask for deletion. It is marked as a draft until the owner approves it. |
| PRIV-02 | Only the fields in INQ-01 and the hashed network address are stored. Logs never contain names, contacts or message text. |
| PRIV-03 | A documented command deletes an inquiry and its notifications by reference, so deletion requests can be honoured. |

### Architecture and quality

| ID | Observable result |
| --- | --- |
| ARCH-01 | The database and email transport are chosen by configuration (`.env.local`, never committed). Locally they are the bundled database and the development inbox; at launch they become a hosted database and an email service, without code changes to the inquiry feature. |
| ARCH-02 | Schema changes are versioned migrations in the repository. A fresh copy of the project creates its local database with one documented command. Local database files are git-ignored. |
| ARCH-03 | No secrets or keys appear in client code, the repository or error messages. Each new dependency is free and open-source, and is recorded with the reason for adding it. |
| QA-01 | Tests are written and their expected failures recorded before implementation. They cover validation and normalisation (unit), saving/duplicates/rate limits/spam rules, all three outcomes, the inbox, no-JavaScript submission and accessibility (browser). The full suite, type check and production build pass; the existing WhatsApp and Contact tests still pass. CHANGELOG, README and AGENTS are updated. |

## Paid services this feature will need when live

| Service | Why | Expected cost (check at launch) |
| --- | --- | --- |
| Email-sending service | Deliver notifications to Israel | Usually free at this volume |
| Hosted PostgreSQL database | Keep inquiries safely online, with backups | Free plans exist; about $25/month for reliable backups |
| Hosting that runs server code | The form needs a server, not just static pages | $0–20/month; check that the plan allows commercial use |
| Optional bot check (e.g. Cloudflare Turnstile) | Extra spam protection online | Free |

Nothing is bought or connected in this increment. These choices belong to increment 012.

## Inputs from Henry/Israel

| Input | Needed for | If not supplied |
| --- | --- | --- |
| Which reply methods Israel wants to offer | INQ-01 | All three (phone, WhatsApp, email) |
| Address that should receive notifications at launch | DLV-01 at launch | Locally, nothing is sent anyway; `imasauso@gmail.com` is assumed for the preview only |
| How long inquiries should be kept | PRIV-01 | The notice says "until Mias deletes them; ask us to delete yours", marked draft |
| Approval of the privacy notice wording | Launch | Stays marked draft |

## Open decisions for Henry

| ID | Decision | Recommendation |
| --- | --- | --- |
| D-1 | Local database | **PGlite with Drizzle ORM.** PGlite is real PostgreSQL that runs inside the project, so nothing needs installing. Drizzle handles schema and migrations and works unchanged with hosted PostgreSQL later. The alternatives are installing PostgreSQL for Windows (heavier setup) or SQLite (a different database from production, so a risky later switch). |
| D-2 | Keep the WhatsApp option? | **Yes, as a secondary choice** ("Prefer WhatsApp? Prepare a WhatsApp message"). Many customers will prefer it, and it keeps working even if email delivery fails. |
| D-3 | Send visitors a confirmation email? | **No, for now.** The form could be abused to send emails to strangers. The on-screen reference is the receipt. Revisit with logins (007). |
| D-4 | Reply-channel rule | **Phone and/or email, at least one**, plus a preferred method that matches a channel given. |
| D-5 | Retention | **Decide before launch.** Only test data exists locally. The notice is drafted with a placeholder, and PRIV-03 provides deletion. Zambia's data-protection obligations should be checked before real data is collected. |
| D-6 | Notification recipient | **Israel's approved email** for the preview. Confirm with Israel before launch. |
| D-7 | Bot check online | **Defer to launch.** Use the free local techniques now (SPAM-01/02) and consider the free Turnstile at 012. |

## Explicit limits

This increment excludes:

- Real email sending, hosting, a hosted database or any paid service.
- Logins, and the staff dashboard. The development inbox is a developer tool, not the company workspace (007/008).
- SMS or automated WhatsApp messages.
- File uploads with inquiries, analytics, and visitor confirmation emails.

Inquiry records are designed so that increment 008 can link them to customer accounts and jobs, but no such linking happens now.

## Approval record

| Date | Record |
| --- | --- |
| 2026-10-21 | Henry approved US$20–50 a month for live services later, chose to build everything locally first, and asked for the step-2 spec. |
| 2026-10-21 | Henry approved this spec with the recommended answers. D-1: PGlite with Drizzle. D-2: keep WhatsApp as the secondary option. D-3: no visitor confirmation email. D-4: phone and/or email plus a preferred reply method. D-5: retention decided before launch. D-6: Israel's email for the preview. D-7: bot check deferred to launch. |
