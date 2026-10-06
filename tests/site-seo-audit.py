from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse,unquote
import xml.etree.ElementTree as ET
import json,re,collections
root=Path(__file__).resolve().parents[1];base='https://hasnainqureshi.online'
class Page(HTMLParser):
    def __init__(self,text):
        super().__init__();self.ids=[];self.links=[];self.assets=[];self.canon=[];self.titles=[];self.h1=0;self.schemas=[];self.mode=None;self.content='';self.descriptions=[];self.analytics=0;self.feed(text)
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.append(a['id'])
        if tag=='a' and 'href' in a:self.links.append(a['href'])
        if tag in ['img','script','source'] and a.get('src'):self.assets.append(a['src'])
        if tag=='link' and a.get('rel')=='stylesheet':self.assets.append(a['href'])
        if tag=='link' and a.get('rel')=='canonical':self.canon.append(a['href'])
        if tag=='meta' and a.get('name')=='description':self.descriptions.append(a['content'])
        if tag=='h1':self.h1+=1
        if tag=='script' and a.get('src')=='/js/site-analytics.js':self.analytics+=1
        if tag=='script' and a.get('type')=='application/ld+json':self.mode='schema';self.content=''
        if tag=='title':self.mode='title';self.content=''
    def handle_data(self,data):
        if self.mode:self.content+=data
    def handle_endtag(self,tag):
        if tag=='script' and self.mode=='schema':self.schemas.append(json.loads(self.content));self.mode=None
        if tag=='title' and self.mode=='title':self.titles.append(self.content);self.mode=None
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
urls=[el.text for el in ET.parse(root/'sitemap.xml').findall('s:url/s:loc',ns)]
errors=[];pages={};titles=[]
def resolve(path):
    path=unquote(path).lstrip('/');return root/(path+'index.html' if not path or path.endswith('/') else path)
for url in urls:
    path=urlparse(url).path;p=resolve(path)
    if not p.exists():errors.append('Missing sitemap page '+url);continue
    text=p.read_text(encoding='utf-8');page=Page(text);pages[path]=page
    if page.canon!=[url]:errors.append('Canonical '+path)
    if len(page.titles)!=1 or len(page.descriptions)!=1 or page.h1!=1:errors.append('Metadata/h1 '+path)
    if page.analytics!=1:errors.append('Analytics '+path)
    if len(page.ids)!=len(set(page.ids)):errors.append('Duplicate IDs '+path)
    if not page.schemas:errors.append('Missing schema '+path)
    titles.extend(page.titles)
    if 'gtag("config", "G-W0624M03ZJ")' in text:errors.append('Old duplicate tag '+path)
    if path.startswith('/insights/') and path not in ['/insights/','/insights/jev-ai-vs-chatgpt-claude/','/insights/service-marketplace-mvp-checklist/'] and '\u2014' in text:errors.append('Em dash '+path)
for path,page in pages.items():
    for value in page.links+page.assets:
        parsed=urlparse(value)
        if parsed.scheme and parsed.netloc!='hasnainqureshi.online':continue
        if parsed.scheme in ['mailto','tel','data','blob']:continue
        if not parsed.path:
            if parsed.fragment and parsed.fragment not in page.ids:errors.append(f'Anchor {path} {value}')
            continue
        target=resolve(parsed.path) if parsed.path.startswith('/') else resolve(str(Path(path).parent/parsed.path).replace('\\','/'))
        if not target.exists():errors.append(f'Missing link {path} {value}')
        if parsed.fragment and target.exists() and target.suffix=='.html':
            tp=Page(target.read_text(encoding='utf-8'))
            if parsed.fragment not in tp.ids:errors.append(f'Anchor {path} {value}')
duplicates=[title for title,count in collections.Counter(titles).items() if count>1]
if duplicates:errors.append('Duplicate titles '+str(duplicates))
print('Audited',len(urls),'canonical pages, metadata, schema JSON, analytics, local links/assets and anchors.')
for error in sorted(set(errors)):print(error)
if errors:raise SystemExit(1)
print('PASS')
