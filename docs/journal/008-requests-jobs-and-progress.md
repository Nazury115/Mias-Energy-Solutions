# Increment 008 core — review walkthrough

Date: 2026-10-26. This explains the local workflow Henry requested. Measured verification belongs in `docs/testing/008-results.md`.

## Try the journey locally

1. Start the website using `Start website.cmd`. A fresh server applies the generated migration automatically when opening its database. Keep only one process on that database; stop/restart the server after a schema update rather than opening the database from a maintenance script while it is running.
2. Sign in as an Owner or Staff. For a first local Owner, `/dev/inbox` has the existing development-only invitation helper. Use fictional test contacts while trying the flow.
3. In a separate signed-out/private window, send a Contact request with email and phone. Keep the `MES-…` reference. `/dev/inbox` shows a company notification plus independent email/SMS receipt captures. Nothing is sent externally.
4. Open **Inquiries** at `/staff`. In the request's row, select **Review / accept** to jump to its acceptance form, or select the **MES-… reference** to read the full inquiry first. On the detail page, **Accept request** near the top also jumps to the form below the inquiry details. Record a review status/reason if needed, then fill **Agreed scope**, **Next step**, **Responsible staff** and **Reason**, and select **Accept and create job**. The job gets a `JOB-…` reference. Acceptance email/SMS appear as separate local captures. An already accepted inquiry shows **Open job** instead; a closed inquiry needs its review status reopened before it can be accepted.
5. On the job page, review the customer name/email, confirm that the identity/contact was checked and select **Invite customer**. The invitation is an email; its link is in the development inbox. Sending another invitation cancels the earlier pending one.
6. Open the customer invitation in the private window. A new customer chooses a password; an existing customer signs in with the invited email and accepts. This is the point at which access is granted. Request receipt or a typed matching email alone never grants access.
7. The customer sees the job under **My account → Your jobs**. Staff can publish a customer update or message; customers can reply. Record an internal note on the staff page and confirm it is absent from the customer view. Updates/messages remain in the portal and do not send email/SMS alerts.
8. Change the job stage and next step with a reason. Check the customer's dated history. Open an older staff tab and try saving an outdated change: it should ask for a reload rather than overwrite the newer edit.
9. Revoke customer access with a reason. The next customer request for the job gets the same 404 as an unknown job. Its previous history is retained for authorized staff. Cancelling an invitation or revoking access does not delete the inquiry/job.

## Why the boundaries matter

- **Receipt** proves the inquiry was saved. It is not a promise that the work, appointment or quotation was accepted.
- **Acceptance** creates one linked job and records the agreed work/next step. Repeating conversion cannot create another job for that inquiry.
- **Invitation acceptance** proves the intended email/account and grants the explicit job association. Staff can review a different contact when appropriate; the system never guesses an association from an email match.
- **Public updates and private notes** are distinct events. The customer SQL query excludes private notes before selecting their bodies; the page does not merely hide them with CSS.
- **Local capture** means the development outbox saved the message. Live providers, delivery receipts and sending budget are still launch work. A sending/unknown state must be reviewed before resending; failed messages have a bounded retry count.
- **Form recovery** keeps staff drafts after a rejected save and keeps visitors' details if they start typing before JavaScript finishes loading. A delayed-script test reproduced the latter bug before the fix. Next.js was also patched to 16.4.1 after the build identified the existing security advisories.

## Main files

| Area | Where |
| --- | --- |
| Stage rules, validation and fixed receipt wording | `src/lib/jobs.ts` |
| Transactions, access checks, invitations, history and messages | `src/server/jobs.ts` |
| Request acceptance and staff actions | `src/app/staff/jobs/actions.ts` |
| Customer message and invitation actions | `src/app/account/jobs/actions.ts`, `src/app/job-invite/actions.ts` |
| Staff/customer/invitation pages | `src/app/staff/jobs/`, `src/app/account/jobs/`, `src/app/job-invite/` |
| Forms and history presentation | `src/components/job-forms.tsx`, `job-history.tsx` |
| Per-channel event outbox and local transport | `src/server/mail/outbox.ts`, `transport.ts` |
| Tables and generated migration | `src/server/db/schema.ts`, `drizzle/0002_jobs_and_notifications.sql` |
| New rule/journey checks | `tests/test_job_units.py`, `tests/test_jobs.py` |

## Review questions

1. Which event grants customer portal access: saving the inquiry, staff accepting it, or accepting the verified invitation?
2. Where should staff put a note that the customer must not see?
3. If SMS delivery fails after the inquiry was saved, what should remain saved and what should staff check?

Uploads and shared company accounts remain the agreed follow-up slice. Quotations/invoices, staff publishing, solar planning and public launch retain their own increments.
