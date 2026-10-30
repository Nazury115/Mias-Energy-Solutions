# Increment 008 — red phase

Date: 2026-10-26. Written after Henry approved the core scope and before implementation.

`python -m pytest tests/test_job_units.py -q --tb=short`: **40 expected failures**, each because `src/lib/jobs.ts` did not exist. These exercise real TypeScript through the existing bridge, not a Python copy of the rules.

`tests/test_jobs.py` was also written before implementation: both/single-channel receipts, independent SMS retry, guest conversion, invitation and private customer job, public updates/private-note isolation, customer reply, wrong-customer direct access, existing-account acceptance/revocation, stale-edit rejection and signed-out route gates. The corresponding job pages, actions and notification channels did not yet exist.

During verification, added `test_details_entered_before_hydration_are_retained` before fixing the public form. It holds JavaScript requests, fills the server-rendered form, releases the scripts, then checks the entered values and submission. The valid red run failed in 9.88 seconds because `Your name` became empty instead of `Early Visitor` (`test-results/008-early-input-red.xml`). This reproduced the input loss directly instead of treating the intermittent contact setup timeouts as a test-only issue.
