# Increment 009 implementation and tests

1. Write rules and browser journeys before implementation. Capture expected missing-route/rule failures.
2. Add publication rows with a typed draft, independently stored published snapshot, immutable sample classification and optimistic version. Add private image bytes with provenance and an audit history. Generate the migration with Drizzle.
3. Reuse session gates, server actions, workspace styles, coverage rules and the image decoder. New uploads use Sharp to rotate, resize and strip metadata. Private preview and public media routes check their respective access on each request.
4. Extend src/content/projects.ts as the public assembly point. Public detail and sitemap become request-time reads so publish/unpublish works without a rebuild. Preserve existing repository samples and approved data.
5. Build list/editor/preview in /staff/content. Owner publication uses the displayed version, a reason and explicit fact/permission confirmation. Keep public snapshots unchanged by draft saves.
6. Verify isolated browser journeys, existing public site regressions, unit checks and production build. Restart the normal preview to apply its generated migration and verify the workspace.
