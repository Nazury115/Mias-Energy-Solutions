# Local application security review, 8 November 2026

Reviewed the Desktop working copy, including the pending workspace and planner corrections, against the account, job, publishing and commercial-document requirements. Verification uses loopback servers, disposable databases and locally captured notifications.

**9 November follow-up:** the original `no-referrer` policy was found to null the Origin of legitimate form posts and break Server Actions. It is replaced by `strict-origin` in the HTTP header and invitation metadata. This removes path/query details from referrers while retaining same-origin form compatibility. SAMEORIGIN framing and the framework's origin validation stay enabled. See the [reproduction and verification closure](commit-review-2026-11-09.md).

## Findings and repairs

| Finding | Evidence and impact | Repair and regression |
| --- | --- | --- |
| Network rate limits trusted visitor-supplied forwarding headers | Source inspection found that account and inquiry actions accepted forwarding headers unconditionally. Without a sanitizing proxy, these values give an unreliable network identity. Per-contact and per-account checks are separate. | Both actions now use one server helper. Production defaults to a shared network bucket. An explicit trusted-proxy setting accepts a single valid IP from X-Real-IP. Four unit cases cover the default policy, a valid proxy address, a missing address and invalid input. |
| Cross-origin framing of account pages was unrestricted | All three new page tests failed their framing assertion before the change. The sign-in response also lacked an explicit referrer policy. Pages opened from secret-bearing links could pass their full URL in same-origin referrers. No disclosure or successful clickjacking was observed. | Responses now specify SAMEORIGIN framing and no-referrer. All three page tests passed after the change. Same-origin framing supports the local mobile preview. |

The initial production dependency audit also reported one moderate advisory in esbuild 0.18.20 through Drizzle tooling. The advisory concerns esbuild's development server. The Mias preview runs Next.js with webpack. A scoped pnpm override selects the existing patched 0.25.12 release for that dependency. The full dependency audit then reported zero known vulnerabilities, and the Drizzle migration consistency check passed. [esbuild advisory](https://github.com/advisories/GHSA-67mh-4wv8-2f99)

## Repeatable verification plan

| Risk | Expected result | Check |
| --- | --- | --- |
| Password, invitation and session policy regressions | Invalid credentials and invitation states are handled according to the account rules. Staff sessions have a maximum age. | Account unit tests |
| Untrusted network identity | Headers do not select a production network bucket unless a trusted proxy is explicitly configured. | Network identity unit tests |
| Framing or referrer exposure | Account entry pages restrict framing to the same origin and suppress referrers. | Security header HTTP tests |
| Exposure of development tools | Production returns 404 for the development inbox and mobile preview. Simulation settings have no effect. | Isolated production verifier |
| Job, file or staff-note disclosure | Signed-out visitors cannot download private files. Customers see authorized job data. Revocation removes access. | Isolated production verifier |
| Document approval or publication leaks | Customers cannot open protected drafts. Stale approvals fail. Private previews and withdrawn records stay out of public views. | Isolated production verifier |

## Operating assumptions

The final installation passed 192 unit tests, the optimized webpack build and its TypeScript check. The production verifier passed ten initial route checks and the Owner, customer and signed-out workflows listed above. It checked a 5 MiB file, authenticated downloads, private notes, frozen document settings, stale approval, revocation and launch filtering. It reported zero browser runtime errors. The three dedicated HTTP header regressions passed on the development server; the production verifier also asserted headers on two account pages and a protected redirect. The verification servers were stopped. The full site-wide development browser suite was outside this run.

The development server is loopback-only and retains simulated network identities for the browser suite. Production without a trusted proxy shares a network quota across users. Before enabling MIAS_TRUST_PROXY, verify that only the proxy can reach the origin and that it overwrites X-Real-IP on every request. Otherwise leave it disabled.

This review covers application behavior in the local environment. Sustained traffic capacity, backup recovery, and a deployed proxy, TLS and hosting configuration remain unverified.
