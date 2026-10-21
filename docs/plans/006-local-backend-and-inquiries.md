# Increment 006 — implementation and test plan

Date: 2026-10-21. Implements [spec 006](../../specs/006-local-backend-and-inquiries.md), approved with decisions D-1 to D-7.

## New dependencies (free, open-source)

| Package | Version | Why |
| --- | --- | --- |
| `@electric-sql/pglite` | 0.5.10 | Real PostgreSQL running inside the project; no install (D-1). Smoke-tested: data persisted across runs, `gen_random_uuid()` available. |
| `drizzle-orm` | 0.45.4 | Typed queries; the same code later talks to hosted PostgreSQL. |
| `drizzle-kit` (dev) | 0.31.11 | Generates versioned SQL migrations into `drizzle/`. |

`next.config.ts` lists PGlite in `serverExternalPackages` so its WebAssembly files load from `node_modules` rather than being bundled.

## Data flow and modules

```text
src/app/contact/page.tsx  (server: issues a signed form-start token + a fresh idempotency key per page view)
   └─ src/components/inquiry-composer.tsx  (client: useActionState → works with and without JavaScript; WhatsApp stays a secondary button)
        └─ src/app/contact/actions.ts  "use server": sendInquiry(formData)
             └─ src/server/inquiries.ts  submitInquiry():
                  1. spam: honeypot field, signed start time ≥ MIN_FILL_MS (src/server/form-token.ts)
                  2. validate + normalise (src/lib/inquiry-submission.ts — pure, unit-tested via Node)
                  3. rate limits: inquiries per network hash / hour, per phone-or-email / day
                  4. idempotency: existing row with this key → return its reference
                  5. one transaction: insert inquiry (reference MES-YY-XXXXX) + pending notification
                  6. deliver via transport (src/server/mail/transport.ts; "dev-inbox" now) → sent | failed
                  7. outcome: received | saved-unnotified | not-saved | invalid | rate-limited
src/server/db/{schema,client}.ts  PGlite at .data/pglite (MIAS_DB_DIR), migrations applied on first use, PID lock file
/dev/inbox  (development only)   lists inquiries + notifications, retries pending ones, delete, simulation switches
scripts/db.mjs                    migrate | delete <reference>  (refuses to run while the website holds the database)
```

Design notes:

- **Honest outcomes.** Success is shown only after the transaction commits. A notification failure never undoes the saved inquiry: the visitor sees "saved, but please also contact Mias", and the notification is retried (up to 4 attempts) after later submissions and whenever `/dev/inbox` is opened.
- **Simulation switches (DEV-02)** are a cookie, `mias-simulate=db-failure|notify-failure`, honoured only when `NODE_ENV=development`. They apply to one browser only, so tests stay independent.
- **Network address** comes from the platform header `x-forwarded-for` (falling back to `x-real-ip`, then `local`) and is stored only as an HMAC hash. Locally the header can be set by the client; that is acceptable in development and documented for launch. Tests use a unique address each.
- **Secrets:** `MIAS_FORM_SECRET` signs form tokens and salts hashes. Development uses a built-in default; production refuses to start the form without it. A committed `.env.example` documents all variables, and `.env.local` stays ignored.
- **Working directory:** paths resolve from `process.cwd()`, the project folder when started with `pnpm dev`. The Claude preview launch config is updated to start inside the project.

## Tests (written before implementation)

| Test | Type | Requirements |
| --- | --- | --- |
| `test_inquiry_units.py`: phone normalisation, field rules, contact/preferred-reply rule, link limit, reference format | unit | INQ-01, 02, 03, SPAM-03, REQ-01 |
| `test_inquiries.py`: contact form markup (token, idempotency key, hidden honeypot, privacy link); `/privacy` page; `/dev/inbox` available in development | integration | INQ-01, SPAM-01, PRIV-01, DEV-01 |
| same file: successful inquiry → reference, notification visible in the inbox as delivered | browser | REQ-01, 02, DLV-01, 02 |
| same file: validation errors keep input and focus the first error | browser | INQ-03, 04 |
| same file: simulated database failure → not saved, direct contacts shown, input kept | browser | REQ-04, DEV-02 |
| same file: simulated notification failure → saved-unnotified outcome; retried successfully once the switch is off | browser | DLV-03, DEV-02 |
| same file: honeypot and too-fast submissions look accepted but are never stored | browser | SPAM-01 |
| same file: hourly network limit and daily contact limit | browser | SPAM-02 |
| same file: no-JavaScript submission, then back-and-resubmit returns the same reference | browser | INQ-05, REQ-03 |
| existing WhatsApp/contact/reflow tests unchanged | all | INQ-06 |

Manual verification (recorded in the results): `/dev/inbox` returns 404 in a production build; the delete command; `scripts/db.mjs` refuses to run while the server is up.
