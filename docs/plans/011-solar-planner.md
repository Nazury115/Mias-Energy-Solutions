# Increment 011 implementation and test plan

**Superseded on 6 November 2026:** Henry removed the planner from active scope. The sequence below is historical and must not be executed as current work. Follow the [retirement and core-improvement plan](planner-retirement.md).

Date: 2026-11-05. Status: **First-slice scope approved by Henry on 2026-11-05 in [spec 011](../../specs/011-solar-planner.md).** Execute the tests-first sequence below. Equipment sizing and pricing remain outside this approved slice.

## Proposed architecture

1. Read the installed Next.js guides for forms, Server Actions and metadata before application code changes. Reuse the current checkout; leave the normal preview stopped unless Henry requests it.
2. Add a pure `src/lib/solar-planner.ts` parser/calculator and shared types. Decimal string inputs are canonical; BigInt-backed integer scaling avoids binary floating-point and premature rounding. Unknown values remain distinct from zero. Keep rule/version constants explicit; no default wattage catalogue.
3. Add `/solar-planner` with a visitor-facing composer and server-action fallbacks. Calculate/add/remove actions do not persist plans. Reuse current contact field/error patterns and adopt pre-hydration DOM values. Do not weaken the existing contact form's delayed-script regression to make planner tests pass.
4. Extend the existing inquiry-submission contract with an optional bounded planning payload. Parse and recompute it on the server, then insert the inquiry and immutable snapshot together. Continue using the existing spam/rate/idempotency and outbox path. Use one normal submission path rather than a parallel endpoint.
5. Add nullable `inquiries.solar_plan` in the Drizzle schema and generate the migration. Keep existing inquiries/data compatible; never edit generated migration SQL or snapshots.
6. Add an authorized read-only planning-summary component to staff inquiry review and to linked job pages. Select through the existing staff/job access rules; never expose an inquiry merely because its email matches the viewer.
7. Link the planner from the renewable-energy page and public navigation; include the page in route warm-up. Do not add guessed appliance specifications, brands, prices, system sizes or tax rules.

## Test-first execution after approval

| Area | Required evidence |
| --- | --- |
| Arithmetic | Three synthetic fixtures from the spec; quantities, decimal multiplication, exact Wh/kWh conversions, essentials and simultaneous-selection sums |
| Incomplete inputs | Explicit unknown watts/hours produce partial labels and assessment flags; zero operating hours remain a known value; blank fields without an unknown selection are invalid |
| Bounds | Empty/oversized lists, quantity limits and fractions, hours 0/24/over-24, watt/backup-hour bounds, long names, NaN/Infinity/exponents/negative values and oversized payloads |
| UX | Add/edit/remove preserves other rows and contact fields; row labels and pending/errors work; early typing survives hydration; no reveal-hidden newly inserted rows |
| No JavaScript | Add/remove, calculate, unknown inputs and final inquiry submission work as ordinary form posts with reduced motion |
| Saved handoff | Stored original rows, location, backup preference, calculation version and server totals agree; manipulated totals/version are ignored or rejected; no persistence from calculate alone |
| Failures and retries | Storage/notification errors preserve inputs and use existing honest wording; repeated submissions create one inquiry and the expected separate receipt events |
| Access | Staff can review the snapshot; explicit customer grant permits only the linked job; stranger, signed-out and revoked-contact reads fail; private staff sentinels remain absent |
| Compatibility | Existing inquiry spam/rate handling and delayed-script checks, account/job permissions, document access and issued snapshots retain their behavior |
| Layout and build | No page overflow at 320, 390, 768 and 1440 pixels; keyboard/reduced-motion checks; TypeScript, production build and isolated production journey |

Write and run the new calculator tests against the missing module first, recording expected failures. Then add behavior journeys before UI/server implementation. Keep pure tests focused on actual exported functions and browser tests on the observable contract. New routes join `WARM_UP_PATHS` before browser execution. Do not edit `src/` while browser tests run.

## Verification and review

Implementation detail: the planner uses one form for appliances, calculate/add/remove intents and contact details. The public planner action preserves values and delegates final intake to the existing `sendInquiry` action. `submitInquiry` independently validates/recalculates the bounded JSON payload and persists it with the request. A replay returns the original saved snapshot rather than presenting changed client inputs as a new saved plan. This avoids duplicating the inquiry security/outbox pipeline or truncating structured inputs into the ordinary message field.

Use separate `MIAS_DB_DIR`, `MIAS_BUILD_DIR` and `MIAS_SITE_URL` values; never open a second process on the normal preview database. Verify migration compatibility, request payload retention and actual saved rows without modifying Henry's test jobs. Record commands, results, limitations and screenshots in `docs/testing/011-results.md` only after execution; do not pre-create a passing result.

After the first slice passes, update README, CHANGELOG and backlog with the exact implemented boundary and a short walkthrough. Human review and approval of the later engineering/catalogue/pricing slice remain separate from software arithmetic tests.
