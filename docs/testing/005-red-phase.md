# Increment 005 — tests defined before implementation

Date: 2026-10-21. Tests: `tests/test_coverage_units.py` (33) and `tests/test_coverage_pages.py` (16), 49 collected.

Run against the development server before any increment 005 application code existed:

| Group | Result | Reason (expected) |
| --- | --- | --- |
| Unit: provinces, coverage modes, shade levels, validation, `matchProvince` | 33 failed | `src/lib/coverage.ts is not implemented` |
| Coverage map markup | failed | no `#coverage` section |
| `?area=` prefill for valid provinces (2) | failed | area input empty |
| `?area=` rejected values (2) | passed | guard cases. The field is already empty, so these protect against regressions rather than prove new behaviour |
| Sitemap, robots | failed | HTTP 404 (routes don't exist) |
| Share previews (6 routes) | failed | `og:title` missing |
| LocalBusiness structured data | failed | no JSON-LD on the homepage |
| 404 offers main routes | failed | after tightening. The first version wrongly passed by finding header/footer links, so it now checks only inside `<main>` |
| Map keyboard/pointer selection | failed | province list option not found |

A first run reported connection errors because the dev server had stopped. It was restarted, and the results above come from the rerun, so every failure reflects missing behaviour rather than a broken setup.
