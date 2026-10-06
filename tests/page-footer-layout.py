"""Prevent the site footer from being inserted inside a demo or content section."""
from html.parser import HTMLParser
from pathlib import Path
import xml.etree.ElementTree as ET
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
VOID = set('area base br col embed hr img input link meta param source track wbr'.split())

class FooterCheck(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.footers = 0

    def handle_starttag(self, tag, attrs):
        classes = dict(attrs).get('class', '').split()
        if tag == 'footer' and 'shared-footer' in classes:
            self.footers += 1
            assert not any(t in ('main', 'section', 'article') for t in self.stack), 'Site footer nested in page content'
        if tag not in VOID:
            self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag in self.stack:
            index = len(self.stack) - 1 - self.stack[::-1].index(tag)
            del self.stack[index:]

urls = ET.parse(ROOT / 'sitemap.xml').findall('{*}url/{*}loc')
for url in urls:
    path = urlparse(url.text).path.lstrip('/')
    filename = ROOT / (path + 'index.html' if not path or path.endswith('/') else path)
    parser = FooterCheck()
    try:
        parser.feed(filename.read_text(encoding='utf-8'))
        assert parser.footers == 1, 'Expected one site footer'
    except AssertionError as error:
        raise AssertionError(f'{filename}: {error}') from error
print(f'PASS: site footer appears once, outside content and demos, on {len(urls)} pages.')
