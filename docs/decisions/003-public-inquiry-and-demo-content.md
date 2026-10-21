# ADR 003 — public inquiry handoff and demo stories

Status: Implemented within the public increment authorized on 2026-10-19.

## Context

Henry approved the richer public site, confirmed Israel's WhatsApp, and asked for three invented examples to explore the project-story presentation. Backend providers and private portal storage remain undecided.

## Options

- Direct contact links only: simplest, but provide little structure for a customer describing a service need.
- Browser-only inquiry composer with an explicit WhatsApp handoff: useful context without new infrastructure, but not a stored/delivered website request.
- Backend form plus persistence/notification service: supports tracked receipt but introduces architecture, privacy and cost decisions not yet approved.

For stories, leave the gallery empty or add visibly fictional preview examples. Henry requested examples, so use the second option without creating fake customer endorsements.

## Decision and reasoning

Use the existing confirmed contact helper and a pure validation/message function. The form prepares text locally, then exposes an explicit link to WhatsApp. No success/delivery claim, server request, localStorage or account is involved. The submit button is disabled until the interactive composer is ready; no-JavaScript visitors retain direct contacts.

Keep fictional story records labelled at every entry point and suppress them when preparing a public-launch build. Actual customer names appear separately. Service-specific query parameters use a fixed allowlist and fall back to a general inquiry.

## Trade-offs and consequences

WhatsApp/device availability and the final send action remain outside this website's control. Mias receives nothing merely because a visitor prepares or opens a message. The production MVP still needs a tested backend inquiry flow if that remains a launch requirement.

Content edits still require repository changes. Staff publishing needs its own secure draft/publish workflow later. Preview photographs and customer names still need launch permissions. Demo records cannot supply real project metrics or testimonials.
