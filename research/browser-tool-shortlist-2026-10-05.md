# Browser tool research: 100 candidates, 3 selections

Research date: 5 October 2026.

## Scope and evidence

Screened 100 tool concepts using public tool catalogs, current competitor product pages and browser documentation. This is a product and feasibility screen, not hands-on testing of 100 competitor websites. Related features are shown as candidates and explicitly marked Combine where one coherent product is better than separate pages. No paid keyword database, traffic measurements or verified monthly search volumes were available. Suggested queries below are research seeds, not volume claims.

Requirements: local browser processing; no backend, external API, CDN or third-party library; useful file/output rather than an estimate; relevance to people who may commission websites, apps or integrations; avoid duplicating the existing image optimizer.

Audience fit, implementation effort and prioritization are my inferences. Sources in the matrix establish category context, not proof that each site's implementation meets these constraints. A competitor can use libraries or servers even where our proposed scope can be implemented locally.

## The three selections

1. **Website and app screenshot mockup generator.** User supplies screenshots, chooses a browser/phone/tablet frame, arranges them on a background, and downloads PNG/WebP. Local Canvas rendering is sufficient for a focused 2D product. No URL capture, automated responsive testing or AI-generated site design. Original vector frames avoid licensed device-template assets. Closest fit to Gary's actual example, “create real mockups from images”. [Shots](https://shots.so/) confirms the product category; [Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) supports graphics rendering. Expected users: founders, product owners, agencies and designers. Designers may dominate traffic; client conversion is an assumption. Seed queries: website mockup generator, app screenshot mockup, screenshot to device mockup. Suggested route: /tools/website-mockup-generator/.

2. **CSV cleaner and import checker.** Parse local CSV, flag inconsistent columns and duplicate records, offer explicit trim/blank-row fixes, preview changes, and download a cleaned CSV. Start platform-neutral; add narrowly documented product-file checks after verification. [Shopify's documentation](https://help.shopify.com/en/manual/products/import-export/using-csv) establishes an actual import workflow; [MerchantCSV](https://merchantcsv.com/) demonstrates browser-local checks. Browser File APIs and a carefully tested custom parser are enough for a bounded CSV scope; XLSX is excluded. Preserve leading zeros and distinguish valid product variants from duplicates. Do not silently delete records or promise that a file will import successfully. This can connect to migration, dashboards, supplier feeds and integration work. Seed queries: CSV cleaner, remove duplicate rows CSV, CSV import checker. Suggested route: /tools/csv-cleaner/.

3. **Business static QR generator.** Website, existing menu URL, contact card, Wi-Fi or WhatsApp payload into downloadable PNG/SVG, with print-safe margins and contrast. [OpenQR](https://openqr.uk/) and [QRCG's static types](https://support.qr-code-generator.com/hc/en-us/articles/7664248839053-How-can-I-create-a-Static-QR-Code-without-an-account) establish the use cases. No redirect service, analytics, file hosting or editable destination. A static code has no service expiry; its destination can still disappear. Browser does not have a native QR encoder: a custom standards-compliant encoder and scan verification would be required under the no-library constraint. [Nayuki's implementation discussion](https://www.nayuki.io/page/qr-code-generator-library) documents algorithm complexity; it is a research reference, not a proposed dependency. Crowded market and weaker developer-hiring intent make this third. Seed queries: free static QR code generator, QR code for business card, QR code for restaurant menu. Suggested route: /tools/business-qr-generator/.

**Build next: screenshot mockups.** It has the clearest connection to the portfolio, a tangible downloadable result, and a practical native-browser scope. All three work internationally; do not create near-identical UK/London/US pages merely to target locations. Use relevant business examples and accurate service availability.

AI systems with file-processing tools can also perform parts of these jobs. The advantage is a predictable visual workflow, batch handling, local privacy and direct downloads, not an assertion that ChatGPT cannot do them.

## 100-candidate matrix

Native feasibility is assessed for a bounded first version. Reject does not mean the category is impossible: it means it is unsuitable for the current constraints or priority.

| # | Category | Candidate | Decision | Reason | Category reference |
|---|---|---|---|---|---|
| 1 | Image preparation | Batch photo compression | Already added | Existing image optimizer covers this. | [10015 tool catalog](https://10015.io/) |
| 2 | Image preparation | Proportional photo resizing | Existing feature | Add presets to current optimizer instead. | [10015 tool catalog](https://10015.io/) |
| 3 | Image preparation | Raster format conversion | Existing feature | Existing JPG, PNG and WebP output. | [10015 tool catalog](https://10015.io/) |
| 4 | Image preparation | Photo crop editor | Lower priority | Useful, but weak connection to hiring a developer. | [10015 tool catalog](https://10015.io/) |
| 5 | Image preparation | Picture watermark stamp | Lower priority | Business use, but overlaps a crowded image category. | [10015 tool catalog](https://10015.io/) |
| 6 | Image preparation | Image privacy masking | Lower priority | Useful file operation; development leads are indirect. | [10015 tool catalog](https://10015.io/) |
| 7 | Image preparation | Colours sampled from a logo | Lower priority | Likely designer audience rather than commissioning businesses. | [10015 tool catalog](https://10015.io/) |
| 8 | Image preparation | Small website icon pack | Lower priority | Strong website connection; mainly attracts builders. | [10015 tool catalog](https://10015.io/) |
| 9 | Image preparation | Multiple photos into a collage | Lower priority | Broad consumer traffic with weak service fit. | [10015 tool catalog](https://10015.io/) |
| 10 | Image preparation | Image metadata inspection | Lower priority | Niche audience and native parsing effort. | [10015 tool catalog](https://10015.io/) |
| 11 | Presentation assets | Website and app screenshot mockups | SELECTED #1 | Directly connected to showing and commissioning digital products. | [Shots mockup product](https://shots.so/) |
| 12 | Presentation assets | Product photo layout cards | Lower priority | Store use; significant overlap with design editors. | [Shots mockup product](https://shots.so/) |
| 13 | Presentation assets | Screenshots with arrows and callouts | Lower priority | Useful, but broad communication audience. | [Shots mockup product](https://shots.so/) |
| 14 | Presentation assets | Before-and-after image comparison export | Lower priority | Useful supporting feature rather than first standalone page. | [Shots mockup product](https://shots.so/) |
| 15 | Presentation assets | Pitch-deck cover artwork | Lower priority | Large design competition; weak recurring need. | [Shots mockup product](https://shots.so/) |
| 16 | Presentation assets | Social launch announcement graphic | Lower priority | Founders use it, but competes with Canva workflows. | [Shots mockup product](https://shots.so/) |
| 17 | Presentation assets | App store screenshot layout export | Lower priority | Relevant founders; substantial platform-specific design work. | [Shots mockup product](https://shots.so/) |
| 18 | Presentation assets | Browser-window screenshot frame | Combine | Include as one template in the selected mockup tool. | [Shots mockup product](https://shots.so/) |
| 19 | Presentation assets | Phone-screen screenshot frame | Combine | Include as one template in the selected mockup tool. | [Shots mockup product](https://shots.so/) |
| 20 | Presentation assets | Share-image title card | Lower priority | Useful website asset but often a builder task. | [Shots mockup product](https://shots.so/) |
| 21 | Business file operations | CSV cleaning and import preparation | SELECTED #2 | Solves real operations problems and can lead to integrations. | [Browserling data catalog](https://www.browserling.com/tools) |
| 22 | Business file operations | Duplicate spreadsheet-record removal | Combine | Core operation in the selected CSV cleaner. | [Browserling data catalog](https://www.browserling.com/tools) |
| 23 | Business file operations | Two CSV file reconciliation | Later | Useful migration workflow, but harder review interface. | [Browserling data catalog](https://www.browserling.com/tools) |
| 24 | Business file operations | CSV column mapping and reorder | Combine | Include in CSV cleaner after safe parsing is verified. | [Browserling data catalog](https://www.browserling.com/tools) |
| 25 | Business file operations | JSON data into spreadsheet columns | Lower priority | Mostly developer audience. | [Browserling data catalog](https://www.browserling.com/tools) |
| 26 | Business file operations | Spreadsheet records into JSON | Lower priority | Mostly developer audience. | [Browserling data catalog](https://www.browserling.com/tools) |
| 27 | Business file operations | CSV delimiter and encoding inspection | Combine | Part of diagnosing local CSV imports. | [Browserling data catalog](https://www.browserling.com/tools) |
| 28 | Business file operations | Dataset preview with simple charts | Lower priority | Useful, but competes with spreadsheets and dashboards. | [Browserling data catalog](https://www.browserling.com/tools) |
| 29 | Business file operations | CSV chunking into smaller files | Later | Real import pain; useful within the selected data tool. | [Browserling data catalog](https://www.browserling.com/tools) |
| 30 | Business file operations | Duplicate product SKU inspection | Combine | Offer review, never automatically delete valid variant records. | [Browserling data catalog](https://www.browserling.com/tools) |
| 31 | Local website configuration | Heading outline from an HTML file | Lower priority | Requires exported HTML; mainly developer audience. | [Browserling utility catalog](https://www.browserling.com/tools) |
| 32 | Local website configuration | SEO metadata extracted from HTML | Lower priority | Local input works, but advice alone is easy to replace. | [Browserling utility catalog](https://www.browserling.com/tools) |
| 33 | Local website configuration | robots.txt syntax review | Lower priority | Local text can be checked; mainly webmaster audience. | [Browserling utility catalog](https://www.browserling.com/tools) |
| 34 | Local website configuration | XML sitemap file validation | Lower priority | Useful technical operation; weak owner audience fit. | [Browserling utility catalog](https://www.browserling.com/tools) |
| 35 | Local website configuration | Structured-data JSON syntax checker | Lower priority | Syntax validation cannot prove Google rich-result eligibility. | [Browserling utility catalog](https://www.browserling.com/tools) |
| 36 | Local website configuration | Image alt-text inventory from HTML | Lower priority | Inventory only; cannot automatically judge meaningful descriptions. | [Browserling utility catalog](https://www.browserling.com/tools) |
| 37 | Local website configuration | Server redirect rule builder | Lower priority | Infrastructure task; mainly developer audience. | [Browserling utility catalog](https://www.browserling.com/tools) |
| 38 | Local website configuration | Uploaded HTML layout preview | Lower priority | Sandbox required; cannot test an arbitrary live website. | [Browserling utility catalog](https://www.browserling.com/tools) |
| 39 | Local website configuration | Calendar event file export | Lower priority | Real artifact but little connection to development services. | [Browserling utility catalog](https://www.browserling.com/tools) |
| 40 | Local website configuration | Contact card file export | Lower priority | Useful for businesses; better as a QR payload option. | [Browserling utility catalog](https://www.browserling.com/tools) |
| 41 | Business marketing utilities | Branded static QR code export | SELECTED #3 | Local business owners need a usable downloadable artifact. | [OpenQR product](https://openqr.uk/) |
| 42 | Business marketing utilities | Campaign tracking URL builder | Lower priority | Good marketers, but simple text task and crowded category. | [OpenQR product](https://openqr.uk/) |
| 43 | Business marketing utilities | WhatsApp contact URL builder | Combine | Use as a static QR payload rather than a separate page. | [OpenQR product](https://openqr.uk/) |
| 44 | Business marketing utilities | Email signature layout editor | Lower priority | Real output; mail-client compatibility needs careful testing. | [OpenQR product](https://openqr.uk/) |
| 45 | Business marketing utilities | Quotation document with print export | Lower priority | Business audience, but broad and already well served. | [OpenQR product](https://openqr.uk/) |
| 46 | Business marketing utilities | Invoice document with print export | Lower priority | Business audience; country-specific requirements complicate positioning. | [OpenQR product](https://openqr.uk/) |
| 47 | Business marketing utilities | Brand asset handoff sheet | Lower priority | Good downloadable output; designers dominate likely audience. | [OpenQR product](https://openqr.uk/) |
| 48 | Business marketing utilities | Meeting overlap time-zone viewer | Lower priority | UK/US remote relevance; weak buying intent. | [OpenQR product](https://openqr.uk/) |
| 49 | Business marketing utilities | Link sticker artwork for business signs | Combine | Useful print layout option in the static QR tool. | [OpenQR product](https://openqr.uk/) |
| 50 | Business marketing utilities | Printable business contact card layout | Combine | Useful vCard QR wrapper rather than a fourth tool. | [OpenQR product](https://openqr.uk/) |
| 51 | Visual design checks | Text and background contrast checker | Lower priority | Actual measurement but mainly attracts designers and developers. | [10015 tool catalog](https://10015.io/) |
| 52 | Visual design checks | Contrast-tested palette preview | Lower priority | Mostly design audience. | [10015 tool catalog](https://10015.io/) |
| 53 | Visual design checks | Responsive typography scale sandbox | Lower priority | Developer-focused task. | [10015 tool catalog](https://10015.io/) |
| 54 | Visual design checks | CSS gradient preview and export | Lower priority | Developer traffic and strong existing competition. | [10015 tool catalog](https://10015.io/) |
| 55 | Visual design checks | CSS shadow preview and export | Lower priority | Developer traffic and simple output. | [10015 tool catalog](https://10015.io/) |
| 56 | Visual design checks | Grid layout CSS sandbox | Lower priority | Technical audience instead of business buyers. | [10015 tool catalog](https://10015.io/) |
| 57 | Visual design checks | Vector pattern drawing export | Lower priority | Design asset; indirect development intent. | [10015 tool catalog](https://10015.io/) |
| 58 | Visual design checks | Animation timing-curve sandbox | Lower priority | Narrow developer audience. | [10015 tool catalog](https://10015.io/) |
| 59 | Visual design checks | Responsive CSS size expression builder | Lower priority | Developer audience and easy chat-generated output. | [10015 tool catalog](https://10015.io/) |
| 60 | Visual design checks | Colour format conversion panel | Lower priority | Useful but weak lead qualification. | [10015 tool catalog](https://10015.io/) |
| 61 | Text and list operations | Two-text change comparison | Lower priority | Useful but broad and highly commoditized. | [Browserling utility catalog](https://www.browserling.com/tools) |
| 62 | Text and list operations | Regex example tester | Lower priority | Mostly programmers. | [Browserling utility catalog](https://www.browserling.com/tools) |
| 63 | Text and list operations | Repeated text-line cleanup | Lower priority | Better inside CSV cleanup for relevant business tasks. | [Browserling utility catalog](https://www.browserling.com/tools) |
| 64 | Text and list operations | Document word and character counts | Lower priority | Broad users; weak intent to hire. | [Browserling utility catalog](https://www.browserling.com/tools) |
| 65 | Text and list operations | Heading capitalization cleanup | Lower priority | Simple advice/text transformation. | [Browserling utility catalog](https://www.browserling.com/tools) |
| 66 | Text and list operations | URL slug normalization | Lower priority | Mostly content teams; simple text output. | [Browserling utility catalog](https://www.browserling.com/tools) |
| 67 | Text and list operations | Local batch filename normalization | Later | Actual files, but weaker lead fit than mockups and CSV. | [Browserling utility catalog](https://www.browserling.com/tools) |
| 68 | Text and list operations | Email-like strings extracted from a file | Lower priority | Cannot validate whether mailboxes exist. | [Browserling utility catalog](https://www.browserling.com/tools) |
| 69 | Text and list operations | Natural sorting of a list | Lower priority | Small generic transformation. | [Browserling utility catalog](https://www.browserling.com/tools) |
| 70 | Text and list operations | Word-frequency visual export | Lower priority | Useful visualization, but broad student/content audience. | [Browserling utility catalog](https://www.browserling.com/tools) |
| 71 | Document processing | Combine existing PDF documents | Reject for current constraints | No general native browser PDF editing API; custom parser impractical. | [PDF24 catalog](https://tools.pdf24.org/en/all-tools) |
| 72 | Document processing | Extract selected PDF pages | Reject for current constraints | Needs a robust PDF parser and serializer. | [PDF24 catalog](https://tools.pdf24.org/en/all-tools) |
| 73 | Document processing | Recompress an existing PDF | Reject for current constraints | Needs document decoding and codec support beyond a small native tool. | [PDF24 catalog](https://tools.pdf24.org/en/all-tools) |
| 74 | Document processing | Edit text in a PDF | Reject for current constraints | Complex font, layout and document-format handling. | [PDF24 catalog](https://tools.pdf24.org/en/all-tools) |
| 75 | Document processing | Apply drawn signatures to PDFs | Reject for current constraints | Existing PDF editing requires a parser; not cryptographic signing. | [PDF24 catalog](https://tools.pdf24.org/en/all-tools) |
| 76 | Document processing | Populate existing PDF forms | Reject for current constraints | Needs PDF field parsing and serialization. | [PDF24 catalog](https://tools.pdf24.org/en/all-tools) |
| 77 | Document processing | Redact existing PDF contents | Reject for current constraints | Must remove underlying data; visual overlays are insufficient. | [PDF24 catalog](https://tools.pdf24.org/en/all-tools) |
| 78 | Document processing | PDF page rotation | Reject for current constraints | General PDF manipulation requires custom document parsing. | [PDF24 catalog](https://tools.pdf24.org/en/all-tools) |
| 79 | Document processing | PDF pages rendered as images | Reject for current constraints | Browser PDF viewer exposes no portable rasterization API. | [PDF24 catalog](https://tools.pdf24.org/en/all-tools) |
| 80 | Document processing | PDF content exported into editable text | Reject for current constraints | No portable native extraction API; OCR needs further infrastructure. | [PDF24 catalog](https://tools.pdf24.org/en/all-tools) |
| 81 | Developer and security helpers | Cryptographically random password creation | Lower priority | Native crypto works; audience is broad and low intent. | [CyberChef project](https://gchq.github.io/CyberChef/) |
| 82 | Developer and security helpers | Local file SHA-256 checksum | Lower priority | Useful native crypto task; mainly technical users. | [CyberChef project](https://gchq.github.io/CyberChef/) |
| 83 | Developer and security helpers | JWT payload inspection | Lower priority | Mostly developers; decoding is not signature verification. | [CyberChef project](https://gchq.github.io/CyberChef/) |
| 84 | Developer and security helpers | Random identifier generation | Lower priority | Very small task with weak buyer intent. | [CyberChef project](https://gchq.github.io/CyberChef/) |
| 85 | Developer and security helpers | URL percent-encoding utility | Lower priority | Simple programmer task. | [CyberChef project](https://gchq.github.io/CyberChef/) |
| 86 | Developer and security helpers | Base64 file encoding utility | Lower priority | Simple programmer task. | [CyberChef project](https://gchq.github.io/CyberChef/) |
| 87 | Developer and security helpers | HTML entity escaping utility | Lower priority | Simple programmer task. | [CyberChef project](https://gchq.github.io/CyberChef/) |
| 88 | Developer and security helpers | JavaScript source prettification | Reject for first shortlist | Correct parsing needs substantial custom language handling. | [CyberChef project](https://gchq.github.io/CyberChef/) |
| 89 | Developer and security helpers | CSS whitespace reduction | Lower priority | Correct transforms need syntax-aware handling; developer audience. | [CyberChef project](https://gchq.github.io/CyberChef/) |
| 90 | Developer and security helpers | JSON document formatting and syntax validation | Lower priority | Native parsing works, but audience is mostly developers. | [CyberChef project](https://gchq.github.io/CyberChef/) |
| 91 | Remote analysis and hosted services | Live website broken-link crawler | Reject | Arbitrary cross-origin fetching requires remote infrastructure. | [Semrush SEO toolkit](https://www.semrush.com/seo/) |
| 92 | Remote analysis and hosted services | Live URL screenshot capture | Reject | Browser cannot silently render and capture arbitrary remote websites. | [Semrush SEO toolkit](https://www.semrush.com/seo/) |
| 93 | Remote analysis and hosted services | Whole-site SEO scan | Reject | Reliable crawling needs remote infrastructure. | [Semrush SEO toolkit](https://www.semrush.com/seo/) |
| 94 | Remote analysis and hosted services | Domain authority reporting | Reject | Requires a proprietary external link dataset. | [Semrush SEO toolkit](https://www.semrush.com/seo/) |
| 95 | Remote analysis and hosted services | Backlink inventory | Reject | Requires an external crawl dataset. | [Semrush SEO toolkit](https://www.semrush.com/seo/) |
| 96 | Remote analysis and hosted services | Keyword search-volume lookup | Reject | Requires external data; cannot fabricate volumes. | [Semrush SEO toolkit](https://www.semrush.com/seo/) |
| 97 | Remote analysis and hosted services | Search ranking monitor | Reject | Needs search-result access, scheduling and persistent storage. | [Semrush SEO toolkit](https://www.semrush.com/seo/) |
| 98 | Remote analysis and hosted services | AI object/background extraction | Reject for current constraints | Needs model assets/runtime or a service; not simple native processing. | [Semrush SEO toolkit](https://www.semrush.com/seo/) |
| 99 | Remote analysis and hosted services | Short URL hosting | Reject | Needs persistent redirect storage and hosting logic. | [Semrush SEO toolkit](https://www.semrush.com/seo/) |
| 100 | Remote analysis and hosted services | Editable QR destinations with scan analytics | Reject | Requires hosted redirects and event storage. | [Semrush SEO toolkit](https://www.semrush.com/seo/) |

## Technical and deeper research sources

- [MDN File API](https://developer.mozilla.org/en-US/docs/Web/API/File_API): access to explicitly selected local files.
- [MDN Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API): native rendering for mockups and raster exports.
- [web.dev same-origin policy](https://web.dev/articles/same-origin-policy): restrictions on reading remote pages and iframes.
- [web.dev security headers](https://web.dev/articles/security-headers): sites can prohibit iframe embedding.
- [Shopify product CSV documentation](https://help.shopify.com/en/manual/products/import-export/using-csv): format and product/variant context.
- [MerchantCSV](https://merchantcsv.com/): local product-import checking competitor.
- [JAD CSV Cleaner](https://jadapps.app/tool/csv-cleaner): local cleanup competitor.
- [CSV Cleaner](https://csv-cleaner.com/): competitor workflow; its page says server-side processing, so we would not use that architecture.
- [Shots](https://shots.so/): screenshot/device mockup product category.
- [OpenQR](https://openqr.uk/): static business QR category.
- [Nayuki QR implementation notes](https://www.nayuki.io/page/qr-code-generator-library): encoding complexity, not a dependency proposal.
- [RealFaviconGenerator](https://realfavicongenerator.net/): reviewed alternative; builder-heavy audience limits priority.
- [PDF24 FAQ](https://tools.pdf24.org/en/faq): local desktop processing and hosted web processing must not be confused.
- [remove.bg API](https://www.remove.bg/a/api-docs): reviewed cloud alternative, excluded from our implementation constraints.

No site code was changed as part of this research. The ordering reflects fit and feasible scope, not measured SEO difficulty or a promise of traffic.

