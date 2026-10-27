"""Read-only audit of public portfolio URLs. Does not send Analytics events."""
import concurrent.futures
import json
from pathlib import Path
import re
import time
import urllib.error
import urllib.request
from urllib.parse import urljoin, urlparse
from html.parser import HTMLParser
import xml.etree.ElementTree as ET

BASE = "https://hasnainqureshi.online"
ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "research" / "live-seo-evidence-2026-10-27.json"


class Page(HTMLParser):
    def __init__(self, body):
        super().__init__()
        self.tags = []
        self.ids = []
        self.text = []
        self.hidden = 0
        self.feed(body)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if attrs.get("id"):
            self.ids.append(attrs["id"])
        if tag in ("script", "style"):
            self.hidden += 1

    def handle_endtag(self, tag):
        if tag in ("script", "style"):
            self.hidden = max(0, self.hidden - 1)

    def handle_data(self, data):
        if not self.hidden:
            self.text.append(data)


def fetch(url, method="GET"):
    start = time.monotonic()
    result = {"url": url}
    try:
        request = urllib.request.Request(url, method=method)
        with urllib.request.urlopen(request, timeout=25) as response:
            result.update(status=response.status, final_url=response.url,
                          headers=dict(response.headers),
                          elapsed_seconds=round(time.monotonic() - start, 2))
            if method == "GET":
                result["body"] = response.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as error:
        result.update(status=error.code, error=str(error), headers=dict(error.headers))
    except Exception as error:
        result["error"] = str(error)
    return result


def inspect(url):
    result = fetch(url)
    body = result.get("body", "")
    page = Page(body)
    result["title"] = re.findall(r"<title>(.*?)</title>", body, re.S)
    result["canonical"] = [a.get("href") for t, a in page.tags
                           if t == "link" and a.get("rel") == "canonical"]
    result["description"] = [a.get("content") for t, a in page.tags
                             if t == "meta" and a.get("name") == "description"]
    result["robots"] = [a.get("content") for t, a in page.tags
                        if t == "meta" and a.get("name") == "robots"]
    result["h1_count"] = sum(t == "h1" for t, a in page.tags)
    result["analytics_loaders"] = sum(t == "script" and a.get("src") == "/js/site-analytics.js"
                                      for t, a in page.tags)
    result["schema_errors"] = []
    for data in re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', body, re.S):
        try:
            json.loads(data)
        except Exception as error:
            result["schema_errors"].append(str(error))
    result["word_count"] = len(" ".join(page.text).split())
    result["internal_refs"] = []
    result["ids"] = page.ids
    for tag, attrs in page.tags:
        value = attrs.get("src") if tag in ("img", "script", "source") else attrs.get("href") if tag in ("a", "link") else None
        if value:
            target = urljoin(url, value)
            if urlparse(target).netloc == urlparse(BASE).netloc:
                result["internal_refs"].append(target)
    return result


def first_response(url):
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, *args, **kwargs):
            return None
    try:
        with urllib.request.build_opener(NoRedirect()).open(url, timeout=20) as response:
            return {"url": url, "status": response.status, "location": response.headers.get("Location")}
    except urllib.error.HTTPError as error:
        return {"url": url, "status": error.code, "location": error.headers.get("Location")}
    except Exception as error:
        return {"url": url, "error": str(error)}


if __name__ == "__main__":
    sitemap = fetch(BASE + "/sitemap.xml")
    if sitemap.get("status") != 200:
        raise SystemExit(json.dumps(sitemap))
    urls = [el.text for el in ET.fromstring(sitemap["body"]).findall(
        ".//{http://www.sitemaps.org/schemas/sitemap/0.9}loc")]
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        pages = list(pool.map(inspect, urls))
    additional = sorted({url.split("#")[0] for p in pages for url in p["internal_refs"]} - set(urls))
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        assets = list(pool.map(lambda url: fetch(url, "HEAD"), additional))
    variants = ["http://hasnainqureshi.online/", "https://www.hasnainqureshi.online/",
                "https://www.hasnainqureshi.online/services/nextjs-development/",
                BASE + "/index.html", BASE + "/services/nextjs-development",
                BASE + "/services/nextjs-development/index.html", BASE + "/missing-audit-page-20261027"]
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        redirects = list(pool.map(first_response, variants))
    extra = [fetch(BASE + "/robots.txt"), fetch(BASE + "/js/site-analytics.js")]
    report = {"date": "2026-10-27", "sitemap": sitemap, "pages": pages,
              "additional_resources": assets, "redirect_checks": redirects, "extra": extra}
    OUTPUT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    issues = [{"url": p["url"], "status": p.get("status"), "error": p.get("error")}
              for p in pages if p.get("status") != 200 or p["canonical"] != [p["url"]]
              or p["h1_count"] != 1 or p["schema_errors"]]
    print(json.dumps({"pages_checked": len(pages), "page_issues": issues,
                      "additional_resources_checked": len(assets),
                      "resource_failures": [{"url": a["url"], "status": a.get("status"), "error": a.get("error")}
                                            for a in assets if a.get("status") != 200],
                      "redirects": redirects, "saved": str(OUTPUT)}, indent=2))
