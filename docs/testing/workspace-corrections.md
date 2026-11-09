# Workspace corrections verification — 6 November 2026

Scope: Henry's reported document submission visibility, existing project management, explicit project controls and mobile view. See the [plan](../plans/workspace-corrections.md) and amended 009/010 specifications.

## Reproduction

Read-only browser inspection of the existing local accounts confirmed both commercial documents remained in Draft, the document template had not been reviewed, and the Owner review queue was empty. The public repository stories were missing from the Publishing inventory. No existing customer/job/document/content record was mutated during diagnosis.

## Checks

- TypeScript passes; 204 unit checks pass.
- The initial three isolated Edge journeys passed: before-template submission with Owner queue/preview, issue gate and stale template approval; repository project edit/publication/Trash/restore with stable URL and role boundaries; allowlisted mobile frame and protected sign-in.
- The expanded run passed five journeys, including repository photo publication, copied-action denial for Staff/Customer, stale edits after Trash, restored private photo access, blocked public media, one public story per slug and all existing publishing regressions. The document journey passed its workflow assertions but its final screenshot timed out after fonts loaded. The capture was moved to the Owner review queue with animations disabled; the complete journey then passed on a fresh database. Six focused browser checks pass across the final runs.
- Inspected the captured 390 px Owner review queue and project editor. Controls wrap and the edit/publication actions remain visible. Both workflows and the live phone helper pass horizontal-overflow checks at 320/390/768/1440 px.
- The optimized production build and its TypeScript check pass. A read-only check of five normal-preview Owner pages also passed all four widths with no browser runtime errors. Applied the documented Next.js 16 smooth-scroll marker after the mobile capture exposed its development warning.
- The final production integration runner passed all ten route/status checks, including development-only inbox/mobile 404s. It exercised no-JavaScript solar intake, duplicate submission, local email/SMS captures, customer invitations, conversation/read receipts, 5 MiB file access, pre-settings document submission, Owner queue/issue gate/template refresh, denial/resubmission/stale approval, PDF/Excel downloads, repository replacement at a stable URL, Trash/unpublished restore, customer isolation/revocation and launch filtering. It reported `runtime_errors: []`.
- After applying the smooth-scroll marker, the normal-preview check again passed five pages at all four widths, with zero runtime errors and no smooth-scroll warning. Final standalone TypeScript and Git whitespace checks pass. Temporary build-specific TypeScript configuration changes were removed.

All browser mutations use disposable databases below `.data/verification-workspace-*` and the separate `.next-verification` build. The normal preview uses its original `.data/pglite` and `.next`. Email and SMS remain local captures.

The production bundle used `.data/verification-workspace-build/next`; the production runner selected its own fresh database under `.data/verification-008/production-*`. Both stay separate from the normal preview. No external email or SMS was sent. The full site-wide browser suite was not rerun; the focused regressions and production integration cover the changed workflows.

The verification servers are stopped. The normal preview remains running at <http://127.0.0.1:3000> at Henry's request. Existing drafts still require explicit submission, and no existing project was automatically published or deleted. 011A and these corrections remain uncommitted for review.

Later on 6 November Henry removed the solar planner from active scope and requested improvements to the existing workflows. The later [retirement and core-quality verification](planner-retirement.md) supersedes the planner's status above.
