# Planner retirement verification — 6 November 2026

Henry explicitly removed the solar planner from active scope and prioritized improvements to the existing platform. See the [scope change and test plan](../plans/planner-retirement.md).

The initial read-only regression run found GET and POST `/solar-planner` returning 200 and the planner linked from navigation. Those three checks failed as expected before removal. An earlier attempt could not reach the stopped preview; it was restarted before the actual red-phase run.

The change removes the page, action, calculator and new intake processing. Retained code only formats historical saved request details and uses existing Staff/customer job authorization. No database records or generated migrations were removed.

Final production verification passed.

The optimized production build and its TypeScript check pass. The build contains no `/solar-planner` page. Development and production verification output use `.next-verification`, with disposable databases separate from the normal preview; generated import paths are restored afterward.

Initial green checks: all three HTTP/navigation retirement checks pass; TypeScript passes after regenerating obsolete route types; 188 remaining unit checks pass, including six read-only historical unit-format checks. The old calculator tests were removed with the retired calculator.

The first combined run passed six checks but found the assessment retry failing. A synthetic reproduction showed the reply choice changing from Email to WhatsApp after validation, then returning “Add your phone number, or choose email.” An independent ordinary-inquiry regression failed on the retained Email choice. The form now cancels React's native post-action reset so retry choices remain intact. The final combined run passed all eight checks: retired GET/POST, removed entry points, normal assessment inquiry with rejected stale payload and successful retry, ordinary validation/retry, normal local notification capture, delayed hydration and JavaScript-disabled inquiry submission.

Read-only normal-preview verification passed five Owner pages at 320/390/768/1440 px with zero runtime errors and no smooth-scroll warning. Checked that project/document registers precede creation forms, that their new-record shortcuts work, and that navigation no longer offers the planner. Inspected a 390 px Publishing capture: saved records and preview/edit/publication/delete actions are visible above the creation form. No existing record was edited, submitted or published by this check.

The final production runner passed ten route/status checks and the complete ordinary Contact → acceptance → invitation → customer job journey. It rejected stale planner form data, saved a normal request with `solar_plan: null`, then seeded a synthetic historical snapshot while its disposable database was closed. Staff and the invited customer could read its original details, while revoked access returned 404. It also passed conversation/read receipts, a 5 MiB file transfer, Owner document submission/preview/return/issue, PDF/Excel downloads, project publication/replacement/Trash/unpublished restore and launch filtering. The runner reported `runtime_errors: []`.

Final standalone TypeScript and Git whitespace checks pass. The full site-wide browser suite was not rerun. The two initial failures were recorded and corrected rather than skipped: the retirement expectations before removal, and the independently reproduced reply-radio reset.

Verification servers are stopped. The normal local preview remains at <http://127.0.0.1:3000>. No real email/SMS was sent; all test mutations used isolated databases. Existing normal-preview request/job/document/content records and generated migrations were preserved. These changes remain uncommitted for Henry's review.
