# Organic client acquisition audit — 27 October 2026

Scope: analyze the live portfolio, buyer search intent, measurement and link acquisition before changing the website. Preserve the existing visual theme. Target: 50+ relevant prospective-client visits per month from the UK/US, with London a priority market. This is a target, not a traffic or ranking guarantee.

## What the supplied screenshots establish

| Metric | Reported value | Interpretation |
| --- | --- | --- |
| Google Search clicks, 28 days | 11 | Small search acquisition baseline; query intent and country are not shown. |
| Google Search impressions | 303 | Limited exposure. There is no previous-period Search Console comparison in the screenshot. |
| Google Search CTR | 3.6% | Aggregate across the site's queries; cannot diagnose a service-page snippet from this alone. |
| Average Google position | 8 | Does not establish top-ten ranking for London developer searches. It may combine branded, informational and service searches. |
| GA4 Organic Search sessions | 16, up 433.3% | Organic sessions increased in this comparison, from approximately 3. This is a small sample. |
| GA4 Direct sessions | 95, down 18.8% | The largest visible acquisition channel declined. Direct does not identify visitor intent. |
| GA4 active users | 97, down 17.1% | All-channel users; this is not an organic-only metric. |
| GA4 key events | 0 | Does not establish that nobody contacted the owner. Event configuration and receipt need account-side checks. |

The country card is set to **Yesterday**, while the acquisition card is set to **Last 28 days**. The three countries in that card cannot establish absence of UK/US visits over the month. The earlier 13 October screenshot and the current one cover different rolling windows; they are not a controlled before/after comparison.

GA4 sessions and Search Console clicks are different metrics and sources. Their counts should not be expected to match.

## Evidence collected live

The read-only audit fetched all 30 canonical URLs in the current sitemap and 67 additional internally linked resources. All returned HTTP 200. Every sitemap page had one H1, its expected self-referencing canonical, an index directive and parseable JSON-LD. No X-Robots-Tag blocking was found. A deliberately nonexistent URL returned 404. Robots.txt permits public-page crawling.

Chromium checks covered the homepage, Next.js service, commercial-property service and tools index at 375px and 1440px. No horizontal overflow or JavaScript errors occurred in those checks. The homepage H1 and service section also remained visible with JavaScript disabled. This verifies those routes and viewports; it is not a full accessibility or field-performance certification.

Both enquiry forms were tested with intercepted failure and success responses. A failure retained the message and generated no lead event. A simulated success generated one lead event. No real enquiry or Analytics hit was sent. Formspree account status, spam filtering and inbox delivery remain unverified.

Raw evidence: `live-seo-evidence-2026-10-27.json` and `browser-seo-evidence-2026-10-27.json`. Reproduction scripts: `audit-live-site.py` and `audit-browser.py`.

## Findings ranked by practical impact

### 1. Search exposure and buyer relevance need attention

There are 30 indexable sitemap URLs but only 303 reported Google impressions in the supplied window. This does not prove all 30 URLs are indexed. Check Search Console's Pages report and query/page breakdown before expanding the site again.

The site has five service pages, eleven insights pages including the index, eight tool pages including the index, four project case studies, the homepage and privacy page. CSV tools and AI comparison content can attract users who are not commissioning a website. They are not automatically harmful to SEO, but their traffic should be reported separately from visits to a service or relevant case study.

Recommendation: spend the next cycle improving two commercial destinations rather than adding another broad set of tools. First: Next.js/headless WordPress implementation for agencies and businesses. Second: commercial-property website development, supported by Cambridge Research Park and 1540 Broadway. Keep SaaS MVP development as a separate, supported offer. This prioritization is a hypothesis based on existing project evidence, pending query and demand data.

### 2. London already appears; keyword placement and offer specificity can improve

The live Next.js page contains London in its FAQ/collaboration text. Its HTML contains no occurrence of “freelance.” Its title is “Next.js & Headless WordPress Developer | Hasnain Qureshi,” while its H1 emphasizes manageable website content. The commercial-property page already has a substantial London/UK and US collaboration section.

Adding a city repeatedly is not the missing technical switch. Connect the buyer's task with the service in the title, H1, opening copy and relevant internal link text, then support that promise with the actual contribution.

Proposed copy to review, not applied:

- Next.js title: **Freelance Next.js & WordPress Developer | Hasnain Qureshi**
- Next.js H1: **Freelance Next.js development for UK and US teams**
- Regional subsection: **Remote development for London agencies and businesses**
- Example text: “Looking for a freelance Next.js developer for your London team? I work remotely from Karachi on React interfaces and WordPress content integrations. My Cambridge Research Park case study shows my Next.js, GraphQL and ACF implementation work. Share your design or existing website, required pages, publishing workflow and review hours so we can scope the build.”

Cambridge Research Park is UK project evidence, not a claim of a London office or a London-based client. Keep the location truthful. Do not create near-identical city pages. No regional hreflang variants are needed for one shared English page.

### 3. The primary navigation gives little visibility to services

The shared primary navigation emphasizes Work, Stack, Skills, Experience and Contact. Service destinations are mainly reached through homepage cards and the footer. This is usable, but a client should be able to discover Services directly from every page. A Services link or compact menu can use the existing header styling.

Some related-resource choices are weakly aligned with the page. The SaaS service's visible related guide is CSV column mapping. A SaaS/marketplace scoping guide or ChatKnot implementation would be a stronger next step. Resolve topical internal links before generating more articles.

### 4. Duplicate host and URL variants remain live

| Request | First response observed |
| --- | --- |
| `http://hasnainqureshi.online/` | 308 to HTTPS; correct |
| `https://www.hasnainqureshi.online/` | 200; no redirect |
| `https://www.hasnainqureshi.online/services/nextjs-development/` | 200; no redirect |
| `/index.html` | 200 |
| `/services/nextjs-development` | 200 |
| `/services/nextjs-development/index.html` | 200 |

Self-canonicals already point to preferred URLs, so these responses do not establish an SEO penalty. Nevertheless, the intended www redirect is not active even though a matching rule exists in local `vercel.json`. Check the Vercel project's root/build settings and Domains configuration. Set the www host to redirect to the current non-www canonical host, preserving paths and query strings. Do not reverse the canonical host as a speculative fix. Normalize index/slash variants only with route testing; preserve case-study `.html` URLs.

### 5. Attribution and event accuracy have confirmed gaps

- The Analytics loader overrides `page_location` with origin + pathname and does not explicitly pass UTM campaign fields. In a test with synthetic UTM parameters, the config received only the clean URL. Campaign attribution needs a privacy-preserving mapping of approved campaign fields and a receipt check. This affects source diagnosis; it is not a Google ranking defect.
- One email click on the property service generated **two `contact_click` events**. `property-service.js` tracks the link directly, while `site-analytics.js` also handles its mailto link. Give that event one owner.
- GPC, Do Not Track and the saved analytics preference suppress collection. Preserve those preferences; account for their effect when comparing measured users over time.
- “annyfriend-aca5d” is the selected GA4 property name in screenshots. Its name alone does not prove a mismatch. Confirm the Web stream URL and measurement ID `G-W0624M03ZJ` in Admin → Data streams.
- Confirm `generate_lead` is received after a genuine successful enquiry, then mark it as a key event if appropriate. Track contact clicks and completed enquiries separately. Tawk conversation outcomes are another channel not established by the current lead event.

### 6. Project evidence can answer more buyer questions

The Cambridge and Broadway case studies describe real scope but remain concise. Add the actual delivery role, component/content decisions, a concrete implementation problem, a screenshot illustrating the solution and the handover responsibilities. If an agency owned design or client management, keep that attribution clear. Add a genuine testimonial with permission or a collaborator reference where available.

Explain project engagement options and scope boundaries. Starting prices, working-hour overlap and availability should only be published after the owner supplies real values. Competitors such as Alex Hooley expose engagement choices and project examples; that is an observed offer difference, not evidence that their layout causes rankings. Do not copy their prices.

### 7. Existing backlink plans have not established acquired links

The repository already contains backlink and distribution drafts. Prepared drafts do not create external links. No complete backlink index or Search Console Links export was available, so there is no verified referring-domain count and no basis for claiming there are zero backlinks.

Start with accurate owned profiles, relevant repository documentation and contribution credits through existing professional relationships. Then pitch a useful case study/resource to a small number of appropriate editors or directory owners. Track actual live referring pages, anchor text, relevance, referral visits and enquiries. Many profile links are nofollow; their value can include discovery and credibility without a ranking promise.

Google identifies paid ranking links and mass link manipulation as link spam. Do not purchase bulk “high DA” packages, use unrelated comment links or require exact-match anchors. Ordinary sponsored exposure can be evaluated for referral value with appropriate link qualification.

## Public search research and keyword priorities

Research used public web search, not an authenticated, location-simulated Google SERP or paid keyword database. It verifies examples of buyer wording and competing pages, not monthly volume, exact Google rank or organic difficulty. Account-based Keyword Planner measurements remain pending.

| Priority | Candidate query family | Existing destination | Why investigate |
| --- | --- | --- | --- |
| 1 | freelance Next.js developer; freelance Next.js developer UK; remote Next.js developer for London agency | `/services/nextjs-development/` | Strong match to current stack, agency implementation and two relevant public projects. |
| 1 | headless WordPress developer UK; Next.js WordPress developer; GraphQL ACF developer | Same Next.js page | Distinct technical need supported by Cambridge work; keep related wording on one substantial page initially. |
| 1 | commercial property website development; commercial property website design UK; commercial real estate website developer | `/services/commercial-property-websites/` | Sector-specific evidence from a UK campus and New York building. Clarify frontend/implementation scope rather than claiming a full creative agency. |
| 2 | SaaS MVP developer UK; hire SaaS MVP developer; React Node.js MVP development | `/services/saas-mvp-development/` | Supported by ChatKnot; broad startup market has strong agency/platform competition. |
| 2 | service marketplace app developer; React Native marketplace development | Existing marketplace service | Supported by Vurks; test actual demand before expanding. |
| Exploratory | React developer London; web developer London; hire React developer USA | Relevant service or homepage after intent validation | Mixed local, employment, platform and agency intent. Not the sole basis for a small remote portfolio's growth plan. |

See `buyer-keywords-2026-10-27.csv` for an import-ready seed list. In Keyword Planner, run separate London, United Kingdom and United States location sets; do not add their volumes together because London is included in the UK. Also test unmodified terms with those location filters. Use Google network, English and a consistent date range, and record the settings. Advertiser competition is not organic difficulty.

## Reaching 50 relevant visits per month

Define a working proxy: an organic session from the UK/US that lands on a commercial service or relevant project page. Confirmed qualified prospects are a stricter group, identified by their actual enquiry and fit. Country and page alone do not prove a person is a buyer, and 50 visits are not 50 leads.

For planning only:

`relevant visits ≈ relevant impressions × CTR × share of clicks that fit the target`

At 3.6% CTR and assuming every click fits, 50 visits require about **1,389 impressions**. If half fit, the illustration becomes about **2,778 impressions**. At 5% CTR and half fitting, it becomes **2,000 impressions**. These examples are not forecasts: the current 303 impressions include unknown queries/countries, and Google clicks are not identical to sessions.

The next decision should therefore focus on relevant exposure and acquisition quality, alongside the contact journey. A repeated metadata change cannot promise those additional impressions.

## Four-week execution sequence

1. **Week 1:** Export the baseline; verify stream and key events; fix duplicate email events/campaign attribution; apply and verify the host redirect. Keep URLs and visual theme stable.
2. **Week 2:** Use country/query data and Keyword Planner to select two priority offers. Improve those existing service pages, add Services to navigation, strengthen contextual links and deepen the matching case studies.
3. **Week 3:** Complete relevant owned-profile/repository references and seek accurate credits through existing collaborators. Prepare a short original case-study article and one relevant listing. Publish or contact others only through an explicitly authorized action with the actual text and destination reviewed.
4. **Week 4:** Review non-brand UK/US impressions/clicks by landing page, relevant sessions, contact intent, completed enquiries and manually qualified enquiries. Continue improving the pages with demand. Four weeks is a review checkpoint, not a ranking deadline.

## Data needed to finalize priorities

1. Search Console Performance → Search results → last 3 months: export Queries, Pages, Countries and Devices, plus the last 28 days compared with the previous 28. Apply UK and US filters separately. Remove branded name/domain variations for a non-brand view.
2. Search Console Pages: indexing counts and reasons for priority service/case-study URLs. Links: Top linking sites and Top linked pages. Optional Manual actions/Security issues status if any warning appears.
3. GA4 Traffic acquisition: Session source/medium and country for the same dates. Landing-page report with Organic Search and UK/US filters. Include sessions, engagement and received `generate_lead`/contact events. Check the web stream ID.
4. Keyword Planner exports for the supplied seeds with London, UK and US run separately. Include average monthly searches, seasonality and settings; do not send account credentials.
5. Owner input: actual minimum project budget, current availability, working-hour overlap and the project categories worth accepting. These materially change qualification and offer copy.

Windsor.ai was found as an available unconnected route to account data. No connection was confirmed; no private Analytics/Search Console data was accessed.

## References

- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Google's search-traffic drop diagnosis](https://developers.google.com/search/docs/monitor-debug/debugging-search-traffic-drops)
- [Google spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
- [Keyword Planner metric definitions](https://support.google.com/google-ads/answer/3022575)
- [Vercel domain redirect settings](https://vercel.com/docs/domains/working-with-domains/deploying-and-redirecting)
- [Alex Hooley: freelance Next.js service](https://alexhooley.com/services/next-js-developer)
- [Tom Hirst: headless WordPress service](https://www.tomhirst.com/headless-wordpress-developer/)
- [Winton + Partners: commercial property website service](https://www.wintonandpartners.com/commercial-property-website-design-and-build/)
- [Appro Digital: marketplace development service](https://appro.digital/services/marketplace-app-development)
- [MVP Builders: directory prospect to evaluate](https://mvpbuilders.co.uk/)

No production content, theme, metadata or account settings were changed during this audit. No backlinks were published and no outreach was sent.
