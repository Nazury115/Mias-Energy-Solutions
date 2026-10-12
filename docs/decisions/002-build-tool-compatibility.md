# ADR 002 — built-in webpack compatibility path

Status: Implemented within the approved Next.js architecture, 2026-10-12.

## Context

On this Windows host, Next.js 16.4.0's default Turbopack build failed while creating the PostCSS worker for `globals.css`. The child Node process exited before the compiler connected to it. The same error occurred outside the sandbox, so changing file permissions alone did not resolve it. The deeper cause is unconfirmed.

## Options

1. Continue investigating Turbopack before any browser review.
2. Use Next.js's built-in `--webpack` development/build option and revisit Turbopack later.

## Decision and evidence

Use `--webpack` for `dev` and `build`. The webpack production build compiled successfully, completed TypeScript checks and prerendered the homepage/404 routes. This is a tool compatibility choice within Next.js, not a framework or hosting change; no additional dependency or service is introduced.

## Trade-offs and consequences

Build speed may differ; no performance improvement is claimed. The commands are reproducible in `package.json`. Re-evaluate the default compiler after framework/runtime updates using the existing tests before removing the flag.
