# Increment 008 follow-up — job files and company access

Henry approved both local slices as drafted on 2026-11-02. Builds on [008 core](008-requests-jobs-and-progress.md) and PORT-07.

## A. Private job files

- On an active job, a linked customer or active Staff/Owner can attach one JPEG, PNG or PDF at a time. Proposed limits are 5 MiB per file and 20 stored files per job, across all uploaders. The form displays the limits before selection. Existing jobs start with an empty file list.
- Label the file area “Shared with this job's customers and Mias staff.” Show filename, size, uploader and date. Private staff notes stay separate. Completed and cancelled jobs retain downloads and close uploads.
- Store bytes locally outside the public site in a private directory isolated per database. Use generated storage keys. Validate content and size server-side, reject malformed files, serve authorized downloads as attachments, and keep responses out of shared caches. Check active staff role or active customer association on every list, upload and download.
- A failed upload shows a reason and leaves neither a downloadable partial file nor a consumed slot. Concurrent uploads must respect the cap. A retry of the same submission must not duplicate a file.
- For local review, use fictional files. Staff/Owners can remove an incorrect file with a reason. Remove access to the bytes and retain a staff-only audit entry. Agree real-data retention, backup/restore, scanning and deletion responsibilities before pilot use.

## B. Shared company access

- Each company contact signs in with their own verified account. Staff/Owners record the company and invite each contact to a specific job after reviewing their email. A customer may have multiple jobs and a job may have multiple contacts. Company membership alone grants no job access.
- The invitation names the job and explains that acceptance gives access to its existing and future customer-visible progress, messages and shared files. Use the core invitation verification, expiry, cancellation and sign-in rules. A resend supersedes only the selected contact's pending invitation.
- Staff see who has access and can revoke one contact immediately without affecting others. A customer can read, message and upload only on assigned jobs, with the same terminal-job rules as the individual portal. Only staff manage access. Preserve existing individual jobs, accepted links and pending invitations through migration.

## Review and acceptance

1. Walk one fictional request through acceptance, invitation, progress and completion with Israel. Record any stage or wording corrections before real customer use.
2. For A, test accepted formats, disguised/empty/oversize files, exact limits, interrupted writes, concurrent submissions, removal and direct downloads as a stranger, a revoked customer and a signed-out visitor. Check phone and desktop layouts.
3. For B, invite two contacts to one job and only one of them to a second job. Test new and existing users, separate invitation lifecycles, wrong-account attempts, revocation and direct requests for messages and files. Verify private staff notes remain inaccessible and existing individual access survives the migration.
4. For each slice, record failing tests first, implement, then run targeted and regression checks in an isolated local database. Record verification results before calling the slice complete.
