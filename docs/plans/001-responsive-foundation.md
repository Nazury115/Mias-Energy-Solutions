# Increment 001 — implementation and test plan

## Approved decisions

The developer approved Next.js, TypeScript, Tailwind CSS, structured local content, and no database on 2026-10-12. Work remains a local website preview; no hosting account, paid service, public deployment, or data store is being created.

## Implementation sequence

1. Record baseline approval and the first increment's acceptance criteria.
2. Write pytest tests and a minimal test harness; verify collection and the expected missing-feature failures before writing feature code.
3. Add the Next.js App Router foundation, TypeScript configuration, Tailwind PostCSS setup, and pinned dependency lockfile.
4. Add structured content and the contact-link function; rerun the unit tests against the actual TypeScript module using Node's native type stripping.
5. Implement the homepage as server-rendered sections. Use a small client component only for mobile navigation state.
6. Add scoped responsive styling and a local original infrastructure SVG. Avoid external images, fonts, animations, and icon libraries in this increment.
7. Run the HTTP integration tests against the real Next.js preview, followed by browser tests at all specified viewport widths, type checking, and a production build.
8. Inspect the rendered laptop and phone layouts, correct observed issues, and write an increment report and setup guide.

## Structure

The project root contains the Next.js application and retains the existing specification and historical plan. `src/app` holds routes and global styles; `src/components` holds reusable sections/navigation; `src/content` holds business data; `src/lib` holds contact-link logic; `public` holds local artwork; `tests` holds pytest checks; `docs/decisions` holds short ADRs.

## Test plan

| Layer | Method | Coverage |
| --- | --- | --- |
| Unit | Pytest invokes the real pure TypeScript contact module through a small Node subprocess bridge. | Missing/invalid destinations, valid `tel`, WhatsApp and email links, encoded service context. |
| HTTP integration | Pytest uses Python's standard-library HTTP client and HTML parser against the actual running website. | Identity, service content, sections/anchors, metadata, unknown contact handling, 404. |
| Browser integration | Pytest with Playwright drives the installed Chromium-based Edge browser against the actual preview, using a clean test profile. Playwright is a test-only dependency needed to verify responsive layout and menu interaction. | Five viewport widths, mobile menu selection/Escape, keyboard skip link, contact navigation, client errors. |
| Static/build | TypeScript and Next.js production build. | Type errors, invalid imports, route generation, CSS/build integration. |
| Manual | Inspect laptop and phone rendering; document remaining checks. | Visual hierarchy, legibility, focus, 200% zoom and physical-device follow-up where tooling permits. |

No Python application backend is introduced. The test harness does not reproduce TypeScript business logic. The initial red run must distinguish expected missing-feature assertions from test syntax or dependency errors. Browser tests run after a real preview is available and are not claimed to have passed during the red phase.

## Dependencies and alternatives

- Next.js and React supply routing, server rendering and reusable components, and support a later server-validated form. Plain HTML would reduce initial setup but adds migration work as reusable service pages and inquiry handling grow. Approved choice: Next.js.
- TypeScript checks content and component contracts before runtime. It adds a compiler step but fits the course and maintainability requirements.
- Tailwind CSS supplies the approved styling foundation; project CSS defines the visual tokens and reusable component styles. No component framework is needed.
- Local structured content has no CMS subscription or administration surface. A nontechnical editor would justify re-evaluating a CMS later.
- Pytest is explicitly requested. Playwright supplies actual layout and browser interactions that HTTP assertions alone cannot verify. No browser automation code ships to customers.

## Design direction and risks

Use warm neutral surfaces, dark green, restrained orange accents, large readable headings, and a technical water/solar illustration. Keep service descriptions factual. Missing business contact details block real inquiry actions; the preview states that honestly. No project photographs or credentials are invented to fill space.

Official setup references consulted: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation) and [Tailwind CSS for Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs). Dependencies are resolved through their package registries and recorded in lockfiles.
