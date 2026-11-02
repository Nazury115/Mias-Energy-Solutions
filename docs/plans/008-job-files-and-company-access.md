# Private files and company contacts

Henry approved the [follow-up spec](../../specs/008-follow-up-job-files-and-company-access.md) on 2 November.

1. Add a file-validation test and an isolated browser journey covering uploads, downloads, membership and targeted revocation. Observe the missing behavior.
2. Store attachment bytes with metadata in the private PGlite directory. A database transaction covers the file, its slot and its submission key so a failed write rolls everything back. Listings select metadata only. Serve downloads through a protected route.
3. Retain existing individual links and pending invites. Add job-specific contact associations and an optional company label. Use the same authorization predicate for lists, detail, messages and files. Scope invitation replacement and revocation to the selected person.
4. Generate the migration with Drizzle. Run TypeScript, positive and negative browser journeys and regression checks on a separate preview and database. Verify the regular preview after applying the migration.
