"""Local release checks. All external services and enquiry deliveries are intercepted."""
from pathlib import Path
import json
import threading
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import xml.etree.ElementTree as ET
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), Quiet)
threading.Thread(target=server.serve_forever, daemon=True).start()
BASE = 'http://127.0.0.1:' + str(server.server_port)
paths = [el.text.removeprefix('https://hasnainqureshi.online') for el in ET.parse(ROOT / 'sitemap.xml').findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
failures, layouts, errors = [], [], []
state = {'form_status': 503}
report_dir = ROOT / 'research' / 'release-preview'
report_dir.mkdir(exist_ok=True)

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='chrome', headless=True)
        context = browser.new_context()
        def route(request):
            url = request.request.url
            if '/api/pagespeed?' in url:
                request.fulfill(status=429, content_type='application/json', body=json.dumps({'error': {'message': 'Synthetic quota-limit response'}}))
            elif url.startswith(BASE):
                request.continue_()
            elif 'formspree.io' in url:
                request.fulfill(status=state['form_status'], content_type='application/json', body=json.dumps({'ok': state['form_status'] == 200}))
            else:
                request.fulfill(status=200, body='')
        context.route('**/*', route)
        page = context.new_page()
        page.on('pageerror', lambda error: errors.append(str(error)))
        for width in [375, 1440]:
            page.set_viewport_size({'width': width, 'height': 900})
            for path in paths:
                response = page.goto(BASE + path, wait_until='load')
                page.wait_for_timeout(1200 if path == '/' else 70)
                overflow = page.evaluate('document.documentElement.scrollWidth > innerWidth')
                visible = page.locator('h1').is_visible()
                if response.status != 200 or overflow or not visible:
                    failures.append({'path': path, 'width': width, 'status': response.status, 'overflow': overflow, 'h1_visible': visible})
                layouts.append([path, width])
                if path in ['/', '/services/', '/services/ai-development/', '/tools/redirect-map-checker/']:
                    page.screenshot(path=str(report_dir / (('home' if path == '/' else path.strip('/').replace('/', '-')) + '-' + str(width) + '.png')))
            print('Checked', len(paths), 'pages at', width, 'px', flush=True)
        page.set_viewport_size({'width': 375, 'height': 900})
        page.goto(BASE + '/services/')
        page.locator('[data-menu-toggle]').click()
        assert page.locator('[data-menu-toggle]').get_attribute('aria-expanded') == 'true'
        page.keyboard.press('Escape')
        assert page.locator('[data-menu-toggle]').get_attribute('aria-expanded') == 'false'

        page.goto(BASE + '/tools/redirect-map-checker/')
        page.locator('#redirect-example').click()
        page.locator('#redirect-review button[type=submit]').click()
        assert '4 findings' in page.locator('#redirect-status').inner_text()
        with page.expect_download() as download:
            page.locator('#download-review').click()
        assert download.value.suggested_filename == 'redirect-map-review.txt'
        page.locator('#redirect-csv').fill((ROOT / 'resources/redirect-map-reviewed-example.csv').read_text())
        assert page.locator('#download-review').is_disabled()
        page.locator('#redirect-review button[type=submit]').click()
        assert '0 findings' in page.locator('#redirect-status').inner_text()
        # Text is rendered as text, never HTML, even when a source is malicious.
        page.locator('#redirect-csv').fill('source_path,destination_path\n/<img src=x onerror=alert(1)>,/ok\n')
        page.locator('#redirect-review button[type=submit]').click()
        assert page.locator('#redirect-results img').count() == 0

        page.goto(BASE + '/tools/website-cost-calculator/')
        page.locator('input[name=projectType][value=headless]').check()
        page.locator('input[name=migration]').check()
        page.locator('#migration-pages').fill('80')
        page.locator('input[name=features][value=preview]').check()
        page.locator('input[name=features][value=publishing]').check()
        page.locator('#cost-form button[type=submit]').click()
        lines = page.locator('#cost-lines').inner_text()
        assert 'Headless CMS website' in lines and '80 existing URLs' in lines and 'Editor preview' in lines
        page.locator('#migration-pages').fill('2001')
        page.locator('#cost-form button[type=submit]').click()
        assert '2,000' in page.locator('#cost-form-error').inner_text()
        page.locator('#migration-pages').fill('20')
        page.locator('#cost-form button[type=submit]').click()
        assert page.locator('#cost-form-error').inner_text() == ''

        page.goto(BASE + '/tools/website-brief-builder/')
        page.locator('input[name=projectType][value=automation]').check()
        page.locator('[name=about]').fill('A synthetic enquiry assistant')
        page.locator('#brief-delivery').select_option('agency')
        page.locator('#brief-handoff').fill('Review every external message before sending.')
        page.wait_for_timeout(150)
        assert 'Review every external message' in page.locator('#brief-output').inner_text()
        assert 'AI application or automation' in page.locator('#brief-output').inner_text()
        assert not page.evaluate('document.documentElement.scrollWidth > innerWidth')

        page.goto(BASE + '/tools/website-health-check/')
        page.locator('#check-url').fill('https://example.com/')
        page.locator('#check-submit').click()
        page.wait_for_timeout(300)
        assert page.locator('#check-error').is_visible()
        assert page.locator('#check-error a').count() > 0
        assert page.locator('#check-submit').is_enabled()

        page.goto(BASE + '/services/commercial-property-websites/')
        page.locator('[data-contact-method=email]').evaluate("e=>{e.addEventListener('click',event=>event.preventDefault());e.click();}")
        count = page.evaluate("Array.from(dataLayer).filter(x=>x[0]==='event' && x[1]==='contact_click').length")
        assert count == 1, count
        for path, form_id, status_id in [('/', 'contact-form', 'contact-status'), ('/services/commercial-property-websites/', 'property-brief-form', 'property-form-status')]:
            page.goto(BASE + path)
            form = page.locator('#' + form_id)
            form.locator('[name=name]').fill('Synthetic release check')
            form.locator('[name=email]').fill('test@example.invalid')
            form.locator('[name=message]').fill('Synthetic form test; external delivery is intercepted.')
            state['form_status'] = 503
            form.locator('button[type=submit]').click()
            page.wait_for_timeout(100)
            assert form.locator('[name=message]').input_value()
            assert page.evaluate("Array.from(dataLayer).filter(x=>x[0]==='event' && x[1]==='generate_lead').length") == 0
            state['form_status'] = 200
            form.locator('button[type=submit]').click()
            page.wait_for_timeout(100)
            assert page.evaluate("Array.from(dataLayer).filter(x=>x[0]==='event' && x[1]==='generate_lead').length") == 1
        browser.close()
finally:
    server.shutdown()
    server.server_close()

summary = {'layouts_checked': len(layouts), 'failures': failures, 'javascript_errors': errors, 'external_requests': 'intercepted; no enquiries or Analytics events delivered'}
(report_dir / 'summary.json').write_text(json.dumps(summary, indent=2), encoding='utf-8')
print(json.dumps(summary), flush=True)
assert not failures, failures
assert not errors, errors
