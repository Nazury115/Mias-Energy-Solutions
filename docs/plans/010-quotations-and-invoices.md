# Increment 010 implementation and tests

Review amendment: add regression coverage first for Staff submission, Owner preview/denial, returned-draft editing, stale approval after edits, frozen review settings and private PDF/Excel downloads. Add review metadata and stored Excel bytes through a generated migration. Use one snapshot for screen/PDF/Excel and a portable OOXML writer with numeric cells, formulas and cached exact totals. Verify permissions and render exported workbooks before updating the local preview.

1. Inspect the corrected source without modifying it. Keep extracted private reference values under .data. Record format and arithmetic decisions in the spec.
2. Add exact decimal calculation tests before the calculator. Add draft/issue/PDF access journeys before pages.
3. Add private settings, commercial documents and transactional number sequences through a generated migration. Reuse job authorization and audit log.
4. Build Staff document list/editor, Owner settings and issue/revision/cancel actions. Add customer document links to each authorized job.
5. Render issued PDFs from immutable snapshots and save PDF bytes in the issue transaction. Use the same snapshot for HTML and PDF.
6. Verify on isolated storage, render sample PDFs, run appropriate regressions and production build. Leave the normal preview stopped unless Henry asks to start it.
