# Research plan for 10,000 monthly visitors

This records the pre-implementation research. Subsequent authorized implementation and pending account actions are documented in [growth-release-and-measurement.md](growth-release-and-measurement.md).

Research date: 5 October 2026. Site: hasnainqureshi.online. Audience: UK and US business owners and founders commissioning websites, SaaS products, marketplaces, dashboards or integrations. Existing constraint: tools should work in the browser without a backend, external APIs or third-party libraries.

## Recommendation

Concentrate the next growth cycle on two connected workflows: preparing business data for import, and planning website improvements. Expand the useful capabilities of the CSV cleaner and redesign planner, publish worked examples around them, and connect the results to relevant development services and real project evidence. Commercial property websites offer a particularly credible UK/US service niche because the portfolio already describes contributions to Cambridge Research Park and 1540 Broadway.

10,000 visitors is a target, not a supported forecast. Public research establishes relevant tasks and competitors, but does not establish the site's current rankings, UK/US keyword volumes, backlinks, conversion rate or likely growth timeline. Those require account data and observation after release. No fixed visitor count or ranking is promised for any page.

## 1. What the audit established

- The local sitemap contains 20 canonical page URLs: home, four case studies, an insights directory with two articles, four services, a tools directory and seven tools.
- The code has titles, canonical tags, crawlable links and descriptive page content. The two newest tools also have visible instructions, FAQs and matching structured data.
- Google Analytics is present on the homepage, service pages and older tools. It is absent from the CSV cleaner, feedback planner, image optimizer and mockup generator. Direct landings on those four pages therefore are not measured by their own GA page tags. Search Console can still report Google search performance if the URLs are indexed. It cannot replace aggregate tool-use or unique-visitor measurement.
- The public homepage was readable through browsing and included links to the new tools. Direct reads of the new tool URLs and sitemap failed in the research environment; these failures do not establish production 404s. Verify HTTP status and Google-rendered content through Search Console before treating publication/indexing as complete.
- No current Search Console export, Keyword Planner account or GA4 account data was available. The screenshots previously supplied are historical context, not a live baseline.
- Static image optimization is already visible in the homepage code through WebP variants, lazy loading and a prioritized hero image. No current Core Web Vitals or PageSpeed result was obtained; the audit does not label the site fast or slow.

## 2. What the competition tells us

| Observed first-party competitor | Existing offer | Implication for this portfolio |
| --- | --- | --- |
| [Basedash CSV cleaner](https://www.basedash.com/tools/csv-cleaner) | Browser cleanup, duplicate removal and column profiling, with a path to its dashboard product | Local processing and basic cleanup are already available elsewhere. Connect our workflow to a concrete import or integration problem. |
| [CSV mapping project](https://github.com/tamoco-mocomoco/csv-mapping-tool) | Local field mapping, transforms and reusable configurations | Mapping is a validated task, but also competitive. A clear source-to-template review workflow needs practical examples and an easy first run. |
| [Marker.io website feedback](https://marker.io/website-design-feedback) | Visual website reviews and collaborative feedback workflows | A standalone screenshot planner can serve people wanting a quick downloadable brief without installing a widget. It should accurately explain the absence of live capture/team sharing. |
| [TinyPNG](https://tinypng.com/) and [Squoosh](https://squoosh.app/) | Established image compression utilities | Keep our optimizer useful, while concentrating new growth work on tasks with a closer commissioning connection. |
| [Pave property services](https://www.pave.design/) and [FitzroviaCo work](https://www.pave.design/fitzroviaco) | UK commercial property specialization supported by project examples | Strengthen the portfolio's attributed property work and relevant implementation details. |
| [SharpLaunch property launch checklist](https://www.sharplaunch.com/blog/checklist-for-launching-an-effective-property-website) | Industry-specific guidance tied to a property website product | Property teams have concrete content and launch questions. Original developer examples can connect those questions to our service page. |

These observations support task selection. They are not SEO difficulty scores, evidence of competitor traffic, or proof that a keyword is easy to rank for.

## 3. Highest-priority product improvements

### A. CSV: source file to destination template

Extend the existing cleaner with:

1. A second CSV upload for a destination template/header set.
2. Explicit source-to-target column mapping, rename/reorder controls and a preview.
3. Required-field checks configured by the user.
4. Duplicate checking by a selected email/ID/SKU column, with conflicting records retained for review rather than automatically merged.
5. Downloads for reviewed output and unresolved rows, plus the existing change report.
6. Optional JSON mapping recipes that can be downloaded and reused locally without saving customer records.

This is a suggested expansion, not a feature currently implemented. It can be built with native browser APIs. Verify destination-specific rules before adding branded presets. [HubSpot's documentation](https://knowledge.hubspot.com/import-and-export/set-up-your-import-file) explains header/property and encoding requirements. [Shopify's documentation](https://help.shopify.com/en/manual/products/import-export/using-csv) has product/variant dependencies and overwrite behavior. A syntactically valid generic CSV does not establish compatibility with either destination. Shopify also uses repeated product identifiers legitimately; a generic dedupe rule must not discard those rows indiscriminately.

### B. Website feedback: review to implementation plan

Extend the planner with editable acceptance criteria, change categories, owners and status; local project save/load; multiple screenshot pages with stable note references; and a print-friendly brief. Include an original worked example showing a confusing service page, the annotated changes and the requested result. Use real experience or clearly labeled demo work. Do not invent conversion improvements.

These features support a commissioning task and remain possible without server uploads. They also make the tool more useful to an existing agency client who may later need implementation help.

## 4. Proposed content backlog

Treat these as keyword hypotheses to validate by country, not measured-volume targets. Start with the first four. Some can initially be substantial sections on an existing page; create a separate page only when it has a distinct task and enough original substance.

| Priority | Proposed page/task | Query family | Original material to supply | Commercial connection |
| --- | --- | --- | --- | --- |
| 1 | Fix a CSV import with inconsistent columns | fix CSV column mismatch, CSV import column error | Synthetic failing file, repaired file, screenshots, explanation of quoted commas and missing cells | Data imports/integrations |
| 2 | Prepare a CSV for a destination template | map CSV columns, CSV import template checker | Functional mapping workflow, two sample files, reviewed result | Custom import development |
| 3 | Website redesign brief with a completed example | website redesign brief example, website redesign checklist | Annotated screenshot, priorities, acceptance criteria and downloadable original brief | Website redesign |
| 4 | Commercial property website launch requirements | commercial property website checklist, office building website features | Attributed Cambridge/Broadway examples, availability/CMS/enquiry requirements | Property website development |
| 5 | Check duplicate customer IDs without losing conflicting records | duplicate customer IDs CSV, remove duplicate contacts CSV | Conflict example, review rules, records retained/removed | CRM migrations |
| 6 | Prepare contacts for a HubSpot import | HubSpot CSV import format, HubSpot import errors | Tested, limited checks linked to current official documentation; no account access | CRM integration work |
| 7 | Handoff website changes to a developer | how to give website feedback, website feedback template | Before/after annotated demo, clear requests and acceptance criteria | Frontend improvements |
| 8 | Define a service marketplace operator dashboard | service marketplace admin requirements, marketplace MVP checklist | Attributed Vurks workflow, exception handling and first-release scope | Marketplace/SaaS development |

One page can satisfy multiple closely related terms. Google's [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) explains that its language matching understands query variations. Use one substantial page per distinct intent, rather than one URL for every wording variation.

## 5. Internal paths and service positioning

Keep the new homepage links in the footer as requested. Add useful contextual links from relevant guides and case studies:

- CSV guide → cleaner/mapping workflow → custom import or dashboard service → relevant API/SQL evidence → contact.
- Redesign example → feedback planner → Next.js/property service → attributed project case study → contact.
- Marketplace planning article → marketplace service → Vurks contribution → contact.

A dedicated custom import/integration service page is reasonable once its scope and proof are clear. Describe services actually offered; do not claim completed migrations that are not documented. Tool downloads stay available without an email gate. Give the optional service CTA a task-specific label such as “Discuss this import workflow.”

Google's [link guidance](https://developers.google.com/search/docs/crawling-indexing/links-crawlable) supports descriptive anchor text and normal crawlable links. A footer link helps discovery; contextual links also help readers understand the next step.

## 6. Distribution and earned references

Publishing should be paired with a repeatable promotion routine:

- Produce a short screen recording for each worked example using synthetic or approved data.
- Publish original demonstrations on LinkedIn aimed at UK/US operations teams, founders and agency owners.
- Contribute relevant problem-solving answers in communities where resource links are permitted, with clear disclosure and respect for community rules.
- Prepare a reusable downloadable checklist/sample pack that agencies, migration consultants and property marketers can reference in their own resources.
- Ask appropriate existing collaborators whether an attributed case study or contribution credit is possible. User approval is required before the agent contacts anyone.
- Test a small number of genuinely relevant tool listings and resource pages. Measure referrals and enquiries. Avoid purchased links, automated directory campaigns or required keyword-rich embed credits.

These are proposed actions, not actions performed during this research. They require ongoing human effort. The SEO Starter Guide discusses promotion and how links help discovery. [Google's spam policies](https://developers.google.com/search/docs/essentials/spam-policies) explain link manipulation, doorway pages and scaled-content abuse.

## 7. UK, London and USA targeting

Use country filters to validate demand separately. UK teams may use “enquiry,” “commercial property” and “website brief”; US teams may use “inquiry,” “commercial real estate” and “data import.” These are wording hypotheses, not separate mandatory pages.

The strongest evidence already includes UK and New York project contributions. Add accurate role, constraints, delivered components, CMS handoff and testimonials when permitted. State Karachi location and remote service availability honestly, plus actual meeting overlap/contracting arrangements. Create a regional page only when it supplies substantial region-specific service information. Similar city-name pages funnelling to the same offer can fall under Google's doorway policy. Do not claim a London office or UK/US presence that does not exist.

## 8. AI search visibility

For Google AI Overviews and AI Mode, [Google's guidance](https://developers.google.com/search/docs/appearance/ai-features) says established SEO practices apply and no special AI file or schema is required. Use concise task answers, visible limits, dated source references for platform-specific rules, clear authorship and consistent structured data. Keep the existing llms.txt as a navigation summary; it is not an indexing or citation guarantee.

For other answer engines, verify public crawler access and examine observable referrals when data is available. No claim is made that a markup change guarantees citations in ChatGPT, Claude, Gemini or another assistant.

## 9. Define the 10k target correctly

Use 10,000 monthly unique visitors/users as the business target if that is what “visitors” means. Sessions, search clicks and unique users are different measures. A person can click multiple search results or visit repeatedly. Country shares and qualified enquiries should be tracked alongside the total.

For scale context only: 10,000 organic clicks at an assumed 3% CTR would require about 333,333 search impressions per month. The CTR is illustrative, not this site's measured CTR, and 10,000 clicks do not imply 10,000 unique visitors. This shows why a handful of metadata edits cannot support a numerical forecast.

A hypothetical acquisition budget is 5,000 monthly sessions from task tools, 2,000 from worked guides, 1,000 from service/case-study entry pages and 2,000 from earned referrals/social/return visits. These are allocation targets adding up to 10,000 sessions, not estimated demand or a forecast of unique users. Validate and replace the split with actual data.

Do not divide 10,000 by page count and assume every new page will receive that share. Some pages may produce useful enquiries from few visits; others may attract many visitors without commissioning work.

## 10. Measurement and validation gates

1. Obtain the latest GA4 country/source/landing-page data and a three-month Search Console export containing Queries, Pages and Countries. Review comparable 28-30 day periods and longer trends.
2. Use URL Inspection and the sitemap report to establish the indexed inventory. Confirm live HTTP responses and mobile rendering.
3. Validate keyword candidates in Keyword Planner with UK and US location settings separately. Its competition metric describes advertisers, not organic ranking difficulty: see [Google's metric definitions](https://support.google.com/google-ads/answer/3022575). Search suggestions and visible results do not give monthly search volume.
4. Decide how to measure the four untagged tools. Keeping them free of third-party requests means GSC can measure search arrivals, but no aggregate local-only counter can measure all users or tool completions across devices. A tracking change would require a conscious change to the current privacy constraints; none was made here.
5. Where existing analytics allows it, distinguish successful enquiries from contact-button clicks, and keep tool content/CSV values out of tracking. Count qualified enquiries separately from visits. [Search Console's performance documentation](https://support.google.com/webmasters/answer/7576553) describes its query/page/country reporting.

Practical review decisions: rising impressions with low clicks → examine query fit and snippets; search positions outside the leading results → improve task substance and relevant references; tool traffic without service interest → inspect audience/task fit and next-step copy; enquiries from the wrong countries/budgets → clarify availability and scope. These are investigation rules, not automatic causes or ranking guarantees.

## 11. First 90 days

| Period | Deliverables | Evidence to inspect |
| --- | --- | --- |
| Days 1-14 | Establish baseline/indexing; verify live tools; complete one worked CSV example and one redesign example; improve contextual links | Indexed URLs, current country/query mix, usability feedback |
| Days 15-30 | Add reviewed column mapping/template checks; publish the first four backlog tasks when ready; record original demos | Impressions for intended queries, successful task completion observations, early qualified contacts |
| Days 31-60 | Distribute useful examples; pursue relevant earned references; strengthen case-study contribution details and service scope | Referrals, UK/US query relevance, real enquiries, returning use where measurable |
| Days 61-90 | Improve pages showing evidence of demand; add selective platform checks only when supported; consolidate overlapping weak content | Comparable 28-30 day trends, qualified enquiries by source, remaining product friction |

This is a work schedule, not a promise of 10k visits within 90 days. Google notes that changes can take hours to months to appear and that some changes may have no noticeable effect. Continue or change investment based on evidence, not page-production quotas.

## Immediate next step

Establish the current indexed/traffic baseline, then improve the CSV cleaner with source-to-template mapping and publish two original worked examples: one business CSV import and one website redesign handoff. These are the strongest next hypotheses from the current evidence. Validate their audience and search response before expanding to a large tools catalogue.
