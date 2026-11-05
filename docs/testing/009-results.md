# Increment 009 verification — 4 November 2026

Chat follow-up commit 8016ed4 was saved before starting 009. The publishing rules test first failed because the module did not exist. The initial read-only route check found that the regular preview was stopped; browser verification then used the isolated port-3200 preview with its own database.

## Observed checks

- All 170 unit checks passed on the final code. These include required publication facts/permissions, real-versus-sample filtering and decoding/resizing/EXIF removal for photos.
- The targeted publishing/public-page run passed 31 of 32 checks. Its one failure was the unpublish confirmation disappearing with its form after a successful operation. A page-level confirmation fixed this. The focused rerun passed the entire project workflow, including a later approved replacement.
- Staff created and saved a testimonial. An Owner published it. Replaying the Owner's action as Staff or Customer returned 403. Direct customer draft access returned 403 and signed-out preview access redirected to sign-in.
- A draft photo was accessible only to staff. Publishing enabled its public JPEG response. Draft edits preserved the old public snapshot. A replacement showed the newly approved content. Unpublishing removed the public story, image and sitemap entry.
- Stale edits were rejected and preserved the writer's input. Desktop and phone layouts from 320 to 1440 pixels showed no horizontal overflow. Captured editor and phone images were visually inspected.
- Existing project filters, labelled fictional stories, map interactions, contact prefill, sitemap, robots and public metadata checks passed.
- TypeScript and the optimized webpack build passed. The production walkthrough used a disposable database and checked the existing portal journey plus publishing, private previews, snapshot isolation, unpublishing and launch-mode suppression of fictional pages/images/sitemap entries.
- The regular Desktop preview was started and its Staff Publishing workspace and existing job list loaded after migration. This check created no business content.

The entire site-wide browser suite was not repeated. The local test runs send no external messages. Genuine project facts, testimonial permissions and photo permissions still come from Mias before their publication.

Reproducible evidence is in the ignored test-results directory as 009-final-units.xml, 009-verification.xml and 009-snapshot-recheck.xml. Run the production journey with scripts/check-008-production.py against the isolated production build. That script now includes 009 checks.
