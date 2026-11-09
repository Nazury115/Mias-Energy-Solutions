# Verification closure and commit review — 9 November 2026

Henry authorized diagnosis of the two previously blocked development journeys, review of the pending changes and a commit. No new backlog feature or deployment is included.

## Diagnosis and repair

The two original journeys were rerun on an isolated development database. Request acceptance succeeded in this run; the customer job journey then failed while sending a message, and the document journey failed while submitting a draft for review. Both produced `Invalid Server Actions request`. Server diagnostics showed the forwarded host was `127.0.0.1:3200` while the browser supplied `Origin: null`.

The 8 November `no-referrer` response policy caused this regression. The [Fetch Standard's Origin-header algorithm](https://fetch.spec.whatwg.org/#append-a-request-origin-header) specifies a null Origin for non-CORS form posts under that policy. The [strict-origin policy](https://w3c.github.io/webappsec-referrer-policy/#referrer-policy-strict-origin) keeps referrers limited to the site origin, with no path or query, while retaining the request origin for these same-origin posts.

Use `strict-origin` in the response header and invitation page metadata. Keep SAMEORIGIN framing and Next.js's host/origin validation. Do not add allowed origins or bypass the security check. Extend the existing journeys to assert a real Origin on native message and invitation posts, origin-only referrers for secret-bearing invitation pages, and rejection of an untrusted Origin. Also exercise native inquiry/sign-in flows and the header regressions.

## Review and verification

- Reviewed the pending workspace/document/publishing improvements, planner retirement, customer-portal changes, network-identity helper, framing/referrer headers, scoped dependency override, migrations and supporting documentation.
- All 192 unit checks pass. Drizzle's migration consistency check passes.
- The refreshed dependency audit reports zero known vulnerabilities at all reported severities.
- Scanned 85 changed/untracked candidate paths for private local credentials and private bank numbers without printing their values; no matches were found. Inspected the review brief's source text and self-contained presentation. The briefing PDF is its existing reference export; it was not regenerated during this coding task. Databases, private configuration, raw proof files and test outputs remain ignored.
- The document review/download journey passed in the first repaired run. The final fresh-browser run passed all six remaining checks: customer job/progress/messaging, native inquiry submission, native sign-in and three security-header cases. The job journey includes native message Origin/referrer assertions and rejection of an untrusted Origin. Both originally blocked journeys therefore pass across the final runs without skipping their substantive assertions.

The first repaired run passed the document review/Excel/PDF journey and all three header checks. The customer job journey reached messaging and native-form origin assertions, then failed an immediate 320 px resize measurement. A fresh inspection of the same saved job at 320/390/768 px found no persistent overflow, including after a deliberately rejected Origin. Responsive checks now wait for two animation frames before measuring and retain the strict no-overflow assertion with element diagnostics. The intentional rejected request is performed after layout checks to keep fault-injection effects separate.

Edge closed before the later native-inquiry/sign-in checks could create contexts in that run. Those checks and the customer job journey passed when rerun in a fresh browser; the passed document journey is retained as separate evidence. No persistent 320 px layout defect was found, and no overflow-hiding CSS was introduced.

The optimized webpack production build and its TypeScript check pass. Generated verification-specific type-import paths were restored to the normal preview paths. The final compiled production smoke test passes all ten route checks and the Owner/customer workflow with no browser runtime errors. It covers native message submission with JavaScript disabled, origin-only referrers, local email/SMS capture, invitations, private messaging, file access, document review/return/resubmission/issue and PDF/Excel access, project replacement/Trash/restore/publication, retired-planner behavior and access revocation. Private notes remain excluded and production simulation cookies remain inert.

The reviewed application baseline includes the pending 5–8 November changes and this repair. The existing review brief and standalone project presentation are saved separately as review materials. This verification uses synthetic isolated data; it does not send live notifications, deploy the site or certify statutory document numbering. Local databases, credentials and test outputs are excluded from both commits.
