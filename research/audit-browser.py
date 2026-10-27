"""Check rendering and contact flows without sending real enquiries or Analytics hits."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://hasnainqureshi.online"
OUTPUT = ROOT / "research" / "browser-seo-evidence-2026-10-27.json"
results = {"date": "2026-10-27", "layouts": [], "forms": [], "tracking": {}, "limitations": []}


def commands(page):
    return page.evaluate("Array.from(window.dataLayer || []).map(x => Array.from(x))")


with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome", headless=True)
    context = browser.new_context()
    response_state = {"form_status": 503}

    def route(request):
        url = request.request.url
        if url.startswith(BASE):
            request.continue_()
        elif "formspree.io" in url:
            request.fulfill(status=response_state["form_status"], content_type="application/json",
                            body=json.dumps({"ok": response_state["form_status"] == 200}))
        else:
            # This includes Google Analytics and chat; all third-party requests are stubbed.
            request.fulfill(status=200, body="")

    context.route("**/*", route)
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    for width in (375, 1440):
        page.set_viewport_size({"width": width, "height": 850})
        for path in ("/", "/services/nextjs-development/", "/services/commercial-property-websites/", "/tools/"):
            try:
                response = page.goto(BASE + path, wait_until="domcontentloaded", timeout=25000)
                page.wait_for_timeout(1500)
                results["layouts"].append({"path": path, "width": width, "status": response.status,
                    "h1_visible": page.locator("h1").is_visible(),
                    "horizontal_overflow": page.evaluate("document.documentElement.scrollWidth > innerWidth"),
                    "analytics_configs": [x for x in commands(page) if x[0] == "config"]})
            except Exception as error:
                results["limitations"].append({"path": path, "width": width, "error": str(error)})
    page.goto(BASE + "/?utm_source=audit&utm_medium=referral&utm_campaign=synthetic-check",
              wait_until="domcontentloaded", timeout=25000)
    page.wait_for_timeout(400)
    results["tracking"]["campaign_config"] = [x for x in commands(page) if x[0] == "config"]

    for path, form_id, status_id in (("/", "contact-form", "contact-status"),
                                    ("/services/commercial-property-websites/", "property-brief-form", "property-form-status")):
        page.goto(BASE + path, wait_until="domcontentloaded", timeout=25000)
        page.wait_for_timeout(400)
        form = page.locator("#" + form_id)
        form.locator('[name="name"]').fill("Synthetic audit")
        form.locator('[name="email"]').fill("audit@example.invalid")
        form.locator('[name="message"]').fill("Synthetic browser test. External delivery is intercepted.")
        response_state["form_status"] = 503
        form.locator('button[type="submit"]').click()
        page.wait_for_timeout(350)
        failed = {"status": page.locator("#" + status_id).inner_text(),
                  "message_preserved": form.locator('[name="message"]').input_value() != "",
                  "lead_events": sum(x[0:2] == ["event", "generate_lead"] for x in commands(page))}
        response_state["form_status"] = 200
        form.locator('button[type="submit"]').click()
        page.wait_for_timeout(350)
        succeeded = {"status": page.locator("#" + status_id).inner_text(),
                     "lead_events": sum(x[0:2] == ["event", "generate_lead"] for x in commands(page))}
        results["forms"].append({"path": path, "failure": failed, "success": succeeded,
                                 "delivery": "Formspree intercepted; inbox delivery not tested"})
    page.goto(BASE + "/services/commercial-property-websites/", wait_until="domcontentloaded", timeout=25000)
    page.wait_for_timeout(300)
    before = sum(x[0:2] == ["event", "contact_click"] for x in commands(page))
    page.locator("[data-contact-method=email]").evaluate("e => { e.addEventListener('click', event => event.preventDefault()); e.click(); }")
    after = sum(x[0:2] == ["event", "contact_click"] for x in commands(page))
    results["tracking"]["property_email_click_events"] = after - before
    results["javascript_errors"] = errors
    context.close()
    context = browser.new_context(java_script_enabled=False, viewport={"width": 375, "height": 850})
    context.route("**/*", lambda request: request.continue_() if request.request.url.startswith(BASE) else request.fulfill(status=200, body=""))
    page = context.new_page()
    page.goto(BASE, wait_until="domcontentloaded", timeout=25000)
    results["without_javascript"] = {"h1_visible": page.locator("h1").is_visible(),
                                      "services_visible": page.locator("#services").is_visible()}
    browser.close()

OUTPUT.write_text(json.dumps(results, indent=2), encoding="utf-8")
print(json.dumps(results, indent=2))
