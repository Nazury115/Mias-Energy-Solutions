# Workspace review and project controls

Henry requested these corrections while reviewing 010/011 locally. They are corrections to the approved workflows, not a new backlog increment.

1. Reproduce the missing Owner submission and inventory mismatch without changing Henry's records. Both commercial records were still saved drafts, blocked by unreviewed template settings; the public repository stories were absent from Publishing.
2. Add regression journeys for submission before settings review, the issue gate, explicit template refresh and stale approval; repository preview/import/edit/publish/Trash/restore and role boundaries; live mobile preview and layout widths.
3. Freeze a reviewable template at submission. Owner settings review and an explicit versioned preview refresh remain prerequisites to issue when the initial template was unreviewed. Show the review queue and unsubmitted count on the Owner landing page.
4. Import existing repository stories idempotently into private drafts with stable slugs and frozen illustrative image attribution. Assemble approved replacements in `src/content/projects.ts`. Unpublish, Trash and restore must suppress the repository fallback. Preserve sample classification and launch filtering.
5. Keep deletion Owner-only, version checked, audited and recoverable. Trash removes public snapshots and blocks private/public photo access; restore creates an unpublished draft.
6. Add a development-only phone frame with allowlisted local routes and widths. Authentication continues inside the framed website.
7. Verify against a separate database/build directory: TypeScript, unit tests, focused Edge journeys, production build and production role/route checks. Keep Henry's preview running and records unchanged. Record results in the testing log and changelog.
