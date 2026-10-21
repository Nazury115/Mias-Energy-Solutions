# Increment 006 — tests defined before implementation

Date: 2026-10-21. Tests: `tests/test_inquiry_units.py` (30) and `tests/test_inquiries.py` (13), 43 collected. They were run against the development server before any increment 006 application code was imported by a page.

**Result: 43 failed in 5 min 26 s, all for missing behaviour.**

| Group | Count | Failure |
| --- | --- | --- |
| Unit: phone normalisation, field rules, reference format, link counting | 30 | `src/lib/inquiry-submission.ts is not implemented` |
| Contact form markup | 1 | `KeyError: 'formToken'` (no hidden token field yet) |
| Privacy notice page, development inbox | 2 | HTTP 404 (routes don't exist) |
| Browser journeys: received, validation, failures, spam, limits, duplicates, no-JavaScript | 10 | Timeout filling or clicking fields that don't exist yet ("Email address", "Send inquiry to Mias") |

The server-side modules (`src/server/*`) were written while this run was in progress. No page imported them until the run finished, so they could not affect these results.
