# Increment 007 — customer and company accounts

Status: **Approved by Henry on 2026-10-21, with the recommended answers to decisions D-1 to D-7.** Next: the implementation/test plan.

Builds on: the [expansion spec](002-business-platform-expansion.md) (PORT-01, 02, 08, 09 and 10; access boundaries in §6), [feature backlog](../docs/plans/feature-backlog.md) §3, and increment 006 (local database, development inbox, server actions).

## Approved product decisions (Henry, 2026-10-21)

1. **Customers sign themselves up**, confirming their email. They see only what they create while signed in, plus past work that staff link to them later (increment 008). A matching email address never reveals anyone's history.
2. **Roles:** **Owner** (everything, including managing staff) and **Staff** (handle inquiries; jobs arrive in 008). Staff accounts are created **by invitation only**. **Henry and Israel are both Owners.**
3. **Company customers** (several employees sharing one organisation's work) come **later**, with jobs in increment 008. This increment has individual accounts only.
4. **Sign-in uses email and password,** with email confirmation and "forgot password". Phone/WhatsApp codes are a later, paid decision.

Note on Henry's role: spec 002 says a technical maintainer reaches business records only through an explicitly approved role. Henry approved Owner for himself for local development. **Israel should confirm both Owner accounts before real customer data is stored (launch).**

## Outcome and scope

One sign-in system serves customers and the company, running locally like increment 006, with every email captured in the development inbox:

- **Customer account:**
  - Sign up, confirm the email, sign in and out, reset a forgotten password.
  - A **My account** page: profile (name, phone), plus the inquiries sent while signed in, with their references.
  - The Contact form pre-fills a signed-in customer's details and links the inquiry to their account.
- **Company workspace** (`/staff`): Owners and Staff see **all inquiries** (search by reference, name, phone or email) and open any one. This replaces the developer inbox as the real way Mias reads inquiries.
- **Team management** (Owners only): invite staff by email, change a person's role, deactivate or reactivate an account.
- **First Owner setup:** a one-time command creates an Owner and prints a single-use setup link, so the first account doesn't depend on email.
- **Security underneath:**
  - Every page and action checks permissions on the server.
  - Passwords are stored only as strong one-way hashes.
  - Sessions expire, and repeated wrong passwords are slowed down.
  - Messages never reveal whether an email is registered.

## Acceptance criteria

### Sign-up, email confirmation and sign-in

| ID | Observable result |
| --- | --- |
| AUTH-01 | `/sign-up` takes a name, email, optional phone and password (D-3 rules), with clear accessible errors. It creates a **customer** account and sends a confirmation email. If the email is already registered, the visitor sees the same "check your email" screen, and the existing owner of that email gets a "someone tried to sign up" notice instead, so nothing leaks. |
| AUTH-02 | The confirmation link works once and expires after 24 hours. Until confirmed, signing in shows "confirm your email first", with a "send the link again" option (D-5). |
| AUTH-03 | `/sign-in` accepts email and password. Wrong details always get the same message, whether or not the email exists. After 5 failed attempts for an account or network within 15 minutes, further attempts are refused for 15 minutes, with an explanation. |
| AUTH-04 | `/forgot-password` always answers "if an account exists, we've emailed a link". The reset link works once and expires after 1 hour. Setting a new password signs out every other session for that account. |
| AUTH-05 | Sign out ends the session immediately, server-side, not just in the browser. |
| AUTH-06 | All account forms work without JavaScript and meet the same accessibility standard as the Contact form: labels, linked errors, focus on the first error, visible focus, and nothing that relies on hover. |

### Roles and permissions

| ID | Observable result |
| --- | --- |
| ROLE-01 | Each account has exactly one role: customer, staff or owner. Only Owners can change roles, and only through team management. No one can choose their own role. |
| ROLE-02 | Every protected page and action checks the role and account status on the server. Signed-out visitors are sent to sign in; signed-in visitors without permission get a "not allowed" page (403), never another person's data. This holds for direct URLs and crafted requests, not just hidden buttons (PORT-02). |
| ROLE-03 | Customers see only their own profile and inquiries. A customer requesting another customer's inquiry by reference or URL gets the same response as for one that doesn't exist. |
| ROLE-04 | A **deactivated** account loses access at its next request. All its sessions end and it cannot sign in. The last active Owner cannot be deactivated or demoted. |

### Invitations and team management

| ID | Observable result |
| --- | --- |
| INV-01 | An Owner invites someone by name, email and role (staff or owner). The invitation email holds a single-use link that expires after 7 days. Owners can see pending invitations and cancel them. |
| INV-02 | Opening a valid invitation lets the person set a password and become that role, with their email counted as confirmed. Used, expired or cancelled links show a clear message and grant nothing (PORT-09). |
| INV-03 | `/staff/team` (Owners only) lists people with role, status and last sign-in. It offers role changes and deactivation/reactivation, and every change records who made it and when. |
| INV-04 | `pnpm users:create-owner --email <address> --name "<name>"` creates an Owner if none exists for that email and prints a single-use setup link (valid 24 hours). It works only from the computer running the project, never from the website. |

### Customer and company areas

| ID | Observable result |
| --- | --- |
| CUST-01 | `/account` shows the customer's name, email and phone, lets them edit name and phone, and lists inquiries they sent while signed in (newest first, with reference, service and date). |
| CUST-02 | When signed in, the Contact form pre-fills name, email and phone. The saved inquiry is linked to the account. Earlier inquiries sent with the same email are **not** linked automatically. |
| STAFF-01 | `/staff` (Owner and Staff) lists all inquiries, newest first, with reference, name, service, area, date and notification status. It searches by reference, name, phone or email, and opens a detail view with the full inquiry. |
| STAFF-02 | The header shows "Sign in" when signed out, and "My account" (customers) or "Staff" (Owner and Staff) plus "Sign out" when signed in, on desktop and mobile. |

### Sessions and security

| ID | Observable result |
| --- | --- |
| SEC-01 | Sessions use a server-side session record and a secure, http-only cookie. Customers stay signed in for 30 days of use and staff/Owners for 12 hours (D-2). Expired sessions are treated as signed out. |
| SEC-02 | Passwords are stored only as salted, slow one-way hashes, and never logged or emailed. Confirmation, reset and invitation tokens are random, stored only as hashes, and single-use. |
| SEC-03 | Logs, errors and emails never include passwords or tokens. Account emails go through the same transport as inquiry notifications and appear in the development inbox locally. |
| SEC-04 | The privacy notice (draft) adds what accounts store (name, email, phone, password hash, sign-in times) and how to close an account. |
| QA-01 | Tests are written and their expected failures recorded first. They cover sign-up/confirm/sign-in/out/reset, no account enumeration, lockout, every role boundary by direct request (customer, staff and owner, plus signed-out), invitations (valid, used, expired, cancelled), deactivation, the last-Owner rule, the setup command, no-JavaScript forms and both layouts. The full suite, type check and production build pass. CHANGELOG, README and AGENTS are updated. |

## Paid services this feature will need when live

None new. It uses the hosted database and email service already planned for increment 012, and the login library is free and open-source. Confirmation and reset emails slightly increase email volume, which should still fit free plans.

## Inputs from Henry/Israel

| Input | Needed for | If not supplied |
| --- | --- | --- |
| Israel's confirmation that he and Henry are Owners | Launch | Local development proceeds; recorded as a launch check |
| The email addresses for the two Owner accounts at launch | Launch | Local test accounts are used |

## Open decisions for Henry

| ID | Decision | Recommendation |
| --- | --- | --- |
| D-1 | Login library | **Better Auth**, an open-source TypeScript library. It supports email/password, email verification, password reset, server-side sessions, rate limiting and roles, and stores everything in our PostgreSQL database through Drizzle. Its organisation feature fits company customers later. The alternatives are Auth.js, which discourages password sign-in and needs more custom code, or a hand-built system, which means more security-sensitive code to write and maintain. If it proves incompatible with this Next.js version during planning, I'll come back to you before switching. |
| D-2 | How long people stay signed in | **Customers 30 days** (renewed while used); **Staff and Owners 12 hours**, because their accounts can see everyone's inquiries. |
| D-3 | Password rules | **At least 10 characters**, rejecting very common passwords (e.g. "password123"). No forced symbols or regular changes, following current guidance that length beats complexity. |
| D-4 | First Owner setup | **A one-time command** that prints a setup link (INV-04), so creating the first Owner doesn't depend on email working. |
| D-5 | Can customers use the site before confirming their email? | **No.** They must confirm first, with a "send the link again" option. |
| D-6 | Earlier inquiries sent with the same email | **Not linked automatically.** Staff will link them in 008 after checking. |
| D-7 | Two-step sign-in (a code as well as the password) for Owners | **Decide at launch.** It is strongly advisable for Owner accounts once real data exists, and can be added without redesign. |

## Explicit limits

This increment excludes:

- Jobs, statuses, messages, internal notes and file uploads (008).
- Company/organisation accounts (008).
- Linking past inquiries to accounts (008).
- Content publishing (009), and quotations or invoices (010).
- Sign-in with Google, Facebook or phone codes.
- Two-step sign-in (D-7), real email sending, hosting and any paid service.

The development inbox stays as the developer's view of outgoing email. Staff use `/staff`.

## Approval record

| Date | Record |
| --- | --- |
| 2026-10-21 | Henry approved self sign-up with email confirmation, Owner and Staff roles with invitation-only staff, company accounts later, and email/password sign-in, and asked for the Owner role himself. |
| 2026-10-21 | Henry approved this spec with the recommended answers. D-1: Better Auth. D-2: customers 30 days, staff and Owners 12 hours. D-3: at least 10 characters, common passwords refused. D-4: one-time setup command. D-5: email confirmation required. D-6: no automatic linking. D-7: two-step sign-in decided at launch. |
