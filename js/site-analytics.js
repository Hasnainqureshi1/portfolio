/* Existing GA4 property. Track public routes and task outcomes, never file contents. */
(() => {
  "use strict";
  const measurementId = "G-W0624M03ZJ";
  let disabled = navigator.globalPrivacyControl === true || navigator.doNotTrack === "1";
  try { disabled ||= localStorage.getItem("portfolio-analytics-disabled") === "true"; } catch (_) { /* Storage may be unavailable. */ }
  const cleanUrl = value => { try { const url = new URL(value); return /^https?:$/.test(url.protocol) ? url.origin + url.pathname : ""; } catch (_) { return ""; } };
  const pageLocation = cleanUrl(location.href);
  const events = new Set(["tool_start", "tool_complete", "tool_download", "tool_copy", "tool_share", "tool_error", "tool_service_click", "resource_download", "contact_click", "generate_lead", "resume_view", "profile_click"]);
  const methods = new Set(["contact-form", "email", "phone", "whatsapp", "contact-section", "property-brief-form", "marketplace-brief-form", "website-cost-calculator", "health-check-form", "brief-builder-form", "resume", "github", "linkedin"]);
  const campaign = {};
  const campaignFields = { utm_source: "campaign_source", utm_medium: "campaign_medium", utm_campaign: "campaign_name", utm_id: "campaign_id", utm_content: "campaign_content", utm_term: "campaign_term" };
  const query = new URLSearchParams(location.search);
  Object.entries(campaignFields).forEach(([key, field]) => {
    const value = query.get(key);
    // Campaign slugs only; retain clean page URLs and exclude arbitrary query values.
    if (value && /^[a-z0-9][a-z0-9_.-]{0,63}$/i.test(value)) campaign[field] = value;
  });
  const formats = new Set(["csv", "json", "png", "webp", "jpeg", "zip", "txt", "print", "project"]);
  window.trackBusinessEvent = (eventName, details = {}) => {
    if (disabled || !events.has(eventName) || typeof window.gtag !== "function") return;
    const payload = { page_location: pageLocation, page_title: document.title, send_to: measurementId };
    const tool = location.pathname.match(/^\/tools\/([a-z-]+)\//)?.[1];
    if (tool) payload.tool_name = tool;
    if (formats.has(details.format)) payload.export_format = details.format;
    if (methods.has(details.method)) payload.method = details.method;
    if (Number.isInteger(details.item_count) && details.item_count >= 0 && details.item_count <= 20000) payload.item_count = details.item_count;
    window.gtag("event", eventName, payload);
  };
  const toolEvents = {
    tool_start: "tool_start", cost_calculate: "tool_complete", cost_copy: "tool_copy", cost_download: "tool_download",
    check_start: "tool_start", check_complete: "tool_complete", check_error: "tool_error",
    report_copy: "tool_copy", report_download: "tool_download", report_share: "tool_share",
    brief_copy: "tool_copy", brief_download: "tool_download", brief_print: "tool_download",
    contact_click: "contact_click", generate_lead: "generate_lead"
  };
  window.trackToolEvent = (name, details = {}) => {
    const mapped = toolEvents[name];
    if (!mapped) return;
    const format = name === "brief_print" ? "print" : /download/.test(name) ? "txt" : details.format;
    window.trackBusinessEvent(mapped, { method: details.method, format });
  };
  if (!disabled) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      page_location: pageLocation,
      page_referrer: cleanUrl(document.referrer),
      page_title: document.title,
      ...campaign,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    const script = document.createElement("script");
    script.async = true; script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.append(script);
  }
  document.addEventListener("click", event => {
    const link = event.target.closest("a[href]"); if (!link) return;
    const href = link.getAttribute("href");
    const action = link.dataset.contactAction;
    if (action) {
      const method = action === "resume" ? "resume" : /github/.test(action) ? "github" : /linkedin/.test(action) ? "linkedin" : /whatsapp/.test(action) ? "whatsapp" : /email/.test(action) ? "email" : "contact-section";
      window.trackBusinessEvent(method === "resume" ? "resume_view" : ["github", "linkedin"].includes(method) ? "profile_click" : "contact_click", { method });
      return;
    }
    if (link.hasAttribute("download") && !href.startsWith("blob:")) window.trackBusinessEvent("resource_download");
    else if (location.pathname.startsWith("/tools/") && href.startsWith("/services/")) window.trackBusinessEvent("tool_service_click");
    else if (href === "/#contact" || href === "#contact") window.trackBusinessEvent(location.pathname.startsWith("/tools/") ? "tool_service_click" : "contact_click", {method:"contact-section"});
    else if (href.startsWith("mailto:")) window.trackBusinessEvent("contact_click", {method:"email"});
    else if (href.startsWith("tel:")) window.trackBusinessEvent("contact_click", {method:"phone"});
  });
  document.querySelectorAll("[data-analytics-toggle]").forEach(button => {
    const refresh = () => {
      button.textContent = disabled ? "Usage analytics is off" : "Turn off usage analytics";
      button.disabled = disabled;
      const status = document.getElementById("analytics-preference-status");
      if (status) status.textContent = disabled ? "Optional usage analytics is off for this browser." : "Optional usage analytics is currently on. You can turn it off here.";
    };
    refresh();
    button.addEventListener("click", () => {
      disabled = true; window[`ga-disable-${measurementId}`] = true;
      try { localStorage.setItem("portfolio-analytics-disabled", "true"); } catch (_) { /* Keep the choice for this tab. */ }
      refresh();
    });
  });
})();
