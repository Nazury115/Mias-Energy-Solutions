# Loxlak public website review

Reviewed: **2026-10-19**  
Purpose: identify useful patterns and measurable opportunities for Mias, without copying competitor content, branding, photography or code.

## Method and limits

Reviewed public page text/navigation through web retrieval, then checked live routes in an isolated Microsoft Edge browser. Inspected homepage screenshots at 1440 × 1000 and 390 × 844, scrolled through the homepage, and viewed contact, request and login screens. Homepage document width matched both viewport widths at the sampled states. The mobile menu opened and changed its `aria-expanded` state from false to true; full focus, keyboard and closing behavior were not audited. This is a limited responsive observation, not a full mobile/accessibility assessment.

No forms were submitted, files uploaded, accounts created, passwords requested or authentication bypassed. Visible form stages and success messages do not prove delivery, storage or backend behavior. Login/registration exist publicly; private job tracking, staff workflows, invoice handling and security were not verified. No Lighthouse, physical-device, screen-reader or penetration test was performed.

Coverage includes the main public navigation, named service destinations, linked legacy/template routes, account entry points and metadata endpoints below. It does not establish every possible URL on the domain. Initial web-tool retrieval misses were not treated as site failures; the status findings below came from live browser navigation.

## Coverage and observations

| Public URL | Live result | Observations |
| --- | --- | --- |
| [Home](https://www.loxlak.com/) | 200 | Strong photographic identity, visible contact/request actions, customer-logo strip and image-backed services. Categories mix services and sectors. Repeated summaries weaken specificity. At the two sampled widths there was no document-level horizontal overflow. |
| [Solutions](https://www.loxlak.com/solutions) | 200 | A central six-category service index helps discovery. Browser title is the generic “Services 1.” |
| [Industries](https://www.loxlak.com/industries) | 200 | Sector sections connect customer problems to services. Useful writing pattern, although detailed economic background adds reading before the practical offer. |
| [About](https://www.loxlak.com/about-loxlak) | 200 | Named leadership, portraits and company-history claims support credibility. Those are the competitor's own claims, not independently verified facts. Several footer links differ from the equivalent links on Home. |
| [Dial-A-Fixer](https://www.loxlak.com/dial-a-fixer) | 200 | Clear repair-focused proposition, process and testimonials. Its stated round-the-clock coverage is not evidence for Mias's availability. |
| [Pumps](https://www.loxlak.com/pumps) | 200 | Separates pumping use cases and assessment needs. Some reused emergency-service headings reduce page specificity. |
| [Electrical](https://www.loxlak.com/electricals) | 200 | Groups installation, fault work, upgrades, solar and maintenance. The upgrades item contains irrigation-pumping copy, an apparent editorial mismatch. |
| [Plumbing / Water Treatment destination](https://www.loxlak.com/plumbing) | 404 | Linked from main service navigation and cards; unavailable during this review. |
| [Industrial and Mining destination](https://www.loxlak.com/industrial-and-mining) | 404 | Linked service destination unavailable during this review. |
| [Commercial Buildings destination](https://www.loxlak.com/commercial-buildings) | 404 | Linked service destination unavailable during this review. |
| [Contact](https://www.loxlak.com/contact) | 200 | Contact channels, office locations, hours and a form with name, email, optional company, service and message. Delivery and validation were not exercised. |
| [Insights](https://www.loxlak.com/blog) | Browser `ERR_TOO_MANY_REDIRECTS` | Could not inspect the blog or discover its article pages through this destination. This records the observed failure, not its cause. |
| [Request service](https://www.loxlak.com/request-service) | 200 | Five visible/documented stages: identity, service, location, details and review. Phone-oriented intake, individual/company choices, urgency/scheduling, optional photos and a review step are useful reference patterns. Later stages were inspected as public page content; no completed request was sent. |
| [Customer login](https://loxlak.com/customer/login) | 200 | Email/password, recovery link, registration link and a separate request entry. The screen describes job/request tracking; authenticated functionality remains unverified. |
| [Customer registration](https://loxlak.com/customer/register) | 200 | Individual/company choice, identity/contact fields, optional city and password fields. No registration or data entry performed. |
| [Password recovery](https://loxlak.com/customer/forgot-password.php) | Redirect to `/customer/forgot-password`, then 200 | Public email-entry recovery screen. No email entered and no reset requested. |
| [Pricing destination](https://www.loxlak.com/pricing) | 404 | Several About-footer service labels lead here rather than to their intended service. |
| [robots.txt](https://www.loxlak.com/robots.txt) | 404 | Conventional endpoint absent at this URL during the check. This does not by itself establish search visibility or a ranking problem. |
| [sitemap.xml](https://www.loxlak.com/sitemap.xml) | 404 | Conventional sitemap URL absent. Another sitemap location could exist; none was identified by this review. |

Additional linked routes were checked on `https://www.loxlak.com`: `/domestic-solutions`, `/commercial-building`, `/services-1`, `/our-projects-1`, `/contact-us`, `/faq`, `/career`, `/home-1-3` and `/home-2`. All nine returned 404 during this review. These observations describe the reviewed state, not a claim that the failures are permanent.

## Useful inspiration, translated for Mias

1. **Show actual work.** Use approved Mias photos beside relevant services and connect them to specific case studies. Images should demonstrate the kind of work described, not just decorate a page.
2. **Make leadership visible.** Israel's owner-approved profile, portrait and contacts can provide a direct human introduction. Avoid invented biographies or statistics.
3. **Keep inquiry access prominent.** Provide a clear request action and working direct contacts. Urgent help should show Mias's actual coverage and hours, not inherit a competitor's promise.
4. **Explain customer problems.** Service detail pages should answer what the service does, who needs it, what Mias provides and how to ask for help.
5. **Separate service discovery from ongoing work.** A visitor can inquire without an account. An existing customer enters a private workspace only when tracking a request/job or accessing documents.

## Specific opportunities

| Evidence | Mias requirement/opportunity |
| --- | --- |
| Several advertised service destinations returned 404. | Verify every published navigation, service card and footer destination in the actual deployed site. Useful empty/missing-page states do not substitute for working advertised pages. |
| About-footer destinations differ from the main website's navigation. | Maintain a consistent shared navigation source; test links on every page type. |
| Home-footer “Account mail” and “Sales mail” resolve to `/accounts@loxlak.com` and `/sales@loxlak.com`, while the top email correctly uses `mailto:`. | Confirm contact actions use the right URL scheme/destination. This is an observed link-target issue; no email was sent. [Home source](https://www.loxlak.com/) |
| Electrical-upgrade text describes another service. | Review each service template with its actual content, not only the layout. [Electrical source](https://www.loxlak.com/electricals) |
| Solutions uses a generic page title. | Unique descriptive titles and descriptions for each service/category. [Solutions source](https://www.loxlak.com/solutions) |
| A long intake flow captures substantial detail. | Begin Mias intake with only what is needed to respond; add optional context progressively. More fields are justified only if staff use them. [Request source](https://www.loxlak.com/request-service) |
| Public login screens are visible but private behavior cannot be assessed. | Demonstrate Mias's own job isolation, progress history and document access through tests; do not make claims that its portal outperforms a competitor's unseen system. [Login source](https://loxlak.com/customer/login) |

## What “better” should mean

Use observable outcomes rather than an unsupported superiority claim:

- A prospective customer can identify a service and begin an inquiry in roughly 30 seconds; measure this with real task trials rather than assume it from a design.
- Published links work, contact destinations are verified and inquiries actually reach the business.
- Each project/review/customer claim has supporting information and permission.
- Phone and laptop users can complete the same essential journeys with keyboard/touch support.
- Customers see only their own authorized work and issued documents.
- Solar estimates expose their assumptions and rely on approved technical/pricing data.
- Measure Mias's performance/accessibility against its own documented targets. No comparative score has been measured here.

Review screenshots are local, ignored artifacts in `test-results/loxlak-*.png`. They are not Mias website assets and must not be republished as Mias work. Initial full-page captures preceded some scroll-triggered rendering; use the later `*-scrolled.png` captures when considering layout. A captured transition alone is not a confirmed interaction defect.
