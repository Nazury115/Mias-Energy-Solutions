# Increment 011A local verification — 5 November 2026

**Historical verification:** Henry retired the planner on 6 November 2026. These results document the earlier implementation and do not describe the current feature set. See [retirement verification](planner-retirement.md).

Henry requested the 010 commit and continuation to 011. The completed local 010 workflow was committed as `c055dc6`, with a staged privacy scan and clean diff check. Henry then explicitly approved the load-summary/inquiry-handoff slice in spec 011 before implementation. Equipment sizing and pricing remain outside that approval.

## Measured checks

- The first calculator run failed with `ERR_MODULE_NOT_FOUND`, establishing the expected red phase. After implementation, all **204 unit tests** passed, including 22 new planner checks for exact decimal arithmetic, Wh/kWh conversions, simultaneous/essential sums, explicit unknowns, range/precision errors, maximum rows and forged/oversized payloads. The oversized-input test initially exceeded Windows' argument limit; its bridge now sends JSON through stdin.
- Four initial Edge planner journeys passed: JavaScript and no-JavaScript saved handoffs, input retention on failed save/unknown values, and delayed-script hydration. They exercised Staff review, accepted jobs, customer invitations and revocation.
- Ten affected regression cases passed: the improved unknown-value display, ordinary contact saving, no-JavaScript contact submission, the existing delayed-hydration contact regression, five responsive home widths and the mobile menu.
- A separate red check caught the first native submit intent being Remove. A hidden read-only Calculate submitter fixed Enter-key behavior. Three subsequent checks passed, covering the default intent and both planner handoff modes with row removal and a different signed-in customer denied access to the job.
- Guest layouts passed at 320, 390, 600, 768, 1001, 1024, 1100, 1200 and 1440 pixels. Signed-in navigation passed at 1001–1440 pixels. Desktop form and mobile summary screenshots were captured and visually reviewed; the wide appliance table scrolls inside its container.
- An isolated upgrade fixture applied the generated migrations through 0007, inserted a legacy inquiry and linked job, then applied generated migration 0008. Original inquiry contents/version and job associations were retained; its new `solar_plan` value was null. The normal database was not opened for this test.
- TypeScript and the optimized webpack production build passed. The first production planner attempt exposed a no-JavaScript input remaining read-only after clearing an unknown-hours checkbox. Read-only locking now activates only after hydration, and the form explains that checked unknown markers override previous numeric values. The rebuilt production journey successfully changed unknown hours back to a known value and continued through saving.

## Production evidence

The existing isolated integration runner now accepts `MIAS_VERIFY_SOLAR=1` to exercise solar intake, and defaults to the ordinary Contact journey otherwise. Both modes completed successfully on the rebuilt application, each reporting nine expected route checks and `runtime_errors: []`.

The solar run verified:

- No-JavaScript row editing, unknown-input assessment, restoration to known inputs and exact saved totals.
- Calculation alone left the Staff inquiry search empty. A forged extra browser total did not affect the server snapshot.
- Replaying the actual submission created one inquiry; an offline read while the sole server was stopped confirmed `dailyWh: "448"`, `load-summary-v1` and the original appliance ratings.
- Staff/job/customer views retained the saved snapshot. Signed-out and unauthorized Staff/customer-route requests were rejected; revoked customer access returned 404.
- The established email/SMS local captures, invitation, conversation/read receipt, 5 MiB file transfer, Owner document review/denial/stale approval, PDF/Excel downloads, publishing/unpublish and launch-filter checks continued to pass.

The ordinary Contact production run also passed, confirming that a request without a planning snapshot still proceeds through the existing portal and document workflow.

## Files, privacy and limits

Generated SQL and metadata are migration 0008. App code never writes a plan during calculate/add/remove; final intake reuses the existing validation, spam/rate limits, idempotency and outbox pipeline. The server recalculates before the transaction, and a replay returns the original saved snapshot. Job reads use the shared access check in SQL.

The changed-file scan found no private bank number, test password or primary test-customer/staff email. A broader initial scan also matched contact addresses already present in the unchanged business specification; that was not treated as newly added 011 content. Test data, credentials, screenshots and local database fixtures remain ignored by Git.

The full site-wide browser suite was not rerun. The calculator's examples are synthetic arithmetic fixtures, not engineer-approved system designs. No inverter, battery, panel count, installation cost, tax treatment or performance guarantee is generated. Technical rules, catalogue, dated prices and independent worked designs are still needed for 011B.

The normal preview remains stopped at Henry's request, and isolated verification servers are stopped after their runs. 011A changes are uncommitted for human review. Use the [walkthrough](../journal/011-solar-planner.md) when restarting the Desktop preview.

On 6 November Henry requested a restart and continuation of the workspace corrections. See the [subsequent verification record](workspace-corrections.md) for that work and the current preview state.
