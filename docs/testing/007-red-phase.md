# Increment 007 — tests defined before implementation

Date: 2026-10-21. Tests: `tests/test_account_units.py` (31) and `tests/test_accounts.py` (10), 41 collected. They were run against the development server before any increment 007 page or schema existed.

**Result: 41 failed in 6 min 4 s, all for missing behaviour.**

| Group | Count | Failure |
| --- | --- | --- |
| Unit: password rules, sign-up validation, session age by role, invitation states, last-Owner rule, safe return paths | 31 | `src/lib/accounts.ts is not implemented` |
| Browser journeys: sign-up/confirm/sign-in, existing-email sign-up, same-message errors, lockout, reset, role boundaries, invitations, deactivation, linked inquiries, no-JavaScript sign-in | 10 | `Locator.fill` timeout (the account pages don't exist yet) |

Server modules (`src/server/auth.ts`, `session.ts`, `attempts.ts`, `team.ts`, `mail/outbox.ts`), the action files and form components were written during the run. No page or route imported them until it finished.

**Test adjustment after the red phase.** Next.js renders a hidden route announcer with `role="alert"` outside `<main>`. Checks that read the alert's text were therefore scoped to `main` to avoid matching two elements. What they assert is unchanged.
