# Local follow-up verification, 2 November 2026

Henry tested the local workflow from both the staff and customer portals and confirmed that it worked well.

Test data was fictional. The browser suite used port 3200, a separate Next build directory and a separate database. The initial file test failed because the validator did not exist.

| Check | Observed result |
| --- | --- |
| TypeScript and unit suite | TypeScript passed. 160 unit tests passed, including format validation, migration from the previous release and write rollback. |
| Follow-up suite | All five checks passed. Three are Edge journeys and two exercise the file rules and migration. |
| Invites and file access | Two contacts accepted separate invitations. Resending to the first contact invalidated only their old link. Both could download identical file bytes. Revocation blocked one person's direct download while the other retained access. Staff removal blocked subsequent downloads. |
| Job boundaries | Two contacts at the same fictional company initially saw only their explicitly assigned jobs. A second invitation gave one person both jobs. |
| File limits | Valid JPEG, PNG and PDF accepted. Empty, disguised, truncated, unsafe-name and oversized examples rejected. Concurrent replay stored one file. Two distinct uploads competing for the twentieth slot yielded one success. Closing the job preserved downloads and closed uploads. |
| Production build and journey | Webpack production build passed. Eight route checks passed. A customer uploaded a valid PNG of exactly 5 MiB through the form. Staff downloaded identical bytes, a signed-out download was denied, and the customer page excluded the private staff note. The production journey recorded no runtime errors. |
| Existing portal regressions | All 13 existing job tests passed across runs. An Edge context stalled during teardown in the first run. A later run found intermittent concatenation in the staff draft test. The test now waits for arrival on the job page and checks the replacement text before and after the rejected save. The focused rerun passed. |

Generated reports are in the ignored test-results directory under the names 008-follow-up-units, 008-files-follow-up, 008-files-targeted, 008-follow-up-regressions and 008-follow-up-edit (XML). Read the rerun reports together with the interrupted run. The entire site-wide browser suite was not rerun for this slice.

Before using real customer files, Mias still needs its retention and deletion policy, backup and restore checks, file scanning and operating-process review with Israel. Email and SMS use local capture.
