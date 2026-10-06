# Growth release and measurement

Prepared 5 October 2026. Target: qualified business visitors and enquiries from the UK, London and USA. The 10,000 monthly users target is not a forecast or a promised delivery date.

## Implemented locally

- Shared existing GA4 property `G-W0624M03ZJ` across public sitemap pages, including the previously untagged CSV, feedback, optimizer and mockup tools.
- Custom task completion, export, tool-to-service, resource download and contact events. Successful homepage form responses use `generate_lead`; contact clicks are separate.
- CSV source-to-template mapping, explicit required fields, selected key conflict review, unresolved and removed rows downloads, and reusable header/rule recipes.
- Feedback categories, owner, acceptance criteria and status; up to five screenshots; local project save/reopen; combined print/PDF view.
- Eight original task guides, a data import/integration service, sample files, worked outputs and contextual links. New homepage entries are in the footer.
- Metadata, canonical URLs, Article/Service/Breadcrumb structured data, sitemap and llms navigation updates. No special AI schema or citation guarantee is claimed.

## Analytics boundaries

The tools process files in browser memory. Google Analytics is now an external request on these pages. The custom payload contains public route/title, tool name, fixed export format, bounded record count and fixed contact method where applicable. File values, filenames, screenshot data, note text and project names are not custom event fields. Page URLs and referrers are reduced to origin and path. Browser Global Privacy Control, Do Not Track and the persistent Privacy page preference prevent this loader from starting.

GA4 account settings are separate from these code changes. Before release, inspect Enhanced Measurement in the web stream: disable automatic form interactions and file downloads for these workflows if enabled, and rely on the explicit events above. Check outbound click and browser history page-view settings against the intended privacy settings. Review the site's existing analytics/consent policy with its owner. Do not enable user-provided data collection for tool inputs.

Local testing can verify event payloads and the loader. Receiving events in the live GA4 property requires deployment, a permitted analytics session and account access. An opt-out session or blocked tag will not contribute to the reports; do not describe the results as a complete census of visitors.

## Owner actions after deployment

1. Open each new route on the live domain and confirm HTTP 200, mobile rendering and working downloads. There are 30 canonical pages in the updated sitemap.
2. In Search Console, submit the updated sitemap and inspect priority tool, guide and service URLs. Check indexing exclusions and selected canonical URLs. Request indexing for ready priority pages; an inspection request is not an indexing guarantee.
3. Use GA4 Realtime/DebugView with an approved test session. Check `tool_complete`, `tool_download`, `tool_service_click`, `resource_download`, `contact_click`, and a genuinely successful `generate_lead`. Do not submit a real enquiry just to count a click.
4. Create reporting views by landing page, country and acquisition source. Mark `generate_lead` as the enquiry key event if it matches the business definition. Keep contact clicks as intent signals, not completed leads.
5. Export three months of Search Console Queries, Pages and Countries plus comparable 28-30 day GA4 source/landing-page/country reports. Current screenshots are historical context, not a new baseline.
6. Use Keyword Planner with UK and USA location filters separately for the candidate tasks below. Record actual estimates, date, location and settings. Its advertiser competition is not an organic SEO difficulty score.
7. Check live Core Web Vitals/PageSpeed evidence. Fix a demonstrated bottleneck rather than claiming speed improvements from metadata.

These account actions remain pending because no GA4, Search Console or Keyword Planner account access has been provided. Social posting, community contributions and collaborator outreach also remain pending; drafts are prepared separately.

## Keyword hypotheses to validate

| Distinct task | Candidate wording | Published destination |
| --- | --- | --- |
| Repair file structure | fix CSV import errors; inconsistent CSV columns | /insights/fix-csv-import-errors/ |
| Prepare destination layout | map CSV columns; CSV import template | /insights/csv-column-mapping/ |
| Preserve identity conflicts | duplicate customer IDs CSV; conflicting contact records | /insights/duplicate-customer-ids-csv/ |
| Prepare a contacts import | HubSpot CSV import format; prepare HubSpot contacts CSV | /insights/hubspot-contacts-csv-preparation/ |
| Commission a redesign | website redesign brief example | /insights/website-redesign-brief-example/ |
| Handoff specific changes | website feedback template; feedback for website developer | /insights/website-feedback-developer-handoff/ |
| Launch a property site | commercial property website checklist; commercial real estate website features | /insights/commercial-property-website-checklist/ |
| Scope marketplace operations | service marketplace admin dashboard requirements | /insights/service-marketplace-operator-dashboard/ |

Public research supports the tasks and references; it does not establish monthly volumes, easy rankings or expected traffic. Guides consolidate related wording, instead of producing duplicate city/keyword pages.

## Monthly review

Record the same reporting definitions each month: observed GA4 users, sessions, Google clicks, intended-country share, task completions, exports, service clicks, successful enquiries and manually qualified enquiries. Users, sessions and clicks are different measures.

- Impressions without suitable clicks: inspect the actual query and snippet before changing the title.
- Tool visits without service interest: review whether the audience commissions the related work and whether the next step is useful.
- Completed downloads and useful enquiries: strengthen that workflow with original evidence and references.
- Irrelevant enquiries: clarify scope, remote availability and required project information.
- Overlapping guide intent: consolidate useful content and redirect if evidence supports a merge.

Review after the first comparable month and again across three months. Continue distribution and seek earned references based on relevant audience response, not a page production quota.

## References

- [Google AI search guidance](https://developers.google.com/search/docs/appearance/ai-features)
- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Search Console performance reporting](https://support.google.com/webmasters/answer/7576553)
- [Keyword Planner metric definitions](https://support.google.com/google-ads/answer/3022575)
- [GA4 configuration reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/config)
- [HubSpot import file requirements](https://knowledge.hubspot.com/import-and-export/set-up-your-import-file)
## Verification performed locally

- `node --test tests/csv-cleaner-core.test.cjs`: 13 tests passed, including quoted multiline values, malformed input, explicit removals, destination mapping, retained conflicts and immutable source data.
- `python tests/site-seo-audit.py`: all 29 canonical pages passed metadata, one-H1, schema JSON, single analytics loader, local link/asset and anchor checks.
- Chromium browser workflow: reviewed CSV equals the expected mapping sample; incomplete contacts remain in an unresolved download; recipes save and reload with the same source headers.
- Chromium browser workflow: two screenshots and their notes/owners/acceptance criteria survive project save/reopen; malformed project image URLs are rejected while preserving the existing project; PNG/text exports and isolated print view work.
- Native optimizer individual and ZIP downloads and mockup exports trigger the intended custom analytics events. Tested custom payloads exclude a deliberately private filename, contact values and URL query strings.
- Privacy page preference prevents further custom events; a Global Privacy Control session loads no external tool requests. Google tag requests were stubbed during these local checks: this does not establish receipt in the live property.
- Mobile checks at 375px covered tool pages, expanded mapping controls, new guide/service pages and the Insights collection. Local Moderat fonts were verified; no tested page overflowed horizontally.
- `git diff --check` passed. No deployment, account settings changes, outreach sends or social publication were performed.

## Design consistency update

All 30 public pages now use the shared portfolio header/footer, dark and paper palette, local Moderat type scale and consistent content widths. Unstyled bottom resource lists use shared cards; callout headings use the agreed type scale. Analytics preferences are on /privacy/ rather than a footer button. Browser checks covered all 30 pages at 1440px and 375px, with consistent heading/body/footer fonts and no footer analytics controls. A wide table in the older AI comparison article was fixed and confirmed to remain inside a scrollable region. Header menus, the CSV mapping workflow, feedback print view and persistent analytics preference were checked. SEO/link/schema audit passes for the updated 30-page sitemap.
