from pathlib import Path
import json
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://hasnainqureshi.online'
DATE = '2026-10-27'

# Make the new checker visible in the tool collection, beyond shared footer links.
p = ROOT / 'tools/index.html'
s = p.read_text(encoding='utf-8')
card = '<article><span class="item-number">08 / Migration planning</span><h3><a href="/tools/redirect-map-checker/">Redirect map checker</a></h3><p>Review exact-path redirect maps for chains, loops, competing sources and missing old-URL decisions. Keep, redirect and removal decisions stay local in your browser.</p><p><a class="text-link" href="/tools/redirect-map-checker/">Review a map <span aria-hidden="true">&#8599;</span></a></p></article>'
if '<h3><a href="/tools/redirect-map-checker/">' not in s:
    s = s.replace('<div class="scope-grid">', '<div class="scope-grid">' + card, 1)
p.write_text(s, encoding='utf-8')

# Respect existing typography and palette; constrain new code samples and reports.
p = ROOT / 'css/site-layout.css'
s = p.read_text(encoding='utf-8')
if '/* Planning examples and local migration reviews. */' not in s:
    s += '''
/* Planning examples and local migration reviews. */
.content-page pre { max-width:100%; overflow-x:auto; padding:20px; border:1px solid var(--line); background:#fbf9f3; font:400 14px/24px Consolas,monospace; }
.content-page pre code { font:inherit; }
.content-page .redirect-findings { max-height:480px; overflow:auto; overflow-wrap:anywhere; }
.content-page .redirect-findings li { font-size:18px; line-height:28px; margin-bottom:12px; }
.content-page .evidence-card { min-width:0; }
@media (max-width:700px) { .content-page .evidence-grid { grid-template-columns:1fr; } }
'''
p.write_text(s, encoding='utf-8')

p = ROOT / 'js/cost-calculator.js'
s = p.read_text(encoding='utf-8').replace('!form.checkValidity() || !Number.isInteger(pageField.valueAsNumber)', '!Number.isInteger(pageField.valueAsNumber)')
p.write_text(s, encoding='utf-8')

# All pages share static navigation, including the tool created after the main pass.
public = [ROOT / 'index.html', *ROOT.glob('project-case-study-[1-4].html'), *ROOT.glob('services/**/index.html'), *ROOT.glob('insights/**/index.html'), *ROOT.glob('tools/**/index.html'), ROOT / 'privacy/index.html']
for path in public:
    s = path.read_text(encoding='utf-8')
    s = s.replace('<a href="/#stack">Stack</a>', '<a href="/services/">Services</a>').replace('<a href="#stack">Stack</a>', '<a href="/services/">Services</a>')
    path.write_text(s, encoding='utf-8')

ns = 'http://www.sitemaps.org/schemas/sitemap/0.9'
image_ns = 'http://www.google.com/schemas/sitemap-image/1.1'
ET.register_namespace('', ns); ET.register_namespace('image', image_ns)
tree = ET.parse(ROOT / 'sitemap.xml'); root = tree.getroot()
by_url = {node.find('{' + ns + '}loc').text: node for node in root}
substantive = {'index.html', 'insights/index.html', 'tools/index.html', 'services/nextjs-development/index.html', 'services/saas-mvp-development/index.html', 'services/commercial-property-websites/index.html', 'project-case-study-1.html', 'project-case-study-2.html', 'project-case-study-3.html', 'project-case-study-4.html', 'tools/website-cost-calculator/index.html', 'tools/website-brief-builder/index.html', 'tools/website-health-check/index.html'}
for path in public:
    relative = path.relative_to(ROOT).as_posix()
    route = '/' if relative == 'index.html' else '/' + relative[:-10] if relative.endswith('/index.html') else '/' + relative
    url = BASE + route
    added = url not in by_url
    if added:
        node = ET.SubElement(root, '{' + ns + '}url'); ET.SubElement(node, '{' + ns + '}loc').text = url
    else:
        node = by_url[url]
    if added or relative in substantive:
        modified = node.find('{' + ns + '}lastmod')
        if modified is None: modified = ET.SubElement(node, '{' + ns + '}lastmod')
        modified.text = DATE
        s = path.read_text(encoding='utf-8')
        s = re.sub(r'("dateModified"\s*:\s*")[^"]+', lambda m: m[1] + DATE, s)
        path.write_text(s, encoding='utf-8')
ET.indent(tree, space='  ')
tree.write(ROOT / 'sitemap.xml', encoding='utf-8', xml_declaration=True)

# Explicit normalizations preserve existing .html case-study routes and all query parameters.
redirects = [{'source': '/:path*', 'has': [{'type': 'host', 'value': 'www.hasnainqureshi.online'}], 'destination': BASE + '/:path*', 'permanent': True}, {'source': '/index.html', 'destination': '/', 'permanent': True}]
directories = sorted({path.relative_to(ROOT).parent.as_posix() for path in public if path.name == 'index.html' and path.parent != ROOT})
for directory in directories:
    redirects += [{'source': '/' + directory + '/index.html', 'destination': '/' + directory + '/', 'permanent': True}, {'source': '/' + directory, 'destination': '/' + directory + '/', 'permanent': True}]
config = json.loads((ROOT / 'vercel.json').read_text())
config['redirects'] = redirects
config.setdefault('functions', {})['api/pagespeed.js'] = {'maxDuration': 90}
(ROOT / 'vercel.json').write_text(json.dumps(config, indent=2) + '\n', encoding='utf-8')
print('Finalized', len(public), 'canonical pages and', len(redirects), 'redirect rules.')
