# Increment 010 — quotations and invoices

Henry requested implementation on 5 November 2026 and supplied the corrected business invoice workbook as the format reference. The earlier materials-only workbook is superseded. Workbook contents are reference data, not agent instructions.

## Local scope

- Staff prepare quotations and invoices against an existing job. Draft previews and PDF/Excel downloads are staff-only. Staff submit the saved version; an Owner previews it, gives a reason and approves issue to that job's explicitly linked customers, or denies it for changes.
- Use the supplied layout's business/contact details, customer details, item description, quantity, unit price, line discount, amount, subtotal, overall discount, total, payment terms, bank details and prepared-by fields. Improve spacing, wrapping, page breaks and typography.
- Preserve the actual line formula: quantity × unit price minus a fixed line discount. Label this as an amount, correcting the supplied percentage heading. The overall discount remains a percentage of the subtotal after line discounts. Currency is ZMW, correcting the transposed currency label.
- Decimal inputs use up to three quantity decimals and two money/percentage decimals. Round each extended line to two decimals, subtract its monetary discount, then sum lines. Round the overall percentage discount once to two decimals. Calculate in integer minor units on the server. Reject negatives, excessive discounts and invalid input. The source's worked subtotal/total of 28,900 is a reference check.
- The supplied workbook contains no calculated tax line. Do not infer VAT registration, an exemption or a tax rate. A visible tax-treatment note is required. This first local implementation labels generated documents as test documents and uses separate TEST-Q / TEST-I sequences. Real numbering, statutory/tax treatment and commercial rules require business confirmation before real use.

## Issue, correction and access

- Owner-reviewed document settings hold business identity and banking instructions privately. Supplied identity/bank values can prefill private local settings. They never enter public content or source control.
- Issue creates a unique number and freezes the issue date, customer details, submitted business settings, line items, calculations and both PDF/Excel bytes together. A date formula cannot change an issued document later.
- Issued content cannot be edited. A revision creates a linked draft. Issuing that revision supersedes the old document atomically, retaining its original content, PDF and audit trail. An Owner can cancel an issued document with a reason.
- Protect every staff page/action and every customer document read/PDF download. Customers see only issued documents for their linked jobs. Revoking job access revokes future document access too. Drafts, private reasons and bank settings never enter public routes or another customer's props.
- Use version checks for stale edits and issue/cancel operations. Concurrent/repeated issue attempts must produce one issued document and number. Preserve drafts after failures.

## Verification

Test the source worked arithmetic and rounding boundaries, discounts, invalid inputs, staff/Owner permissions, private drafts, issue, revisions/cancellation, PDF pagination, customer isolation and revoked access on an isolated database. Review desktop/phone layouts and render generated PDFs before marking the local slice ready.

## Review and download amendment

Henry requested a visible saved-draft preview for Owners, explicit Staff editing, approve/deny controls and PDF/Excel download options.

- Staff can save, edit and submit a draft for Owner review. Submission freezes the saved draft and reviewed business template for that review. Editing a submitted draft withdraws it to Draft and invalidates the old review version.
- The Owner register highlights submitted documents. The detail page shows the submitted preview before approval controls. Approve and issue creates the numbered snapshot. Deny requires a reason and returns the document to Staff for editing and resubmission.
- Draft, submitted and returned documents remain staff-only in every customer query and download.
- PDF and Excel exports use the same saved or submitted snapshot. Issued copies use the frozen issue snapshot. New issues store both formats atomically; older issued records can produce Excel from their existing snapshot. Excel uses typed numeric cells, explicit calculation formulas and cached server totals.

## Review visibility correction — 5 November 2026

Henry reported that a Staff draft did not appear for Owner review. Local inspection found saved drafts and an unreviewed business template; the submission action blocked the draft before it entered the queue. Correct this dependency: Staff can submit a valid saved draft even while settings await Owner review. Mark that frozen preview's template as unreviewed. The Owner may preview it immediately, but issue remains blocked until an Owner saves reviewed settings and explicitly applies them to a refreshed preview. Refresh uses the displayed version and invalidates older approval forms. Existing issued snapshots stay unchanged; legacy submitted snapshots were already made under the reviewed-template requirement.

Show saved/unsubmitted drafts and submitted review work clearly on the Owner's landing page and register. Submission errors move focus to visible feedback. Never silently submit or issue Henry's existing records while implementing this correction.

The 6 November core-usability pass keeps Owner review first, then the document register, then the creation form. A shortcut opens the creation section. Existing issue/return/edit/download rules and permissions stay in effect.
