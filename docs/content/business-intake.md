# Mias business/content intake

Created: **2026-10-19**  
Use: Fill in known facts progressively. Write `TODO: Confirm with business owner` for unknowns. Do not include passwords, API keys or unnecessary customer personal information.

## Start here: the next public website increment

1. **Three project records:** connect selected image filenames to what Mias actually did, the customer problem and a verified outcome. Use the template below. An anonymized client is acceptable when approved.
2. **Selected customers:** exact display names; direct customer versus subcontract work; permission to name them; permission/logo files if a logo is intended. The list can remain partial.
3. **Israel's profile:** an approved portrait, a short factual introduction and any credentials you want to mention with evidence. Name is confirmed as Israel Masauso, Director and CEO. Public email and phone are approved.
4. **Service descriptions:** for each family, list typical work, customers, exclusions and the main services you want to promote first. Irrigation, upgrades and breakdown call-outs are now confirmed; details still matter.
5. **Operating details:** which days are 09:00–17:00 hours applicable, are these Zambia local time, and how are holidays handled? Israel's number is now the approved WhatsApp destination, and Israel handles business inquiries.
6. **Brand/location:** existing logo files and preferred colours, a business address if it should be public, the desired domain if known, and the real company mailbox once created. A service-area-only contact page is possible if no address is approved.

The supplied photos contain no written reviews or client list. Please supply those separately when ready; do not manufacture reviews to complete the page.

### Latest confirmed inputs — 2026-10-19

Henry supplied these customer names for the local preview: **Lusaka Water and Sewerage Company**, **Plumbfix**, and **Family Legacy**. The list is partial; project associations, relationship details, logo permissions and publication permissions remain to be recorded. None is attributed to the three fictional example stories.

The supplied blue/yellow logo is preserved in `docs/assets/mias-original-logo.png`; a refined concept is in the website for review. Israel's public phone and approved WhatsApp are **+260 977 747 285**, and his public email is **imasauso@gmail.com**. His portrait and the future company mailbox are still outstanding. Henry's personal contacts remain internal.

## Project record template

Copy once per project. Not every optional technical detail is needed to publish a useful story.

```text
Internal project label:
Proposed public project title:
Photo filenames belonging to this project:
Client name OR approved anonymous description:
Customer sector:
Public location (city/region; omit exact site if private):
Approximate completion date, if known:
Service family and specific service:
Problem the customer had:
Exactly what Mias supplied / installed / repaired / maintained:
Mias's role (direct contractor / subcontractor / other):
Current completion status:
Stage shown in each selected photo:
Verified outcome (plain language is fine; no guessed metrics):
Equipment/capacity details, only if useful and confirmed:
Photo ownership and permission to publish:
Permission to show premises and identifiable people:
Permission to publish client name:
Permission to use client logo and logo file:
Who approved the public story and when:
Optional testimonial: exact words, speaker name/role, approval:
Anything that must remain private:
```

## Customer list template

| Customer's approved display name | Work/project reference | Mias's relationship | May name publicly? | May use logo? | Approval source/date |
| --- | --- | --- | --- | --- | --- |
| TODO: Confirm with business owner | TODO | TODO | Pending | Pending | TODO |

Customer logos communicate a business relationship. Product labels visible in photos are not a substitute for this list. Do not call customers “partners” unless that description is accurate and approved.

## Before specifying the private portal in implementation detail

- Who will use it at Mias: owner, dispatcher, technicians, commercial/finance staff? Which people can see all jobs, change progress, see prices, issue documents and grant staff access?
- Do customers create accounts themselves or receive invitations? Do company customers need multiple employees to see the same organization's jobs?
- What happens today from first call to assessment, quotation, scheduling, work, completion and invoicing? Supply your real status labels and who changes each one.
- Which updates should customers see, and which notes are internal? Are notifications in-site only initially, or is email required? WhatsApp messaging automation is a separate service decision from a click-to-WhatsApp link.
- Should existing jobs be imported? Supply a sanitized sample record and explain how customer identity/ownership can be checked. Photos alone do not establish job history.
- Roughly how many staff, customer accounts, jobs and uploads are expected initially? Who should retain, correct, export and delete records, and for how long?
- What monthly operating budget is acceptable for hosting, authentication, database, private media, backups and notifications? Which person owns those service accounts?

## Before quotations and invoices

Provide sanitized examples of one quotation and one invoice, with confidential customer/payment details removed as needed. Explain:

- Required business identity/tax fields, currency, document numbering and who approves issue.
- Line-item units, labour/transport treatment, tax/discount rules, rounding and totals.
- Quote expiry, acceptance/changes, deposits, payment terms, invoice corrections and how payment status is recorded.
- Whether documents need downloadable PDFs, email delivery or both.

No banking credentials or tax rates will be guessed. The first scope is document management, not payment processing or a replacement accounting package.

## Before solar equipment and price recommendations

- Who at Mias approves the engineering model and sample answers?
- Are we initially covering household backup, full off-grid supply, grid-connected PV, or a specific subset? Which appliances/load types need manual assessment?
- Which inverters, batteries and panels does Mias actually supply/support? Provide specifications and approved compatible combinations.
- Which appliance defaults and surge/concurrency assumptions are acceptable? How should backup duration, losses, battery usable capacity and location/site conditions be handled?
- Provide dated prices and clarify whether tax, labour, transport, cabling/protection equipment and site work are included. Define how often prices are reviewed and when estimates become stale.
- Supply three worked household examples: loads, usage, backup needs, expected recommended configuration, expected cost range and reasoning.

Until these inputs are approved, we can specify a load-summary tool but cannot responsibly invent equipment recommendations or prices.

## Short knowledge check for the next review

1. Why does logging in not automatically mean a customer may access any job whose URL they know?
2. What extra information turns a photograph into a credible project case study?
3. Why are daily energy use, peak power and a final installed quotation different things?
