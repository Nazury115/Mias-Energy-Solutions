# Increment 011 — solar planner

Date: 2026-11-05. Current status: **Retired from active scope by Henry on 2026-11-06; suggestion only.** Henry requested removal of the solar planner and a focus on improving the existing platform. The earlier 011A approval is superseded. This document preserves the historical specification, not authorization to restore or extend it. See the [retirement plan](../docs/plans/planner-retirement.md) and [deferred idea](../docs/ideas/solar-planner.md).

Builds on [spec 002, SOL-01–07](002-business-platform-expansion.md#8-solar-planning-tool), the existing inquiry pipeline (006), accounts (007) and explicit job access (008). Increment 010 is committed as `c055dc6`; its commercial follow-ups remain separate.

## Approved first slice: load summary and quotation handoff

A visitor describes the appliances they want to run, sees an explainable summary of the values they supplied, then explicitly sends those inputs to Mias with an inquiry. No account is required. Staff receive the saved planning details with the inquiry; once the inquiry becomes a job, linked customers can see the same original summary.

This first slice does **not** select an inverter, battery, panel count or complete system, estimate installation prices, or promise backup performance. Those remain part of 011's subsequent equipment/pricing slice, subject to Mias-approved technical rules, catalogue and pricing. Henry explicitly approved this first-slice boundary under spec 002; it does not remove the larger planner from the roadmap.

## Visitor journey

1. Open `/solar-planner` from the renewable-energy service page and public navigation.
2. Add appliance rows. Enter a name, quantity, watts and expected operating hours per day. Mark essential loads and the group the visitor expects to use together. Rows can be edited or removed without an account.
3. Supply an area/province and optional desired backup duration. These are assessment inputs; this slice does not turn duration into a battery recommendation.
4. Calculate a load summary. Show each line's calculation, connected power, selected running power, daily energy and essential-load energy with units. Identify missing values and technical-assessment flags.
5. Select **Request a solar quotation / assessment**. Review the summary, provide the existing contact/reply details, and explicitly submit it. Editing inputs recalculates the submitted result on the server.
6. Show the existing saved-request reference and honest notification status only after the request and planning snapshot are saved together. Local email/SMS capture behavior remains unchanged.

No values or contact details are placed in a URL, browser local storage, analytics event or public share link. Calculating alone does not save a plan to the database. Leaving/reloading an unsent page may lose its inputs; no automatic saving is implied.

## Approved input contract

| Field | Rule |
| --- | --- |
| Appliance list | 1–40 rows; no prefilled appliance wattages or usage assumptions |
| Name | Required, trimmed, 1–80 characters; rendered as plain text |
| Quantity | Required integer 1–100; starts at 1, remains editable |
| Load category | Lighting/electronics, refrigeration/compressor, motor/pump, heating, other/unsure; no category selected automatically |
| Watts per item | Positive decimal, at most 100,000 W and 2 decimal places; or an explicit **Not sure** value |
| Operating hours per day | Decimal from 0 through 24 inclusive, at most 2 decimal places; or explicit **Not sure** |
| Essential | Visitor-selected boolean, initially unchecked |
| Expected to run together | Visitor-selected boolean for one scenario, initially unchecked; includes the full quantity on that row |
| Area/province | Existing bounded area input, at most 120 characters; no GPS lookup |
| Desired backup hours | Optional decimal 0–168 hours, at most 2 decimal places; preference only |

Bounds limit the form and stored payload; they are not a statement that a household or equipment system supports those loads. Blank numeric fields produce a field error unless the visitor explicitly marks the value unknown. No starter ratings, duty cycles, surge multipliers, losses, solar resource figures or prices are invented.

## Calculations and honest labels

- Line connected power in W = quantity × supplied watts per item.
- Line daily energy in Wh = line connected power × supplied operating hours per day. Hours mean the operating time represented by the supplied watts; no cycling or standby behavior is inferred.
- Connected power = sum of known line power. This is the sum of listed ratings, not an inverter recommendation or measured peak demand.
- Selected running power = sum of known power for visitor-selected simultaneous rows. Clearly state that the visitor chose this scenario and that starting surge is excluded. An empty selection says **No simultaneous-use scenario selected**.
- Daily energy = sum of lines with known watts and hours. Essential daily energy applies the same calculation to essential rows. Show **Known portion only** and the missing row count whenever relevant values are unknown; never present a partial sum as a complete household total.
- Convert W to kW and Wh to kWh by dividing by 1,000. Keep the original units visible next to the converted values.
- Use exact decimal arithmetic, retaining up to four decimal places for Wh and seven for kWh as required by the inputs. Do not round intermediate products or sum rounded display values. Strip unnecessary trailing zeros; reject NaN, Infinity, exponent notation and negative values.
- Motors/pumps, refrigeration/compressors, other/unsure categories or unknown numeric values show **Technical assessment required** with the relevant reasons. Ordinary known loads still require Mias to confirm any future system design.

Visible result wording: **Load summary from your inputs. Mias must assess site conditions and confirm suitable equipment. Starting surges, system losses and solar production have not been calculated.** Do not label the result a complete system estimate or show a zero price for missing equipment data.

### Synthetic arithmetic fixtures

These are software checks, not appliance defaults, customer examples or Mias-approved system designs.

| Case | Inputs | Expected results |
| --- | --- | --- |
| Mixed known loads | 4 × 10 W × 4 h; 1 × 12 W × 24 h. Only the second row is essential; only the first is selected to run together. | Connected 52 W; selected running 40 W; daily 448 Wh / 0.448 kWh; essential 288 Wh |
| Decimal inputs | 2 × 12.5 W × 1.5 h; 3 × 2.25 W × 0.5 h | Connected 31.75 W; daily 40.875 Wh / 0.040875 kWh |
| Incomplete motor case | 1 × 800 W pump with unknown hours; 4 × 10 W × 4 h lights | Known connected 840 W; known daily portion 160 Wh, explicitly incomplete; assessment required; no sizing recommendation |

These fixtures do not satisfy the later requirement for three independently approved engineering/system-sizing examples.

## Saved inquiry and access contract

- Add a nullable private `solar_plan` JSON snapshot to inquiries through a generated Drizzle migration. Existing inquiries remain unchanged. No separate public plan registry is introduced.
- Store validated inputs, the server-owned calculation version (`load-summary-v1`), canonical server results, unknown-value markers and assessment reasons. Catalogue/pricing versions are absent because they are not used in this slice. A client-supplied total or version never becomes authoritative.
- On final submission, validate and recalculate on the server before saving the inquiry and snapshot in one transaction. A changed/invalid payload preserves the form and displays errors. No success may be shown after a failed save.
- Reuse the existing form token, minimum-fill/honeypot checks, contact/network rate limits, idempotency key and separate notification rows. Repeated submission cannot create multiple inquiries or receipts. Do not add a second less-protected submission endpoint.
- Allow at most 32 KiB for the structured planning payload before parsing, with the field and row bounds above. Ordinary inquiry messages keep their existing limit; the planning data is not crammed into or silently truncated to that message field.
- Staff inquiry review shows the original inputs and calculation version. Business-notification text may include a bounded summary and the existing reference, not a public plan/access URL. Guest receipts stay generic.
- Once accepted into a job, staff and explicitly linked customers can read the original planning snapshot through the existing shared job-access check. Revoked contacts and unrelated customers cannot read it by changing a URL. Matching an email alone never grants access.
- Staff notes and permission evidence are not part of the snapshot. Preserve the original saved inputs/version; correcting an assessment or issuing a quotation does not overwrite this historical request.

## Interface, accessibility and failure behavior

- Keep the current site styling. Rows have explicit labels, accessible add/remove buttons, unit hints, field errors and pending states. Re-rendering rows must not use reveal effects that leave them hidden.
- Support calculation, adding/removing rows and final inquiry submission with JavaScript disabled through server form actions. With JavaScript, live calculations are a convenience; final results are still recomputed on the server.
- Preserve text entered before hydration and after validation, storage or notification errors. Do not reset a visitor's rows while another row changes.
- Any displayed preview is clearly associated with its inputs; edits update it or mark it as needing recalculation. Never imply an older result matches changed fields.
- No horizontal page overflow from 320 to 1440 pixels. Honor reduced motion, keyboard access, focus/error summaries and readable mobile results.
- Preview pages remain noindex. No public launch, paid service, external notification transport, appliance catalogue, electrical safety certification or compliance claim is authorized by this slice.

## Acceptance and later-slice gate

011A is complete only when the synthetic arithmetic fixtures, boundary/unknown cases, tampered-payload checks, faithful saved handoff, duplicate/failure handling, staff/customer access and revocation checks pass. Include no-JavaScript and delayed-hydration journeys, mobile layouts, TypeScript and a production-mode journey on isolated storage. The existing contact/job/document regressions must remain valid.

Before equipment or cost recommendations (011B), obtain a named technical reviewer, versioned sizing rules including surge and losses, supported products, an approved dated price list with inclusions/expiry rules, and at least three independent worked designs with expected results. Henry approves that specification separately. Nothing in this draft invents those missing business/engineering inputs.

## Approval record

Henry approved the first slice, proposed input bounds, unknown-value handling and saved inquiry/job visibility on 2026-11-05. Implementation follows the test-first plan. The 011B engineering/catalogue/pricing gate remains pending.
