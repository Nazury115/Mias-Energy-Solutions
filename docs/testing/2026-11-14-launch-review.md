# Gwembe release and hosted-review handoff

## Local release evidence

The release build uses Next.js with webpack. A separate database and build directory keep the review records away from the Desktop demo. The logged confirmation date for Gwembe is 14 November 2026. The completion date, customer name, pump ratings and solar capacity have not been supplied.

| Check | Result |
| --- | --- |
| Production build, TypeScript and static page generation | Passed. |
| Unit suite | 192 passed. |
| Production dependency audit | The registry reported zero known advisories in the locked production dependency tree on 14 November. |
| Public project and homepage assets | Microsoft Edge opened Gwembe from Projects, decoded all seven photos and four new logos, and checked the project layout at 320, 390, 768 and 1440 px. The sitemap included Gwembe and the old fictional project URL returned 404. |
| Production Owner/customer walkthrough | Passed ten route checks plus inquiry acceptance, invitation, read receipts, private-note isolation, 5 MiB private download, quotation and invoice approval/return, PDF/Excel exports, project publishing, Trash/restore, and launch-mode filtering. No runtime errors were recorded by the harness. |
| Database restore rehearsal | Exported an offline disposable database to a compressed archive, restored it to a new directory and matched the job reference, filename, size and checksum, including a 5 MiB upload. |

## Bring up a private online review

1. Recommended provider for this review: Render. Create a paid Node web service from the private GitHub repository and add a persistent disk under Advanced. Review the displayed recurring service and disk costs before creating it. Use the assigned HTTPS onrender.com address for the family review. See [Render web services](https://render.com/docs/web-services), [disk requirements](https://render.com/docs/disks) and [pricing](https://render.com/pricing). For the current PGlite implementation, use a single long-running Node process with a persistent disk. Point `MIAS_DB_DIR` at a dedicated directory such as `/var/data/mias/pglite`, with the parent directory on the same disk so the lock persists beside it.
2. Connect the private GitHub repository and select the commit containing Gwembe. Install with the package manager version recorded in package.json using `pnpm install --frozen-lockfile`. Use Node 24 and `pnpm build`. On a Linux service, start with `pnpm exec next start --hostname 0.0.0.0 --port "$PORT"`. The Desktop start script binds to loopback.
3. Set `MIAS_SITE_URL` to that HTTPS origin at **build and runtime**. Generate separate random `MIAS_FORM_SECRET` and `BETTER_AUTH_SECRET` values in the host secret store. Use a clean review database and test contacts. Set `MIAS_PUBLIC_LAUNCH=true` to exercise the real-content filter. Protect the entire preview with host access controls or an identity gateway and test the gate in a signed-out browser. Crawling is currently disabled separately.
4. On Render the disk is available at runtime only. For the initial empty disk, use a one-time runtime start command that runs the bootstrap command before starting Next.js, deliver the printed setup link privately, then restore the normal start command and redeploy. With the web process stopped and the persistent disk mounted, bootstrap the first review Owner using `pnpm users:create-owner --email <owner-email> --name "<owner-name>"`. Open the private setup link and establish the staff and customer test identities. Dev inbox and simulation helpers are disabled in production.
5. Connect a real transactional email provider and verify its sending domain, sender, reply address and inquiry recipient. Exercise receipt, acceptance, account verification, staff/customer invitations and password reset with controlled mailboxes. Check expired links, delivery failures, retries and duplicate handling. The current transport captures messages locally. A hosted walk-through of emailed invitations requires this work.
6. On a physical phone and a desktop, follow the [role review checklist](role-review-checklist.md). Create an inquiry, accept it, open the invitation, share a camera photo, download it from the staff side, review and issue a test document, update the stage and complete the job. Also test a second unrelated customer, a revoked contact, and publishing/editing a project. Check the published URL, contact links, page titles and image loads on the actual HTTPS domain.
7. Redeploy the same review service and reopen the job and file. Configure encrypted off-host backups and an agreed retention schedule, then restore a hosted backup to an independent instance. Set up error, availability, disk space and email-failure alerts. Check client IP/rate limiting behind the host proxy; enable proxy trust only when the origin exclusively accepts traffic from the trusted proxy that overwrites the client IP header.

## Business sign-off before inviting real customers

- Agree on the public domain, business inbox, personnel who own accounts, and who responds to inquiries and monitoring alerts. Store production credentials outside Git.
- Confirm rights for all published site photos, visible people and premises, and third-party logo use. Henry supplied the Gwembe photos and identified the four working relationships. Capture any additional permissions needed for public launch.
- Approve privacy wording, data retention and deletion procedures, then replace the local-preview wording. Confirm live document numbering, invoice settings, bank details and tax treatment before issuing business documents.
- Apply HTTPS, test redirects and canonical/share URLs, and review the public sitemap on the real domain. Enable indexing only for approved public pages at public launch. Keep account, job and staff pages private.
- Keep a tested rollback plan covering both code and database migrations. Record who owns the backup, how to restore it and the expected recovery time.

A private review can use a host-provided HTTPS address before a custom domain is chosen. Public launch follows review by Henry and the business owner.
