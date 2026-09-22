# Search growth plan

Audience: clients commissioning projects and recruiters hiring for remote full-stack roles, with equal priority. AI search visibility is included; mobile app store optimization is outside this website task.

Priority markets: United Kingdom and United States. Position Hasnain as a remote developer based in Karachi who serves those markets. The homepage and service pages now state that availability and connect visitors to relevant UK and New York project contributions. Service `areaServed` describes availability; it does not set Google country targeting or guarantee rankings. Working-hour overlap should be agreed with each team, not promised without confirmation.

In Search Console, filter the Performance report by United Kingdom and United States separately. Compare non-branded queries, impressions, clicks and landing pages for each country over the same reporting periods. Candidate topics include remote React developer, Next.js / headless WordPress developer and SaaS MVP developer; validate the actual query data before expanding content. Existing English pages serve both markets, so there are no duplicate country pages or artificial regional hreflang alternatives.

## What the audit established

- The supplied Google result shows discovery for Hasnain's name. It does not establish ranking or impressions for service searches.
- The supplied Analytics screenshot shows 49 direct sessions and 0 organic-search sessions for its selected period. It does not identify the cause or establish which direct visits are real prospects.
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
| Case studies | Check actual project contribution | Specific implementation scope and live project links |
| `/insights/` | Understand engineering decisions before hiring | Clear answers, project links and technical references |

## After deployment

1. Check both service URLs return 200, self-canonicalize and load on mobile. Verify www redirects to the same path on the non-www host without a loop, including a case-study URL and a URL with campaign parameters.
2. In Google Search Console, use the domain property for `hasnainqureshi.online`. Submit `https://hasnainqureshi.online/sitemap.xml`. Inspect the homepage and both new service URLs, check rendered content and canonical selection, then request indexing. Sitemap submission does not guarantee indexing.
3. Export Search Console Performance for the last 3 months, with Queries and Pages, and compare the last 28 days with the previous 28. Include clicks, impressions, CTR and average position. Inspect country/device differences where there is enough data.
4. In GA4 Realtime, check direct visits to a case study, insights and each new service page. Confirm one page_view per page load. Test the existing contact form and confirm `generate_lead` only on a successful submission. Use it as a key event; evaluate `resume_view` separately for recruiter intent.
5. Check Page Indexing and Core Web Vitals reports. Validate new structured data with Schema.org Validator; Service markup describes the page but does not promise a Google rich result. Validate BreadcrumbList with Google's Rich Results Test.

## Decide from the data

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
