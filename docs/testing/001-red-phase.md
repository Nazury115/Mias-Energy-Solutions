# Increment 001 — initial test validation

Date: 2026-10-12. Recorded before website feature implementation.

- `python -m pytest --collect-only -q`: 35 tests collected successfully, no syntax or import errors.
- `python -m pytest -m unit -q --tb=short`: 13 expected failures, 22 deselected. Each failure asserted that the actual `src/lib/contact-links.ts` application module did not yet exist. No feature code had been written.
- The unit bridge imports the actual application module. It contains no replacement implementation.
- HTTP/browser scenarios were collected, but not executed before a Next.js server existed. Connection failures would demonstrate missing infrastructure rather than a meaningful behavioral red test.

Outcome: test definitions and collection validated; expected missing-feature unit failures confirmed. Implementation may now proceed within the approved scope. This is not a claim that tests passed.
