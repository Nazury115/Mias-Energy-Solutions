# Increment 007 — implementation and test plan

Date: 2026-10-21. Implements [spec 007](../../specs/007-accounts-and-logins.md), approved with decisions D-1 to D-7.

## Library check (D-1)

`better-auth` **1.7.12**, MIT licence, pinned. Its declared peer ranges include Next 16, React 19, `drizzle-orm` ^0.45.2 and `drizzle-kit` ≥0.31.4, all of which we use. The features this increment needs are present in the installed types:

- **Email and password:** `requireEmailVerification`, `minPasswordLength`, `revokeSessionsOnPasswordReset`, `resetPasswordTokenExpiresIn`.
- **Sign-up protection:** `onExistingUserSignUp`, for the notice sent when someone signs up with an existing email.
- **Token storage:** `verification.storeIdentifier: "hashed"`, so reset tokens are stored as hashes.
- **Hooks and accounts:** `databaseHooks.session.create.before` can return `false` to block sign-in. `$context.internalAdapter.createUser` / `linkAccount` and `password.hash` create invited accounts.
- **Telemetry:** off by default, and switched off explicitly anyway.

No change of library is needed.

## Approach

- **No public Better Auth HTTP endpoint is mounted.** Every flow goes through our server actions calling `auth.api.*` directly. Our lockout, wording (no account enumeration) and role rules therefore cannot be bypassed. Emailed links point to our own pages (`/verify-email`, `/reset-password`, `/invite`), which call the library on the server. The `nextCookies()` plugin sets session cookies from server actions.
- **Database** (new migration):
  - Better Auth's `user`, `session`, `account` and `verification` tables, with `user.role` (customer, staff, owner), `user.phone` and `user.status` (active, deactivated).
  - Our own `invitations` (token stored as SHA-256 hash), `auth_attempts` (failed sign-ins and reset requests, for lockout and limits) and `audit_log` (who changed whom, when).
  - `inquiries.user_id` (nullable), and `notifications.inquiry_id` made nullable plus a `kind` column, so account emails share the outbox.
- **Outbox:** delivery and retries move from `inquiries.ts` into `src/server/mail/outbox.ts`, used by inquiries and account emails alike. `/dev/inbox` gains an "Account emails" list with each email's link.
- **Viewer and permissions:** `src/server/session.ts` provides `getViewer()` (session plus active-status check plus the 12-hour staff/Owner limit) and `requireViewer(roles)`. That function redirects to `/sign-in?next=…` when signed out and calls `forbidden()` (403 page, `experimental.authInterrupts`) when not allowed.
- **Pure rules** (`src/lib/accounts.ts`, unit-tested through Node): password rules with a common-password list, sign-up validation, session age by role, invitation state, and the last-Owner rule.
- **Header:** pages stay static. The header asks `/api/session` after loading and shows Sign in, or My account/Staff plus Sign out.
- **First Owner:** `pnpm users:create-owner --email … --name …` (in `scripts/db.mjs`) inserts an Owner invitation and prints its link. Because PGlite allows one process at a time, it runs with the website stopped.

## Spec clarifications (recorded in spec 007 as an amendment)

1. **Development-only Owner invitation helper.** For automated tests and local trials while the server runs, `/dev/inbox` gets a development-only "Create an Owner invitation" form. It returns 404 in production builds, like the inbox itself. The command remains the documented way.
2. **AUTH-02 "works once".** Better Auth confirmation links are signed rather than stored. A second click only re-confirms an already confirmed email, and never signs anyone in, because automatic sign-in after confirmation is off.
3. **SEC-01.** The 12-hour staff/Owner limit counts from sign-in; the 30-day customer sessions renew while used.

## Tests (written before implementation)

| Test | Type | Requirements |
| --- | --- | --- |
| `test_account_units.py`: password rules, sign-up validation, session age by role, invitation states, last-Owner rule | unit | AUTH-01, SEC-01, INV-02, ROLE-04 |
| `test_accounts.py`: sign up → confirm → sign in → My account | browser | AUTH-01, 02, CUST-01 |
| existing-email sign-up gives the same screen and emails the owner of that address | browser | AUTH-01 |
| identical message for a wrong password and an unknown email; lockout after 5 failures | browser | AUTH-03 |
| reset flow: generic answer, reset signs out other sessions, old password fails, reused link refused | browser | AUTH-04 |
| sign out; signed-out redirects; 403s for customer → staff pages and staff → team page | browser | AUTH-05, ROLE-02, 03 |
| Owner invites Staff → accept → Staff workspace; reused and cancelled invitations refused | browser | INV-01, 02, 03, STAFF-01 |
| deactivated Staff loses access and cannot sign in | browser | ROLE-04 |
| signed-in inquiry is pre-filled, linked to the account, listed on My account and found by Staff search | browser | CUST-02, STAFF-01 |
| sign-in without JavaScript; header links when signed in and out | browser | AUTH-06, STAFF-02 |

Manual: the setup command with the server stopped, `/dev/inbox` helper 404 in production, and the production build.
