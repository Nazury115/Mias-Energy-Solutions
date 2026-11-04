# Job conversation implementation and tests

Use existing customer-visible messages and updates as the source of the conversation. Add a unique first-read row per event and reader. The server checks job access, event kind and audience before recording a receipt. Read and write requests derive identity from the session.

Render the initial thread on the server. Poll only the conversation while the page is visible. Observe incoming bubbles against the browser viewport and record views only in a focused tab. Keep the composer and its draft separate from polling. Preserve the existing authorized, idempotent send action and plain form submission.

Test signed-out fetches, historical messages, separate staff/customer sessions, hidden and off-screen messages, live receipts, draft retention, private notes and revoked access. Run the generated migration and walkthrough on an isolated database, then check the production build.
