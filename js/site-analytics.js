/* Existing GA4 property. Track public routes and task outcomes, never file contents. */
(() => {
  "use strict";
  const measurementId = "G-W0624M03ZJ";
  let disabled = navigator.globalPrivacyControl === true || navigator.doNotTrack === "1";
  try { disabled ||= localStorage.getItem("portfolio-analytics-disabled") === "true"; } catch (_) { /* Storage may be unavailable. */ }
  const cleanUrl = value => { try { const url = new URL(value); return /^https?:$/.test(url.protocol) ? url.origin + url.pathname : ""; } catch (_) { return ""; } };
  const pageLocation = cleanUrl(location.href);
  const events = new Set(["tool_complete", "tool_download", "tool_service_click", "resource_download", "contact_click", "generate_lead"]);
  const formats = new Set(["csv", "json", "png", "webp", "jpeg", "zip", "txt", "print", "project"]);
  window.trackBusinessEvent = (eventName, details = {}) => {
    if (disabled || !events.has(eventName) || typeof window.gtag !== "function") return;
    const payload = { page_location: pageLocation, page_title: document.title, send_to: measurementId };
    const tool = location.pathname.match(/^\/tools\/([a-z-]+)\//)?.[1];
    if (tool) payload.tool_name = tool;
    if (formats.has(details.format)) payload.export_format = details.format;
    if (["contact-form", "email", "phone", "whatsapp", "contact-section"].includes(details.method)) payload.method = details.method;
    if (Number.isInteger(details.item_count) && details.item_count >= 0 && details.item_count <= 20000) payload.item_count = details.item_count;
    window.gtag("event", eventName, payload);
  };
  if (!disabled) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      page_location: pageLocation,
      page_referrer: cleanUrl(document.referrer),
      page_title: document.title,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    const script = document.createElement("script");
    script.async = true; script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.append(script);
  }
  document.addEventListener("click", event => {
    const link = event.target.closest("a[href]"); if (!link) return;
    if (link.hasAttribute("data-contact-action")) return;
    const href = link.getAttribute("href");
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
