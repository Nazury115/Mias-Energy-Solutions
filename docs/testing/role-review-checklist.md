# Mias website review checklist

Use three separate browser profiles for Customer, Staff and Owner. Start at [the local preview](http://127.0.0.1:3000). Use fictional details and a disposable project for publishing tests. Leave these boxes empty until **you** have seen the expected result. Automated verification is recorded separately below.

## One job from first contact to handover

| Done | Who | Action and expected result |
| --- | --- | --- |
| [ ] | Customer | Open **Who we serve**, choose Farms, follow a service link and open the inquiry form. Submit a request using an email address and no phone number. Save the MES reference shown on screen. |
| [ ] | Staff | Find that reference under **Inquiries**. Check the service, contact details and preferred reply method. Record a review reason and move the request through Under review or Awaiting information as needed. |
| [ ] | Staff | Use **Accept and create job**. Enter the agreed scope, responsible person, next step and reason. Record the JOB reference. Reopen the inquiry and follow its link to the same job. |
| [ ] | Local reviewer | Open the [development inbox](http://127.0.0.1:3000/dev/inbox). Check one customer receipt email for the MES reference and one acceptance email for the JOB reference. The business intake email is a separate notification. |
| [ ] | Staff | Verify the customer's identity, then invite the customer from the job. Acceptance of an inquiry alone does not grant portal access. |
| [ ] | Customer | Follow the invitation email. Set up a new account, or sign in with the matching verified account. Open the job and compare its scope, stage and next step with Staff's view. |
| [ ] | Staff and Customer | Exchange two messages. Check earlier messages, timestamps and read status after the other person opens the conversation. Publish a customer update and save a separate private note. Only the update should appear for Customer. |
| [ ] | Staff and Customer | Share a small PDF or image. Open and download it from the other profile. Check the filename and contents. |
| [ ] | Staff | Make a quotation on the job. Enter two line items, quantities, prices, line discounts and an overall discount. Save, reopen, edit and preview, then submit it for review. |
| [ ] | Owner and Staff | Open the Owner review queue, preview the submitted document and return it with a reason. Staff sees the reason, edits the draft and submits it again. |
| [ ] | Owner and Customer | Approve and issue the reviewed version. Customer opens the issued quotation from the job and downloads PDF and Excel. Compare the reference, issue date, lines and total in both files. Repeat with an invoice. |
| [ ] | Staff | Follow Assessment → Awaiting quotation decision → Scheduled → In progress → Completed. Set a useful next step and a private reason each time. Try On hold and resume before completion. |
| [ ] | Customer | Keep Progress open while Staff changes the stage. Confirm the current stage, next step and shared updates refresh. At completion check handover details, history and issued documents. The private change reason stays in the company workspace. |

## Customer and visitor

- [ ] Browse Home, Services and individual service pages, Who we serve and its six sector links, About, Projects, Contact and Privacy. Try the mobile menu and keyboard navigation.
- [ ] Filter project examples by service, open a story, explore the coverage map, and open, navigate and close the work-photo viewer. Check the distinction between illustrative photography, fictional examples and approved work.
- [ ] Try the phone, email and WhatsApp contact links. Prepare a WhatsApp message, inspect its text and cancel before sending if this is a test.
- [ ] Try an invalid inquiry, correct it and confirm entered details remain. Test email only, email plus phone, and phone only. A phone-only submission still gets an on-screen reference; no customer receipt email is possible.
- [ ] Register, confirm the email, resend confirmation if needed, sign in, edit profile/contact details, sign out and reset a forgotten password using the local email.
- [ ] Send an inquiry while signed in and find it in Your inquiries. Open a job from Your jobs. Check that another customer or a colleague from the same company needs their own explicit grant.
- [ ] Follow shortcuts to Messages, Progress, Files and Documents. Send a reply on a phone and revisit older messages.
- [ ] Switch between All, Messages, Documents & files, and Progress. In Messages, send a photo with **Attach a photo or file**. On a phone, try **Use camera**. Check that the same file downloads from chat and Documents & files, and appears in the staff conversation.
- [ ] Upload a JPEG, PNG or PDF to an active job, within the 5 MiB file size and 20-file limit. Try an unsupported file and check the explanation. Download a file after sign-in.
- [ ] After Staff revokes access, revisit the job, its file URL and its document download. Access should end for the revoked person alone.

## Staff

- [ ] Sign in, open the inquiry and job registers, and search by reference or contact details. Review or close an unaccepted inquiry with a reason.
- [ ] Reopen an accepted job. Edit scope, responsible staff, next step and stage. Confirm history persists after refresh. Try an invalid jump from Assessment to Completed. Try Cancelled on a **second** job.
- [ ] Open the same job twice; save a change in one tab and then try saving an older edit in the other. Check the stale edit is refused.
- [ ] Invite two separate company contacts to one job. Cancel or replace one pending invitation, accept the current invitation and revoke one grant. Confirm the other contact still has access.
- [ ] Check the job's notification status. Retry an eligible failed email. Reopening the inbox or retrying should not duplicate a successful receipt.
- [ ] Post progress and conversation replies, save a staff-only note, upload a shared file, and remove a file with a private reason.
- [ ] Open the document register, find an existing draft, preview, edit and submit. Edit a submitted draft and check that it needs review again. Start a revision of an issued document and compare it with the original.
- [ ] In the publishing workspace, create a project draft and a testimonial draft. Check required fields, source/permission evidence and fictional/real classification. Upload an approved project photograph with a useful description.
- [ ] Locate an existing repository project, preview it, start managing it and edit its draft. View the private preview. Check that the published version still shows the previous approved text.

## Owner

- [ ] Repeat Staff actions in the Owner workspace. Check the dashboard review counts and links to submitted documents.
- [ ] Review business document settings. Try reviewing a submitted draft before settings are complete; complete the settings and explicitly refresh the preview before issue.
- [ ] Return a draft with feedback, approve a corrected version, and try approving a stale version from a second tab. Review separate quotation and invoice test references.
- [ ] Issue a revision and cancel a disposable issued document with a reason. Check status/history and which documents the customer can download.
- [ ] Preview and publish a project with evidence and a reason. Check its public detail page and listing. Edit the draft while the public version is open, then publish the update and check that the URL stays the same.
- [ ] Publish and unpublish a testimonial and inspect the public Projects page. Unpublish a project. Move a disposable project to Trash, restore it and verify it is unpublished until approved again.
- [ ] Invite a Staff member, cancel a pending invitation, verify a fresh invitation, change an eligible team member's role, deactivate and reactivate them. Check Recent changes and the last-active-Owner safeguard using disposable accounts.
- [ ] Verify boundaries using a Customer profile, a Staff profile and a signed-out window. Owner settings, private notes, publication evidence and other customers' jobs should only be available to their intended audience.

## Local tools and delivery

- [ ] Use the development inbox to inspect account verification, password reset, invitations, business intake, customer receipt and acceptance emails. In local development, “captured” means the message is stored for inspection.
- [ ] On isolated data, simulate a database failure and an email failure separately, then restore Normal. A failed save must be visible. A saved inquiry survives a notification failure.
- [ ] Check the live mobile preview at 320, 390 and 430 px. Also test on a real phone when staging is available.
- [ ] On a future staging site with a configured email provider, verify actual delivery, links and downloads from a separate device. Local captures cannot verify internet delivery.

## Automated results for this review

All 316 distinct pytest cases passed across the isolated Edge runs. The first run passed 268 of 313. The shared browser closed during the run, and the standalone sector test also attempted to open a second Playwright runtime. The rerun used a fresh browser per module, reused the fixture for sector navigation, and included three additional role and photo checks. It passed 44 of 48. The last four passed in a focused run after verifying the closed-job notice, waiting for both actual read receipts, and checking the current published project links.

| Area | Verified outcome |
| --- | --- |
| Intake and notifications | Email-only, email plus phone and phone-only submissions; local receipt and acceptance email; failure, retry and duplicate-submission handling. |
| Accounts and access | Sign-up, confirmation, password reset, profile persistence, invitations, team role changes, deactivation/reactivation, independent customer grants and revocation. |
| Job lifecycle | A Staff account accepted an inquiry and moved the job through quotation decision, scheduling, hold, resumption and completion. The linked customer saw each current stage and the handover next step. A separate Staff journey reviewed, closed, reopened and accepted a request, then cancelled the job. |
| Communication and files | Shared progress, private notes, ordered conversation, per-contact read receipts and retained drafts; uploads, downloads, permitted formats, size/count limits, removal and access changes. |
| Commercial documents | Preparation and editing, first-time Owner settings, versioned submission, return, resubmission, issue, revisions, cancellation, customer PDF and Excel downloads. |
| Publication | Staff drafts and previews, Owner publication and withdrawal, testimonials, existing-project edits, stable public URLs, controlled photo access, Trash and unpublished restore. |
| Public website | Responsive and keyboard journeys, service and sector links, account boundaries, galleries, map and intake. On a fresh preview 27 distinct editorial images appeared across the 12 audited routes with no cross-page reuse. |

The optimized build and its TypeScript check passed. The compiled production smoke test verified ten routes and the integrated account, job, document and publication flows with zero reported runtime errors. Two historical SMS rows stayed at their original pending/failed states and attempt counts after new requests and deliveries. No live email provider was exercised.
