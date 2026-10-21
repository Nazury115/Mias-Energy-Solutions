# Increment 003 — tests before implementation

Date: 2026-10-19. Application source remained the foundation during this check.

- Pytest collection succeeded for existing and new tests.
- All 9 new pure-function tests failed because `inquiry.ts` and `project-visibility.ts` did not yet exist. These are expected missing-feature assertions, not passed tests.
- The existing localhost website returned HTTP 200. New HTTP integration tests produced 12 failures for missing public routes/customer content and 2 passes for already-correct unknown-route 404 behavior. Browser tests were collected but not yet executed for the new UI.
- A sandboxed localhost request was denied by socket permissions; the actual HTTP tests ran with approved external access. The denied request is not a product-test failure.
- Old contact-unavailable expectations were changed to approved direct-contact behavior, and menu navigation expectations were changed from anchor navigation to actual service routes. Existing contact URL validation tests remain intact.

Next: implement the scope, then run these tests against the actual application plus the existing regression suite, type checking, build and visual review.
