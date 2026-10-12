# ADR 001 — website foundation and content

Status: Approved by developer, 2026-10-12.

## Context

Mias needs a responsive business website with reusable service pages and a later secure inquiry flow. The developer prefers Next.js, TypeScript and Tailwind CSS and must understand the architecture.

## Options

1. Plain HTML/CSS/JavaScript: minimal setup; shared pages and future form processing require additional structure.
2. Next.js App Router, TypeScript and Tailwind CSS: more tooling; coherent routing, components, server rendering and future server-side validation.

For content, structured local files are simpler than a CMS while a developer maintains updates. A CMS introduces an additional service and maintenance surface without a confirmed editing requirement.

## Decision and reasoning

Use the explicitly approved Next.js, TypeScript and Tailwind CSS stack, with typed local content and no database. Render content on the server by default and use client JavaScript only where an interaction needs state. Use the standard Next.js runtime; hosting remains undecided.

## Trade-offs and consequences

Framework dependencies and Node tooling need updates. Content changes require a repository edit and rebuild. We gain reusable pages and a direct path to future validated submissions without adding a backend in another language. Pytest remains test infrastructure only. No CMS, database, analytics or delivery provider is introduced in this increment.
