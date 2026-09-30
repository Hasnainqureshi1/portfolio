(() => {
  // Create a free key in Google Cloud (PageSpeed Insights API) and restrict it to
  // this website's address. Without a key, requests share a public quota that is
  // often used up.
  const PSI_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
  const CATEGORIES = ["performance", "seo", "accessibility", "best-practices"];
  const REQUEST_TIMEOUT = 100000;
  const MAX_ISSUES = 8;

  const form = document.querySelector("#health-check-form");
  if (!form) return;
  const $ = (selector) => document.querySelector(selector);
  const urlField = $("#check-url");
  const submit = $("#check-submit");
  const progressBox = $("#check-progress");
  const progressStep = $("#check-progress-step");
  const progressTime = $("#check-progress-time");
  const errorBox = $("#check-error");
  const results = $("#check-results");
  const reportStatus = $("#report-status");

  const track = (name, detail = {}) => {
    if (typeof window.gtag === "function") window.gtag("event", name, { tool: "website-health-check", ...detail });
  };

  // Plain-English explanations. Several Lighthouse audits (old and new names) share one explanation.
  const IMPACT_RANK = { high: 3, medium: 2, low: 1 };
  const EXPLAIN = [
    { ids: ["is-crawlable"], impact: "high", title: "Search engines are told not to index this page", why: "A noindex tag or header keeps this page out of Google results. If that is not deliberate, it is the first thing to fix." },
    { ids: ["http-status-code"], impact: "high", title: "The page returns an error status", why: "Search engines may not index a page that reports an error, even if it looks fine in a browser." },
    { ids: ["document-title"], impact: "high", title: "The page has no title", why: "The title is the blue link people click in search results and the name on the browser tab." },
    { ids: ["viewport", "viewport-insight"], impact: "high", title: "The page is not set up for phone screens", why: "Visitors may need to zoom and scroll sideways, and taps can be delayed. Google primarily uses the mobile version of a page." },
    { ids: ["is-on-https"], impact: "high", title: "Some content loads over an insecure connection", why: "Browsers may block those files or warn visitors, which undermines trust on enquiry and payment pages." },
    { ids: ["image-delivery-insight", "uses-optimized-images", "modern-image-formats", "uses-responsive-images", "offscreen-images", "efficient-animated-content"], title: "Images are larger than they need to be", why: "Visitors on mobile data download more before they see the page. Resizing, compressing and lazy-loading images is usually one of the quickest improvements." },
    { ids: ["render-blocking-insight", "render-blocking-resources"], title: "Some files delay the first view of the page", why: "The browser waits for these stylesheets or scripts before showing anything, so visitors look at a blank screen for longer." },
    { ids: ["document-latency-insight", "server-response-time", "redirects", "uses-text-compression"], title: "The server is slow to send the page", why: "Every other step waits for the first response. Hosting, caching, redirects and compression usually decide this." },
    { ids: ["lcp-discovery-insight", "lcp-breakdown-insight", "prioritize-lcp-image", "lcp-lazy-loaded", "largest-contentful-paint-element"], title: "The main image or heading appears late", why: "This is the moment the page looks ready. When it is late, visitors wait and some leave before it appears." },
    { ids: ["unused-javascript", "unused-css-rules", "legacy-javascript-insight", "legacy-javascript", "duplicated-javascript-insight", "duplicated-javascript", "unminified-javascript", "unminified-css", "total-byte-weight"], title: "The page downloads code it does not use", why: "Themes, page builders and plugins often load everything on every page. Trimming it makes pages lighter and faster on phones." },
    { ids: ["mainthread-work-breakdown", "bootup-time", "long-tasks", "forced-reflow-insight", "dom-size-insight", "dom-size", "inp-breakdown-insight"], title: "The phone has too much work to do", why: "Heavy scripts and very large pages keep the browser busy, so taps, menus and forms feel slow to respond." },
    { ids: ["third-parties-insight", "third-party-summary", "third-party-facades"], title: "Third-party scripts slow the page", why: "Chat widgets, trackers, embedded videos and ad tags run on your visitors' devices. Each one should earn its place." },
    { ids: ["cls-culprits-insight", "unsized-images", "layout-shifts", "non-composited-animations"], title: "Content jumps around while loading", why: "When the layout shifts, visitors lose their place or tap the wrong thing. Setting sizes for images and embeds usually fixes it." },
    { ids: ["cache-insight", "uses-long-cache-ttl"], title: "Returning visitors download files again", why: "Files that rarely change can be stored by the browser, so second and later visits are much faster." },
    { ids: ["font-display-insight", "font-display"], title: "Text is hidden while fonts load", why: "Visitors see blank space where text should be until the web font arrives." },
    { ids: ["network-dependency-tree-insight", "critical-request-chains", "uses-rel-preconnect"], impact: "low", title: "Files load one after another", why: "Some important files are only found after others finish downloading. Loading them earlier shortens the wait." },
    { ids: ["modern-http-insight", "uses-http2"], impact: "low", title: "The server uses an older connection method", why: "Newer protocols let the browser download many files at once. This is usually a hosting or CDN setting." },
    { ids: ["bf-cache"], impact: "low", title: "The back button reloads the page", why: "Visitors who go back to this page wait for it to load again instead of seeing it instantly." },
    { ids: ["meta-description"], impact: "medium", title: "No description for search results", why: "Google may pick random text from the page for your search snippet, which can reduce clicks." },
    { ids: ["crawlable-anchors"], impact: "medium", title: "Some links cannot be followed by search engines", why: "Pages reached only through these links may not be discovered or indexed." },
    { ids: ["link-text"], impact: "low", title: "Links use vague text like \"click here\"", why: "Descriptive link text helps visitors and search engines understand where a link goes." },
    { ids: ["canonical", "hreflang", "robots-txt"], impact: "medium", title: "Search setup files or tags have errors", why: "Invalid canonical, language or robots settings can send search engines to the wrong page or none at all." },
    { ids: ["image-alt"], impact: "medium", title: "Images have no text description", why: "Screen reader users hear nothing useful, and search engines have less to understand the image by." },
    { ids: ["label", "select-name", "input-button-name"], impact: "medium", title: "Form fields have no labels", why: "Forms are harder to complete, particularly with assistive technology. On a contact form that can cost enquiries." },
    { ids: ["button-name", "link-name"], impact: "medium", title: "Some buttons or links have no readable name", why: "Screen readers announce them as just \"button\" or \"link\", so visitors cannot tell what they do." },
    { ids: ["color-contrast"], impact: "medium", title: "Some text is hard to read", why: "Low contrast text is difficult to read outdoors on a phone and for people with low vision." },
    { ids: ["target-size", "tap-targets"], impact: "medium", title: "Buttons or links are too small to tap easily", why: "Visitors on phones tap the wrong thing or have to zoom in." },
    { ids: ["font-size"], impact: "medium", title: "Text is too small on phones", why: "Visitors have to zoom to read the page." },
    { ids: ["html-has-lang", "html-lang-valid"], impact: "low", title: "The page language is not declared", why: "Screen readers and translation tools may use the wrong pronunciation or language." },
    { ids: ["errors-in-console"], impact: "medium", title: "The page reports JavaScript errors", why: "Something on the page may be broken for some visitors, such as a menu, slider or form." },
    { ids: ["image-aspect-ratio", "image-size-responsive"], impact: "low", title: "Some images look stretched or blurry", why: "Distorted or low-resolution images make a site feel less polished." },
    { ids: ["deprecations", "inspector-issues", "third-party-cookies"], impact: "low", title: "The page uses features browsers are phasing out", why: "These may stop working in future browser versions." }
  ];
  const EXPLAIN_BY_ID = new Map();
  EXPLAIN.forEach((entry, index) => entry.ids.forEach((id) => EXPLAIN_BY_ID.set(id, { ...entry, key: `plain-${index}` })));

  const PASS_LABELS = {
    "document-title": "Page has a title",
    "meta-description": "Page has a search description",
    "is-crawlable": "Search engines may index the page",
    "http-status-code": "Page returns a success status",
    "is-on-https": "All content loads securely",
    "viewport": "Set up for phone screens",
    "crawlable-anchors": "Links can be followed by search engines",
    "image-alt": "Images have text descriptions",
    "label": "Form fields have labels",
    "color-contrast": "Text has enough contrast",
    "html-has-lang": "Page language is declared",
    "errors-in-console": "No JavaScript errors reported",
    "cumulative-layout-shift": "Layout stays stable while loading"
  };

  const SCORE_INFO = {
    performance: ["Speed", "How quickly the page appears and responds in this test."],
    seo: ["Search basics", "Technical checks search engines rely on. Not a ranking prediction."],
    accessibility: ["Accessibility", "Automated checks for visitors using assistive technology."],
    "best-practices": ["Best practices", "Security, errors and browser compatibility."]
  };

  const LAB_METRICS = [
    ["largest-contentful-paint", "Main content visible", "When the largest image or text block appeared."],
    ["first-contentful-paint", "First content visible", "When anything first appeared on screen."],
    ["total-blocking-time", "Time blocked from responding", "How long the page could not react to taps while loading."],
    ["cumulative-layout-shift", "Layout movement", "How much content jumped around. Lower is better."],
    ["speed-index", "Visual loading speed", "How quickly the visible area filled in."]
  ];

  const FIELD_METRICS = [
    ["LARGEST_CONTENTFUL_PAINT_MS", "Main content visible", "ms"],
    ["INTERACTION_TO_NEXT_PAINT", "Response to taps and clicks", "ms"],
    ["CUMULATIVE_LAYOUT_SHIFT_SCORE", "Layout movement", "cls"],
    ["FIRST_CONTENTFUL_PAINT_MS", "First content visible", "ms"]
  ];
  const FIELD_RATING = { FAST: ["good", "Good"], AVERAGE: ["average", "Needs improvement"], SLOW: ["poor", "Poor"] };

  const ratingFromScore = (score) => (score >= 0.9 ? "good" : score >= 0.5 ? "average" : "poor");
  const RATING_TEXT = { good: "Good", average: "Needs improvement", poor: "Poor" };
  const plainText = (markdown = "") => markdown.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/`/g, "").trim();
  const formatMs = (ms) => (ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${Math.round(ms)} ms`);
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const normaliseUrl = (raw) => {
    let value = raw.trim();
    if (!value) throw new Error("Enter the address of the page you want to check.");
    if (!/^https?:\/\//i.test(value)) value = `https://${value}`;
    let url;
    try { url = new URL(value); } catch { throw new Error("That does not look like a web address. Try something like yourcompany.com."); }
    const host = url.hostname;
    if (!host.includes(".") || /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)) {
      throw new Error("Enter a public website address. Local and private addresses cannot be tested.");
    }
    url.hash = "";
    return url.href;
  };

  const issueImpact = (audit, plain, ref) => {
    if (plain && plain.impact) return plain.impact;
    const savings = audit.metricSavings || {};
    const ms = (savings.LCP || 0) + (savings.FCP || 0) / 2 + (savings.TBT || 0) + (savings.INP || 0);
    if (ms >= 1000 || (savings.CLS || 0) >= 0.1) return "high";
    if (ms >= 300 || (savings.CLS || 0) >= 0.05) return "medium";
    if (ref.weight >= 7) return "medium";
    return audit.score === 0 && ms > 0 ? "medium" : "low";
  };

  const collectIssues = (lhr) => {
    const merged = new Map();
    CATEGORIES.forEach((categoryId) => {
      const category = lhr.categories[categoryId];
      if (!category) return;
      category.auditRefs.forEach((ref) => {
        if (categoryId === "performance" && !["insights", "diagnostics"].includes(ref.group)) return;
        if (ref.group === "hidden") return;
        const audit = lhr.audits[ref.id];
        if (!audit || audit.score === null || audit.score >= 0.9) return;
        if (["informative", "notApplicable", "manual", "error"].includes(audit.scoreDisplayMode)) return;
        const plain = EXPLAIN_BY_ID.get(ref.id);
        const key = plain ? plain.key : ref.id;
        const impact = issueImpact(audit, plain, ref);
        const savingsMs = Object.entries(audit.metricSavings || {}).reduce((sum, [metric, value]) => sum + (metric === "CLS" ? value * 10000 : value || 0), 0);
        const existing = merged.get(key);
        const technical = `${plainText(audit.title)}${audit.displayValue ? ` (${audit.displayValue})` : ""}`;
        if (existing) {
          if (IMPACT_RANK[impact] > IMPACT_RANK[existing.impact]) existing.impact = impact;
          existing.sortWeight = Math.max(existing.sortWeight, savingsMs + ref.weight * 100);
          if (!existing.technical.includes(technical)) existing.technical.push(technical);
          return;
        }
        merged.set(key, {
          area: SCORE_INFO[categoryId][0],
          impact,
          title: plain ? plain.title : audit.title,
          why: plain ? plain.why : plainText(audit.description).replace(/\s*Learn more.*$/i, ""),
          technical: [technical],
          sortWeight: savingsMs + ref.weight * 100
        });
      });
    });
    return [...merged.values()].sort((a, b) => IMPACT_RANK[b.impact] - IMPACT_RANK[a.impact] || b.sortWeight - a.sortWeight);
  };

  const fieldData = (data) => {
    const page = data.loadingExperience;
    const origin = data.originLoadingExperience;
    if (page && page.metrics && Object.keys(page.metrics).length) return { source: page.origin_fallback ? "origin" : "page", experience: page };
    if (origin && origin.metrics && Object.keys(origin.metrics).length) return { source: "origin", experience: origin };
    return null;
  };

  let report = null;
  const cache = new Map();

  const analyse = (data, url, strategy) => {
    const lhr = data.lighthouseResult;
    const scores = CATEGORIES.filter((id) => lhr.categories[id]).map((id) => ({ id, score: lhr.categories[id].score, name: SCORE_INFO[id][0], hint: SCORE_INFO[id][1] }));
    const issues = collectIssues(lhr);
    const lab = LAB_METRICS.filter(([id]) => lhr.audits[id] && lhr.audits[id].displayValue).map(([id, name, hint]) => ({ name, hint, value: lhr.audits[id].displayValue, rating: ratingFromScore(lhr.audits[id].score) }));
    const field = fieldData(data);
    const fieldMetrics = field ? FIELD_METRICS.filter(([key]) => field.experience.metrics[key]).map(([key, name, unit]) => {
      const metric = field.experience.metrics[key];
      const [rating, label] = FIELD_RATING[metric.category] || ["", "No rating"];
      return { name, value: unit === "cls" ? (metric.percentile / 100).toFixed(2) : formatMs(metric.percentile), rating, label };
    }) : [];
    const passed = Object.entries(PASS_LABELS).filter(([id]) => lhr.audits[id] && lhr.audits[id].score !== null && lhr.audits[id].score >= 0.9).map(([, label]) => label);
    const shot = lhr.audits["final-screenshot"] && lhr.audits["final-screenshot"].details && lhr.audits["final-screenshot"].details.data;
    const perf = lhr.categories.performance ? lhr.categories.performance.score : null;
    const device = strategy === "mobile" ? "on a phone" : "on desktop";
    const blocked = issues.find((issue) => issue.title === EXPLAIN_BY_ID.get("is-crawlable").title);
    let headline;
    if (blocked) headline = "Search engines are blocked from this page.";
    else if (perf === null) headline = "Here is what the check found.";
    else if (perf < 0.5) headline = `This page is slow ${device}.`;
    else if (perf < 0.9) headline = `This page works, but could be faster ${device}.`;
    else headline = `This page is fast ${device}.`;
    const high = issues.filter((issue) => issue.impact === "high").length;
    const lead = issues.length
      ? `${issues.length} ${issues.length === 1 ? "issue" : "issues"} worth fixing${high ? `, ${high} of them high impact` : ""}. Start with: ${issues[0].title.charAt(0).toLowerCase()}${issues[0].title.slice(1)}.`
      : "No significant issues were found in this test. Keep an eye on the real-visitor data over time.";
    return { url, finalUrl: lhr.finalDisplayedUrl || lhr.finalUrl || url, strategy, fetchedAt: lhr.fetchTime ? new Date(lhr.fetchTime) : new Date(), scores, issues, lab, field, fieldMetrics, passed, shot, headline, lead };
  };

  const renderResults = (r) => {
    $("#result-meta").textContent = `${r.strategy === "mobile" ? "Mobile" : "Desktop"} test / ${r.finalUrl}`;
    $("#result-title").textContent = r.headline;
    $("#result-lead").textContent = r.lead;
    $("#report-switch").textContent = r.strategy === "mobile" ? "Test on desktop instead" : "Test on mobile instead";

    const shotFigure = $("#result-shot");
    if (r.shot) {
      $("#result-shot-img").src = r.shot;
      $("#result-shot-img").alt = `Screenshot of ${r.finalUrl} at the end of the ${r.strategy} test`;
      shotFigure.hidden = false;
    } else shotFigure.hidden = true;

    $("#score-grid").replaceChildren(...r.scores.map((s) => {
      const card = el("div", `score-card is-${ratingFromScore(s.score)}`);
      card.append(el("span", "score-card-value", String(Math.round(s.score * 100))), el("span", "score-card-label", s.name), el("p", "", s.hint));
      return card;
    }));

    const fieldGrid = $("#field-grid");
    if (r.fieldMetrics.length) {
      $("#field-intro").textContent = r.field.source === "origin"
        ? "Chrome users over the last 28 days. There is not enough data for this exact page, so this covers your whole site. 75% of visits were at or better than these values."
        : "Chrome users on this page over the last 28 days. 75% of visits were at or better than these values.";
      fieldGrid.replaceChildren(...r.fieldMetrics.map((m) => {
        const card = el("div", `metric-card is-${m.rating}`);
        card.append(el("p", "metric-card-name", m.name), el("p", "metric-card-value", m.value), el("p", "metric-card-rating", m.label));
        return card;
      }));
    } else {
      $("#field-intro").textContent = "Google does not have enough Chrome visitor data for this site yet, which is common for smaller or newer websites. The test results below still apply.";
      fieldGrid.replaceChildren();
    }

    $("#lab-grid").replaceChildren(...r.lab.map((m) => {
      const card = el("div", `metric-card is-${m.rating}`);
      card.append(el("p", "metric-card-name", m.name), el("p", "metric-card-value", m.value), el("p", "metric-card-rating", RATING_TEXT[m.rating]), el("p", "metric-card-hint", m.hint));
      return card;
    }));

    const shown = r.issues.slice(0, MAX_ISSUES);
    const hiddenCount = r.issues.length - shown.length;
    $("#issues-intro").textContent = r.issues.length
      ? `Ordered by likely impact on visitors.${hiddenCount > 0 ? ` ${hiddenCount} smaller ${hiddenCount === 1 ? "item is" : "items are"} included in the downloaded report.` : ""}`
      : "Nothing significant to fix in this test.";
    $("#issue-list").replaceChildren(...shown.map((issue) => {
      const item = el("li", `issue-item is-${issue.impact === "high" ? "poor" : issue.impact === "medium" ? "average" : "good"}`);
      const body = el("div");
      const meta = el("p", "issue-meta");
      meta.append(el("span", "issue-impact", `${issue.impact === "high" ? "High" : issue.impact === "medium" ? "Medium" : "Low"} impact`), el("span", "", issue.area));
      body.append(meta, el("h4", "", issue.title), el("p", "", issue.why), el("p", "issue-technical", `Technical detail: ${issue.technical.join("; ")}`));
      item.append(body);
      return item;
    }));

    $("#passed-block").hidden = !r.passed.length;
    $("#passed-list").replaceChildren(...r.passed.map((label) => el("li", "", label)));
  };

  const reportText = (r) => {
    const lines = [
      `WEBSITE HEALTH CHECK - ${r.finalUrl}`,
      `${r.strategy === "mobile" ? "Mobile" : "Desktop"} test, ${r.fetchedAt.toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" })}`,
      "",
      r.headline,
      r.lead,
      "",
      "SCORES (out of 100)",
      ...r.scores.map((s) => `  ${s.name}: ${Math.round(s.score * 100)}`),
      "",
      "REAL VISITORS (Chrome, last 28 days)"
    ];
    if (r.fieldMetrics.length) {
      if (r.field.source === "origin") lines.push("  Whole-site data (not enough for this page)");
      r.fieldMetrics.forEach((m) => lines.push(`  ${m.name}: ${m.value} (${m.label})`));
    } else lines.push("  Not enough data available");
    lines.push("", "THIS TEST", ...r.lab.map((m) => `  ${m.name}: ${m.value} (${RATING_TEXT[m.rating]})`));
    lines.push("", "WHAT TO FIX FIRST");
    if (r.issues.length) {
      r.issues.forEach((issue, i) => {
        lines.push(`  ${i + 1}. [${issue.impact.toUpperCase()}] ${issue.title} (${issue.area})`, `     ${issue.why}`, `     Technical: ${issue.technical.join("; ")}`);
      });
    } else lines.push("  No significant issues found");
    if (r.passed.length) lines.push("", "ALREADY IN GOOD SHAPE", ...r.passed.map((p) => `  - ${p}`));
    lines.push("", "Results from Google Lighthouse via PageSpeed Insights, explained at https://hasnainqureshi.online/tools/website-health-check/");
    return lines.join("\n");
  };

  // Running a check
  const STEPS = [[0, "Loading the page on a test device..."], [8, "Measuring how quickly the main content appears..."], [18, "Checking search basics and accessibility..."], [30, "Putting the results together..."], [50, "Some pages take longer. Still working..."]];
  let progressTimer;
  const startProgress = () => {
    const started = Date.now();
    progressBox.hidden = false;
    const tick = () => {
      const seconds = Math.floor((Date.now() - started) / 1000);
      progressStep.textContent = STEPS.filter(([at]) => seconds >= at).pop()[1];
      progressTime.textContent = `${seconds} seconds`;
    };
    tick();
    progressTimer = setInterval(tick, 1000);
  };
  const stopProgress = () => { clearInterval(progressTimer); progressBox.hidden = true; };

  const showError = (message, url) => {
    errorBox.replaceChildren(document.createTextNode(message));
    if (url) {
      errorBox.append(document.createTextNode(" You can also run the test on "));
      const link = el("a", "", "Google PageSpeed Insights");
      link.href = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(url)}`;
      link.target = "_blank";
      link.rel = "noopener";
      errorBox.append(link, document.createTextNode("."));
    }
    errorBox.hidden = false;
  };

  const explainApiError = (status, message = "") => {
    if (status === 429) return ["quota", "The free testing limit has been reached for now. Please try again later."];
    if (/FAILED_DOCUMENT_REQUEST|ERRORED_DOCUMENT_REQUEST|DNS_FAILURE|NOT_HTML|INSECURE_DOCUMENT_REQUEST/i.test(message)) return ["unreachable", "Google could not load that page. Check the address is correct and publicly available."];
    if (/NO_FCP|NO_LCP|PAGE_HUNG/i.test(message)) return ["no-render", "The page did not display anything during the test. It may block automated visitors or take too long to load."];
    if (/timed out|timeout/i.test(message)) return ["timeout", "The test took too long to finish. Try again, as slow pages sometimes pass on a second attempt."];
    return ["api", "The check could not be completed. Please try again in a minute."];
  };

  let running = false;
  const runCheck = async (url, strategy) => {
    if (running) return;
    const cacheKey = `${strategy}|${url}`;
    const cached = cache.get(cacheKey);
    errorBox.hidden = true;
    if (cached && Date.now() - cached.at < 10 * 60 * 1000) {
      report = cached.report;
      renderResults(report);
      results.hidden = false;
      results.focus();
      return;
    }
    running = true;
    submit.disabled = true;
    form.setAttribute("aria-busy", "true");
    results.hidden = true;
    startProgress();
    track("check_start", { strategy });
    const params = new URLSearchParams({ url, strategy });
    CATEGORIES.forEach((category) => params.append("category", category));
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    try {
      const response = await fetch(`${PSI_ENDPOINT}?${params}`, { signal: controller.signal });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.lighthouseResult) {
        const [reason, message] = explainApiError(response.status, data.error && data.error.message);
        track("check_error", { reason, strategy });
        showError(message, url);
        return;
      }
      report = analyse(data, url, strategy);
      cache.set(cacheKey, { at: Date.now(), report });
      renderResults(report);
      results.hidden = false;
      results.focus();
      track("check_complete", { strategy, performance_score: Math.round((report.scores.find((s) => s.id === "performance") || { score: 0 }).score * 100), issue_count: report.issues.length });
    } catch (error) {
      const reason = error.name === "AbortError" ? "timeout" : "network";
      track("check_error", { reason, strategy });
      showError(reason === "timeout" ? "The test took too long to finish. Try again, as slow pages sometimes pass on a second attempt." : "The check could not reach Google. Check your connection and try again.", url);
    } finally {
      clearTimeout(timeout);
      stopProgress();
      running = false;
      submit.disabled = false;
      form.removeAttribute("aria-busy");
    }
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let url;
    try { url = normaliseUrl(urlField.value); } catch (error) { showError(error.message); urlField.focus(); return; }
    urlField.value = url;
    runCheck(url, form.elements.strategy.value);
  });

  $("#report-switch").addEventListener("click", () => {
    if (!report) return;
    const strategy = report.strategy === "mobile" ? "desktop" : "mobile";
    form.querySelector(`input[name="strategy"][value="${strategy}"]`).checked = true;
    runCheck(report.url, strategy);
  });

  $("#report-copy").addEventListener("click", async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(reportText(report));
      reportStatus.textContent = "Report copied.";
    } catch {
      reportStatus.textContent = "Copying is blocked in this browser. Use Download instead.";
    }
    track("report_copy");
  });

  $("#report-download").addEventListener("click", () => {
    if (!report) return;
    const host = new URL(report.finalUrl).hostname.replace(/^www\./, "").replace(/[^a-z0-9.-]/gi, "");
    const blob = new Blob([reportText(report)], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `website-health-check-${host}-${report.strategy}.txt`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    reportStatus.textContent = "Report downloaded.";
    track("report_download");
  });

  $("#report-share").addEventListener("click", async () => {
    if (!report) return;
    const share = new URL(window.location.pathname, window.location.origin);
    share.searchParams.set("url", report.url);
    share.searchParams.set("strategy", report.strategy);
    try {
      await navigator.clipboard.writeText(share.href);
      reportStatus.textContent = "Link copied. Whoever opens it can run the same check.";
    } catch {
      reportStatus.textContent = share.href;
    }
    track("report_share");
  });

  // Prefill from a shared link. The check only runs when the visitor asks for it.
  const params = new URLSearchParams(window.location.search);
  if (params.get("url")) {
    urlField.value = params.get("url");
    const strategy = form.querySelector(`input[name="strategy"][value="${params.get("strategy") === "desktop" ? "desktop" : "mobile"}"]`);
    strategy.checked = true;
  }

  // Optional fix request
  const sendForm = $("#fix-request-form");
  const sendStatus = $("#fix-request-status");
  const reportField = $("#fix-request-report");
  document.querySelectorAll('a[href="#fix-request"]').forEach((link) => link.addEventListener("click", () => track("contact_click", { method: "header-fix-request" })));
  let sending = false;
  sendForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (sending) return;
    if (!sendForm.checkValidity()) { sendForm.reportValidity(); return; }
    if (!report && !sendForm.elements.message.value.trim()) {
      sendStatus.textContent = "Run a check first, or tell me what you'd like to improve.";
      return;
    }
    sending = true;
    const button = sendForm.querySelector('button[type="submit"]');
    button.disabled = true;
    sendForm.setAttribute("aria-busy", "true");
    reportField.value = report ? reportText(report) : "No check run";
    sendForm.elements._subject.value = report ? `Website health check - ${new URL(report.finalUrl).hostname}` : "Website health check enquiry";
    sendStatus.textContent = "Sending...";
    try {
      const response = await fetch(sendForm.action, { method: "POST", body: new FormData(sendForm), headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("Submission failed");
      sendForm.reset();
      sendStatus.textContent = "Thank you. Your report has been sent. I'll reply by email.";
      track("generate_lead", { method: "health-check-form", has_report: Boolean(report) });
    } catch {
      sendStatus.replaceChildren(document.createTextNode("This could not be sent. Your details are still here. Try again, or copy the report and "));
      const email = el("a", "", "email Hasnain directly");
      email.href = "mailto:husnainqureshi134@gmail.com?subject=Website%20health%20check";
      sendStatus.append(email, document.createTextNode("."));
    } finally {
      sending = false;
      button.disabled = false;
      sendForm.removeAttribute("aria-busy");
    }
  });
})();
