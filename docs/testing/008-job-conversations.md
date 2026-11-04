# Job conversation verification

The signed-out route check initially failed with 404 before the endpoint existed. In the first browser run the legitimate receipt POST returned 403. Comparing the request origin with the configured portal address fixed that failure while keeping the foreign-origin check.

- All 160 unit tests passed. All four targeted portal checks passed together on the isolated development preview. They cover earlier messages, staff/customer live replies, two contacts' independent first-view receipts, preserving the first timestamp, rejection of self-reads and foreign origins, and revocation for reads and writes.
- The visibility tests left a message unread while its bubble was outside the scroll pane or the tab lacked focus. New replies preserved an earlier reading position and the unsent draft. A retry after dropping the acknowledgement for a successfully saved message produced exactly one row.
- The existing guest-to-job regression also checked plain HTML replies, exclusion of private notes and page width from 320 to 1440 pixels. The entire site-wide browser suite was not repeated.
- TypeScript and the optimized webpack build passed. The production journey exercised customer replies, staff first-view receipts and private file downloads with a disposable database. The existing Desktop job was opened separately with JavaScript disabled to verify its saved thread without writing a read receipt.
