# Search growth plan

Audience: clients commissioning projects and recruiters hiring for remote full-stack roles, with equal priority. AI search visibility is included; mobile app store optimization is outside this website task.

Priority markets: London and the wider United Kingdom, plus the United States. Position Hasnain as a remote developer based in Karachi who is available to those teams. The homepage and service pages state that availability and connect visitors to relevant UK and New York project contributions. Cambridge Research Park is UK evidence outside London; 1540 Broadway is New York evidence. Do not imply a London or US office or a London project. Service `areaServed` describes availability; it does not set Google country targeting or guarantee rankings. Working-hour overlap should be agreed with each team, not promised without confirmation.

In Search Console, filter the Performance report by United Kingdom and United States separately. Compare non-branded queries, impressions, clicks and landing pages for each country over the same reporting periods. Candidate topics include remote React developer, Next.js / headless WordPress developer and SaaS MVP developer; validate the actual query data before expanding content. Existing English pages serve both markets, so there are no duplicate country pages or artificial regional hreflang alternatives.

For London specifically, Search Console's country filter only shows the United Kingdom, not a reliable London keyword market. Use GA4 city data as a secondary signal when the sample is meaningful, and review enquiries for the prospect's actual location and project fit. The website cost calculator offers separately modelled GBP and USD planning ranges. Keep the same English service URLs unless a region develops genuinely different content and evidence; Google warns against near-identical city pages that funnel users to one destination. See [Google's multi-regional guidance](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites) and [doorway abuse policy](https://developers.google.com/search/docs/essentials/spam-policies#doorways).

## What the audit established

- The supplied Google result shows discovery for Hasnain's name. It does not establish ranking or impressions for service searches.
- An earlier Analytics screenshot showed 49 direct sessions and 0 organic-search sessions for its selected period. A newer GA4 screenshot for 2-29 September 2026 shows 120 direct sessions and 3 Google organic sessions, plus 119 active users across all sources. This is a low organic baseline, not evidence of a specific technical problem. Direct sessions do not establish how many visitors are qualified prospects.
- Live checks returned HTTP 200 for the homepage, insights, ChatKnot case study, robots.txt and sitemap.xml, with no X-Robots-Tag blocking those checked responses.
- Both www.hasnainqureshi.online and hasnainqureshi.online served HTTP 200. A Vercel host redirect now consolidates www to the existing non-www canonical after deployment.
- The local insights page and four case studies were missing the homepage's GA4 tag. They now use the same measurement ID; this improves future coverage and cannot recover past visits.
- Search Console queries, impressions, rankings, selected canonicals and indexing reasons were not available. No keyword volume, traffic forecast or ranking claim has been inferred.

## Page focus

These are relevance targets to validate in Search Console, not verified high-volume keywords.

| Page | Reader need | Evidence / action |
| --- | --- | --- |
| `/` | Evaluate Hasnain for a full-stack React / Next.js role or project | Experience, resume, portfolio, contact |
| `/services/saas-mvp-development/` | Find a developer for a React / Node.js SaaS MVP | ChatKnot, project scope, hiring questions |
| `/services/nextjs-development/` | Find Next.js / headless WordPress implementation help | Cambridge Research Park and 1540 Broadway |
| `/services/commercial-property-websites/` | Commission a website for a commercial building or campus | Property-focused scope, attributed Cambridge and Broadway contributions, FAQs and project brief form |
| `/services/service-marketplace-app-development/` | Find a developer for a two-sided service marketplace | Vurks React Native contribution, customer/provider/operator scope, FAQs and project brief form |
| `/tools/website-cost-calculator/` | Plan a budget for a business or commercial property website | Disclosed hour and rate model, copy/download result, optional enquiry (`generate_lead`) |
| `/tools/website-brief-builder/` | Plan a website or web app before contacting a developer | Browser-only brief builder, open questions, optional send form (`generate_lead`) |
| `/tools/website-health-check/` | Find out why an existing website is slow or has search issues | PageSpeed Insights results explained in plain English, optional fix request (`generate_lead`) |
| Case studies | Check actual project contribution | Specific implementation scope and live project links |
| `/insights/` | Understand engineering decisions before hiring | Clear answers, project links and technical references |
| `/insights/service-marketplace-mvp-checklist/` | Scope a service marketplace MVP before commissioning it | Three-journey checklist, payment model decisions, attributed Vurks experience and service handoff |

## Keyword research - 30 September 2026

Public search results show distinct intent clusters, but do not provide reliable volume or ranking difficulty. These are candidate queries to validate with Search Console after deployment, not promised traffic.

| Candidate query language | Searcher intent | Existing page and action |
| --- | --- | --- |
| website speed test; Core Web Vitals test; website SEO check | Diagnose a public page | `/tools/website-health-check/`: title, H1 and explanation now describe its real PageSpeed Insights and Lighthouse function. SEO is explicitly limited to technical basics. |
| commercial property website development; commercial real estate website development | Commission a property site | `/services/commercial-property-websites/`: one page serves UK and US wording, with Cambridge and Broadway evidence. Do not claim design ownership. |
| service marketplace app development; marketplace MVP features; marketplace app development cost | Plan a two-sided product or hire implementation help | `/services/service-marketplace-app-development/` covers service and cost questions; `/insights/service-marketplace-mvp-checklist/` covers first-release scoping. Avoid invented cost figures. |
| website cost calculator; business website cost | Explore an initial budget | `/tools/website-cost-calculator/` already includes disclosed assumptions and an illustrative result. No new duplicate pricing page. |

Google recommends descriptive, concise titles and unique, useful content. AI search uses those same foundations; there is no separate AI-only schema or keyword trick. See [Google title guidance](https://developers.google.com/search/docs/appearance/title-link) and [AI search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide). Prioritize queries with impressions and relevant landing pages in Search Console before publishing the next guide.

## After deployment

For the commercial property and marketplace pages, navigation links live in the homepage footer and relevant page footers. Check each new URL in Search Console after deployment and test a real enquiry through Formspree. The `generate_lead` event fires only after a successful response. Local form checks used mocked responses and did not send an enquiry.

AI search visibility uses the same accessible HTML, crawlable links, useful answers and accurate attribution as ordinary search. WebPage, Service, Person and BreadcrumbList data describe the visible page. No special AI schema or guaranteed citation is claimed; the existing `llms.txt` is maintained as a navigation summary only. See [Google's AI search guidance](https://developers.google.com/search/docs/appearance/ai-features).

1. Check service URLs return 200, self-canonicalize and load on mobile. Verify www redirects to the same path on the non-www host without a loop, including a case-study URL and a URL with campaign parameters.
2. In Google Search Console, use the domain property for `hasnainqureshi.online`. Submit `https://hasnainqureshi.online/sitemap.xml`. Inspect the homepage and new service URLs, check rendered content and canonical selection, then request indexing. Sitemap submission does not guarantee indexing.
3. Export Search Console Performance for the last 3 months, with Queries and Pages, and compare the last 30 days with the previous 30. Include clicks, impressions, CTR and average position. Inspect country/device differences where there is enough data.
4. In GA4 Realtime, check direct visits to a case study, insights and each new service page. Confirm one page_view per page load. Test the existing contact form and confirm `generate_lead` only on a successful submission. Use it as a key event; evaluate `resume_view` separately for recruiter intent.
5. Check Page Indexing and Core Web Vitals reports. Validate new structured data with Schema.org Validator; Service markup describes the page but does not promise a Google rich result. Validate BreadcrumbList with Google's Rich Results Test.

## Free tools

The `/tools/` hub and its three tools target people who are commissioning or fixing a website: a cost calculator (budgeting), a brief builder (planning) and a health check (existing site performance). Each tool page has visible explanatory content, a WebApplication and BreadcrumbList description, a `<noscript>` notice and an optional Formspree enquiry that fires `generate_lead` only on success.

Tools are linked from the homepage services introduction, relevant service pages and each other. AI search visibility relies on the same visible explanations and FAQs; there is no special markup for AI systems.

Candidate queries to validate in Search Console (not verified volumes): website cost calculator, how much does a business website cost, website brief template, how to write a website brief, website speed test explained, why is my website slow.

Tool events in GA4: `cost_calculate`, `cost_copy`, `cost_download`, `tool_start`, `tool_project_type`, `brief_copy`, `brief_download`, `brief_print`, `check_start`, `check_complete`, `check_error`, `report_copy`, `report_download`, `report_share`, `generate_lead`. Register `tool`, `method` and `strategy` as event-scoped custom dimensions to report by tool.

Review tools over 30-day windows, not 7 days: impressions and clicks per tool URL, tool usage events per visit, and `generate_lead` by `method`. A tool with usage but no enquiries is still useful if it brings the right visitors to case studies and service pages; check the pages visited next before changing it. Watch health check `check_error` events with reason `quota`.

## Decide from the data

The 10,000 monthly visitor goal is about 333 visits per day. The September GA4 screenshot is far below that level and does not include Search Console queries or indexing reasons. Prioritize non-branded organic clicks and qualified enquiries before total visits. Track the same 30-day windows after each deployment; do not extrapolate a traffic promise from page count or sitemap submission.

- No impressions and not indexed: inspect crawl/indexing errors, rendered content and canonical selection first.
- Indexed with few non-brand impressions: improve the pages' relevance and original project detail; confirm the service matches actual queries before adding more pages.
- Impressions but few clicks: review the actual queries, position and displayed title/snippet together. A small sample is not enough to establish a CTR problem.
- Clicks but few enquiries: review landing-page engagement, contact form completion and whether the service answers the visitor's need.

Keep a weekly record of branded/non-branded impressions and clicks, organic landing pages, successful enquiries and resume views. Evaluate changes over several weeks; do not promise a fixed ranking or traffic increase.

## Content and external discovery

- Strengthen the existing case studies with real implementation decisions, constraints, code excerpts that may be shared, and measured outcomes only when evidence exists. Do not invent metrics or testimonials.
- For recruiter discovery, keep role, location, skills, project contribution and resume information consistent across the site and public professional profiles.
- For clients, use questions from actual enquiries to expand the relevant service page. Avoid making near-identical location or technology pages for keyword variations.
- Link the appropriate portfolio or case study from owned GitHub repositories and professional profiles. Seek relevant project credits when collaborators can provide them. No outreach or external profile edits were performed in this task.
- For AI discovery, keep important information in visible HTML with clear attribution and links to evidence. `llms.txt` is only a navigation aid; it is not a guaranteed ranking or citation mechanism. Do not add hidden answers, unsupported achievements or special markup that misrepresents the visible page.

## References

- [Google Search Essentials](https://developers.google.com/search/docs/essentials)
- [Google guidance for generative AI search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [Using Search Console and Analytics together](https://developers.google.com/search/docs/monitor-debug/google-analytics-search-console)
- [Canonical URL consolidation](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Vercel redirects configuration](https://vercel.com/docs/project-configuration/vercel-json)
