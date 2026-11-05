# Increment 010 local verification — 5 November 2026

009 was committed as cd6b403 before this work. The corrected invoice workbook supersedes the earlier materials schedule. It was inspected read-only; source values and bank instructions were extracted only to the ignored private data folder.

## Behavior and evidence

- The document-rule tests initially failed because the calculator did not exist. All 180 unit tests now pass, including the supplied 9 × 2800 + 1 × 3700 = 28900 worked total, exact decimal rounding, fixed line discounts, overall percentage discounts, invalid dates and template length bounds.
- Two complete Edge journeys passed against the separate port-3200 database. They cover private drafts, staff preview PDFs, Owner issue, correct customer access, stranger denial, original PDF byte preservation after revision, cancelled status and revocation of future downloads.
- A Staff account could prepare drafts but could not issue. Replaying an Owner issue action with Staff cookies returned 403. Repeating the authorized issue request kept the same issued record. Stale draft edits were rejected while preserving the typed text.
- The first browser run exposed a test waiting for a wildcard URL that already matched the original document. Waiting for a different document ID fixed the revision test; the rerun completed both journeys.
- The document pages showed no horizontal overflow at 320, 390, 768 and 1440 pixels. PDF layouts were rendered and visually reviewed for a one-page invoice and a nine-page example with long line descriptions. Headings repeat and rows, totals and footers fit.
- TypeScript and the optimized webpack build passed. The local production journey exercised both quotations and invoices, their separate TEST sequences, Owner issue and protected PDF downloads. It also retains the prior job/notification/publishing checks.
- A scan confirmed that the source bank-account number is absent from project source files. Banking values are in private Owner settings, frozen into authorized issued-document snapshots.

## Review/download amendment

The review/download amendment adds a frozen submitted snapshot, explicit Owner approval/denial and returned drafts, plus stored Excel files. Customer reads whitelist only issued, superseded and cancelled documents. PDF and Excel exports share the saved/submitted/issued snapshot; internal return reasons stay in Staff pages and the audit log.

The first amendment browser run exposed a customer invitation POST rejected by Next because `referrer: no-referrer` produced an opaque Origin. The invitation page now uses `same-origin`, which still suppresses cross-origin referrers while allowing its same-origin Server Actions. The run was stopped for correction and rerun.

Twelve document unit checks pass, including a maximum-40-line workbook, date typing, XML escaping, literal formula-looking text, exact cached rounding and discounts. Short and long exports were imported and rendered using the bundled spreadsheet tools; openpyxl independently read their dates, formulas and cached totals. A private bank-number scan passed.

Two complete Edge document journeys pass across reruns: issue/revise/cancel/revoke with unchanged original PDF and Excel bytes, plus Staff denial of Owner-only actions, stale edit preservation and idempotent issue. The approval-request capture was updated to account for the new submission notice in the URL. A third development journey reached Staff submission and customer setup without JavaScript, but retries hit screenshot/navigation timeouts before finishing; it is not recorded as a passing dev test.

The optimized webpack build and TypeScript checks pass. The final isolated production run covers Owner draft preview, denial with private feedback, editing returned drafts, resubmission, rejection of outdated approval after edits, frozen submitted settings, customer exclusion of submitted/returned documents, both download-selector choices, typed Excel formulas/cached totals and separate quotation/invoice sequences. It also passes the existing job, notification, file, publishing and launch-filter regressions, with `runtime_errors: []`. One earlier production run logged a resource 404 after the document checks; adding resource-location logging and a document-phase assertion produced a clean full rerun. No source fix was inferred from that transient result.

## Decisions and remaining scope

The source worksheet labels the line discount as a percentage but subtracts it as an amount. The implementation preserves the calculation and labels the field as a ZMW amount. Overall discount remains a percentage. ZWM was corrected to ZMW, and issued dates are frozen.

Documents are explicitly local tests. Final tax treatment, real numbering, quotation acceptance, payment-status recording and applicable commercial rules require Mias confirmation before real use. The sheet contains no calculated tax line, so no tax rate was guessed. The full site-wide browser suite was not repeated.

At verification, the normal preview opened with migration 0007 applied. An unauthenticated request to Documents correctly reached the sign-in page with HTTP 200. Henry subsequently requested that the server stop; it remains stopped while preparing the commit. The isolated verification servers are stopped. Generated PDFs/Excel files, source extracts, test credentials and local data are ignored by Git.
