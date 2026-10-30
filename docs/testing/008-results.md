# Increment 008 core — verification

Date: 2026-10-26. Scope: the [approved core specification](../../specs/008-requests-jobs-and-progress.md), with private uploads and shared company access deferred by Henry.

## Environment and isolation

Windows, bundled Node, Next.js 16.4.1 with webpack, Python/pytest and headless Microsoft Edge. Initial checks used Next.js 16.4.0 and `.data/verification-008/run1/pglite`; focused patched-framework checks used `run2`. The final complete run uses `http://127.0.0.1:3200`, `.next-verification` and a fresh `.data/verification-008/run3/pglite`. They do not use the normal preview's database. Browser fixtures warm the public, account and new job routes before testing. Application sources stay unchanged during browser runs.

Production verification uses a separate disposable database, port 3210, fresh runtime secrets and the same local capture transports. The production script stops its server before inspecting its captured invitation offline, closes that database connection, then restarts the server to accept the invitation. It refuses to start over an occupied port.

## Checks

| Check | Result |
| --- | --- |
| Test-first pure job rules | 40 expected failures before implementation; see [red phase](008-red-phase.md) |
| TypeScript, `tsc --noEmit --incremental false` | Passed after the final form/concurrency fix |
| Rejected draft and stale edit checks | 2 passed in 50.59 seconds; `test-results/008-edits.xml` |
| Early typing, ordinary/rate-limited contact submission, no-JavaScript form and rejected staff draft | 4 passed in 105.59 seconds; `test-results/008-form-recovery.xml` |
| Complete pytest suite | **254 passed in 817.31 seconds (13m 37s)** on the 26 October core build, Next.js 16.4.1 and fresh `run3` database; `test-results/008-full-suite.xml` |
| Webpack production build | Passed on Next.js 16.4.1, including build-time TypeScript and static page generation |
| Production route and full customer journey | Passed: eight route/status checks; Owner setup → guest request → acceptance → invitation → restart → customer setup and reply; private notes excluded, simulation cookie inert, no page or console errors |
| Normal preview resumed, 2026-10-29 | Restarted the Desktop copy on port 3000 with its existing database. `/contact` and `/job-invite` returned 200 with their expected content; signed-out `/staff/jobs` returned 307 to sign-in, which returned 200. Rechecked the saved full-suite report: 254 tests, zero failures/errors/skips. No application code changed in this follow-up. |
| Acceptance navigation follow-up, 2026-10-29 | Staff navigation to the acceptance form passed at 1366, 390 and 320px, with the action fully visible and no page overflow. TypeScript, production build, and the production customer journey/eight route checks passed again with no runtime errors. **4 targeted tests passed in 193.24 seconds**: inquiry search/detail navigation, complete guest-to-customer job journey, invitation resend/cancellation/wrong account, and no-JavaScript acceptance opening the new job at the top. See `test-results/008-acceptance-navigation.xml`. The original 254-test run predates this follow-up. |

## Coverage and findings

- Guest receipts with both channels and each single available channel; independent email/SMS failure and retry; preserved references; no duplicate successful channel.
- Staff acceptance, assigned work/next step, approved stages, dated history, public communication and separate private notes.
- New customer invitation setup, authenticated existing customer acceptance, wrong account, resend/cancellation, used link and access revocation.
- Customer isolation by direct URL and replay of a valid staff action using customer cookies. Customer HTML excludes a private sentinel. JavaScript-disabled customer messaging is exercised.
- Dirty workflow forms retain the version of the record the user edited, even when another form revalidates the page. A stale draft cannot silently adopt the current version and overwrite newer work.
- Rejected server actions retain entered non-secret text. Passwords, invitation tokens and event keys are not copied into error drafts.
- Existing public, inquiry, accounts, spam and production-only boundaries remain in the regression suite. Layout checks cover widths 320, 390, 768, 1366 and 1440 pixels; phone and desktop screenshots were visually reviewed.

Verification found and fixed lost confirmation feedback after revoking/cancelling access, lost drafts after a rejected stage change, and the stale-version risk from refreshing a dirty form. An earlier complete run had 251 passes and one timeout in the existing honeypot test; that test passed twice individually afterward. A later run had 251 passes and two contact setup timeouts (daily-contact-limit and the invalid-stage test's setup). Diagnostics showed the first controlled field empty, with no intervening navigation or console error. A controlled delayed-script test then reproduced the actual application bug: hydration erased early typing. The form now adopts values already entered into its server-rendered inputs before the first controlled re-render. The regression checks name, email, reply choice, details and a successful saved submission. Ordinary JavaScript contact helpers also wait for the mounted enhancement; the no-JavaScript test stays separate. The final complete run is reported above; earlier failed or interrupted runs are not counted as passes.

The 29 October navigation follow-up made acceptance discoverable directly from the inquiry list. Its targeted runs exposed two additional details: success-message waits must target the relevant form/message, and a plain 303 redirect can inherit the inquiry shortcut's fragment. The acceptance redirect now names the new job's `main-content` anchor explicitly; test helpers return canonical job URLs without fragments. The no-JavaScript regression verifies the new job heading is in view after submission. Read-only checks on the normal preview inspected the Staff view without accepting the user's inquiry; all workflow mutations used a separate `.data/verification-008/acceptance-ui/pglite` database.

## Framework security patch

The first production build compiled and type-checked, then Next.js's security check stopped it for the existing 16.4.0 dependency. The [official 14 October security update](https://nextjs.org/blog/nextjs-security-update-october-14-2026) identifies 16.4.1 as the patched version, including a Server Actions denial-of-service fix relevant to this application. Installed the minimal exact-version patch; the lockfile updates only Next.js, its versioned dependencies and peer references. This is dependency maintenance discovered during the increment, not a new product feature. The initial interrupted build is not counted as a successful build.

## Reproduce

Run the isolated development server from the repository root:

```powershell
$env:Path = "C:\Users\nazur\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;$env:Path"
$env:MIAS_DB_DIR = Join-Path (Get-Location) '.data/verification-008/run3/pglite'
$env:MIAS_BUILD_DIR = '.next-verification'
$env:MIAS_SITE_URL = 'http://127.0.0.1:3200'
node node_modules/next/dist/bin/next dev --webpack --hostname 127.0.0.1 --port 3200
```

In another terminal:

```powershell
$env:MIAS_TEST_URL = 'http://127.0.0.1:3200'
.\.venv\Scripts\python.exe -m pytest -q --tb=short --junitxml=test-results/008-full-suite.xml
```

After stopping that development server, build with `MIAS_BUILD_DIR=.next-verification` and `MIAS_SITE_URL=http://127.0.0.1:3210`, then run `.\.venv\Scripts\python.exe scripts/check-008-production.py`.

## Limits and review

Email/SMS are captured locally. No real provider delivery, handset receipt, purchased service or spending cap has been tested. Provider integration, launch controls, retention/backup ownership and Israel's operating-process confirmation remain launch work. Private uploads and shared company access remain the agreed follow-up slice. Automated checks do not replace Henry's review of the [local walkthrough](../journal/008-requests-jobs-and-progress.md), real-device checks or public-launch approval. No deployment was performed.
