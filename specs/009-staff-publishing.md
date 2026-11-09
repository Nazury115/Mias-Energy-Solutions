# Increment 009 — staff publishing

Henry requested implementation on 4 November 2026 after reviewing the proposed scope and Staff drafts / Owner approval rule.

## Staff workflow

- Staff and Owners create project or testimonial drafts, save edits and open a protected preview. Every page and action checks active staff access. Customers cannot access drafts, preview photos or publishing actions.
- Project drafts include title, summary, service family, province, optional area/year, challenge, work and outcome. Staff can select existing work photographs or upload JPEG/PNG copies up to 5 MiB each, at most eight per entry. Each image needs descriptive alternative text, source and permission evidence before real publication. Originals and private job files stay separate.
- Testimonials include the supplied quotation and approved attribution. Record permission evidence for the text and attribution before real publication.
- Records created as fictional test content retain that classification for their lifetime, stay labelled in preview and disappear when MIAS_PUBLIC_LAUNCH is true. The editor never converts a sample into a real claim.

## Owner review

- Only an Owner publishes, replaces the published version or unpublishes. Publication requires a private approval reason and confirmation that the facts, attribution and image permissions were checked. Show the exact saved draft in preview before approval.
- Published content is a snapshot. Editing a draft leaves the previous public snapshot intact until explicitly approved. Version checks reject stale saves and publication actions. Record actor, time and reason with each publication change.
- Staff can see review history. A stale action must preserve its draft and clearly ask for reload.

## Public behavior

- Approved project records appear on Projects and their detail URLs. The map counts approved projects by province using the existing coverage logic. Src/content/projects.ts remains the public content assembly point.
- Hide sample projects when real projects are present and hide all samples in launch mode. Existing repository stories, photo captions and confirmed totals remain supported.
- Approved testimonials appear with attribution on Projects. Drafts and internal permission evidence remain absent from public HTML, images and sitemap.
- Uploaded images are re-encoded, resized and stripped of metadata. Store them privately and serve only images referenced by a current published snapshot. Unpublishing stops future image access. Staff preview images require authentication.
- Register managed images in the private publishing inventory, documented in docs/content/image-sources.md. This extends the repository photo inventory for runtime uploads without adding private permission evidence to Git.

## Verification

Use fictional entries in an isolated database. Verify Staff draft → private preview → Owner publish → public project/testimonial → draft edit → replacement → unpublish. Check customer and signed-out access directly, stale versions, failed saves, required permissions, upload restrictions, image removal from the public version and map/sitemap changes. Run the production build and inspect desktop and phone layouts.

## Project-management correction — 5 November 2026

Henry requested visible preview/edit/publish/delete controls and access to projects already on the website. The workspace must list repository project stories alongside database-managed entries, clearly identifying their origin, status and fictional classification. Staff may open a repository story as a managed draft; this copies its supported fields and illustrative-photo metadata without publishing changes. Keep its public slug stable and show one public version at a time. Draft edits leave the existing public version intact until Owner publication.

Only an Owner can publish, unpublish or delete. Delete means move to Trash with a reason and confirmation, remove the public snapshot and block public media, while retaining records/photos/audit history. Owner restore returns an entry to drafts and never republishes automatically. Deleting/unpublishing a managed repository story suppresses the repository fallback so it cannot reappear. Classification and photo provenance remain intact; original source photos/files are never deleted. Version checks protect edits, publication, trash and restore. Native database projects and testimonials retain their existing workflow.

The register exposes direct preview/edit/Owner-publish/delete links, plus Trash and restore. The public Projects page offers an authenticated Staff/Owner management link. Customer and guest requests cannot access management, previews, deleted entries or mutation actions. Mobile layouts must preserve these controls at 320–1440 pixels.

The 6 November core-usability pass places existing projects/testimonials before the creation form and supplies a direct new-content shortcut. Preserve the existing labels, role restrictions and publication behavior.
