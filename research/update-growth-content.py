"""Apply approved copy, navigation, internal links and discoverability updates."""
from pathlib import Path
import json
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DATE = '2026-10-27'


def edit(name, function):
    path = ROOT / name
    old = path.read_text(encoding='utf-8')
    new = function(old)
    path.write_text(new, encoding='utf-8')


def add_before(name, marker, content):
    def update(text):
        if content in text:
            return text
        assert marker in text, (name, marker)
        return text.replace(marker, content + marker, 1)
    edit(name, update)


def home(text):
    title = 'Hasnain Qureshi | AI Full-Stack Developer &amp; Automation'
    text = re.sub(r'<title>.*?</title>', '<title>' + title + '</title>', text, count=1)
    text = re.sub(r'(<meta (?:property="og:title"|name="twitter:title") content=")[^"]+', lambda m: m[1] + title, text)
    text = re.sub(r'(name="description"\s+content=")[^"]+', lambda m: m[1] + 'AI full-stack developer for UK and US teams. React, Next.js, OpenAI, Claude, RAG chatbots, n8n, Zapier, voice and WhatsApp automation. Based in Karachi.', text, count=1)
    text = text.replace('Full-stack <span>developer</span> for products that ship.', 'AI full-stack <span>developer</span> for products that ship.')
    text = re.sub(r'(<p class="hero_lede">).*?(</p>)', r'\1I build React and Next.js products, AI assistants and business automations with OpenAI, Claude, n8n and Zapier. Based in Karachi, working remotely with UK and US teams.\2', text, count=1, flags=re.S)
    text = text.replace('Technical expertise / web + mobile', 'Technical expertise / web + mobile + AI')
    text = text.replace('A practical stack for <em>web and mobile.</em>', 'A practical stack for <em>web, mobile and AI.</em>')
    additions = [
        ('OA', 'AI integration', 'OpenAI', 'AI API integrations, structured results and application tools.'),
        ('CL', 'AI integration', 'Claude', 'Assistant workflows, document tasks and reviewable application actions.'),
        ('N8', 'Automation', 'n8n', 'Webhooks, API connections, business workflows and error handling.'),
        ('ZA', 'Automation', 'Zapier', 'Business app connections, routing and reviewed multi-step workflows.'),
        ('RA', 'Knowledge systems', 'RAG', 'Document retrieval, source references and access-aware answers.'),
        ('AI', 'Conversational products', 'AI chatbots', 'Website assistants, human handoff and connected customer workflows.')]
    if '<h3>OpenAI</h3>' not in text:
        cards = ''.join(f'<article class="expertise-card reveal"><span>{code}</span><small>{group}</small><h3>{name}</h3><p>{copy}</p></article>' for code, group, name, copy in additions)
        text = text.replace('          <div class="expertise_grid">', '          <div class="expertise_grid">' + cards, 1)
    if 'AI applications and assistants</h3>' not in text:
        cards = '''<article class="service-card reveal"><span>05</span><h3>AI applications and assistants</h3><p>OpenAI and Claude integrations connected to React interfaces, authenticated APIs and reviewable business workflows.</p><a href="/services/ai-development/">AI full-stack development <b>&#8599;</b></a></article>
<article class="service-card reveal"><span>06</span><h3>Voice and WhatsApp automation</h3><p>Enquiry capture, appointment requests, approved business answers and a clear route to your team.</p><a href="/services/ai-voice-receptionist/">Voice receptionists <b>&#8599;</b></a><a href="/services/whatsapp-automation/">WhatsApp automation <b>&#8599;</b></a></article>
<article class="service-card reveal"><span>07</span><h3>n8n, Zapier and RAG workflows</h3><p>Connect business apps and maintained knowledge with explicit review, failure handling and ownership.</p><a href="/services/n8n-automation/">n8n automation <b>&#8599;</b></a><a href="/services/zapier-automation/">Zapier workflows <b>&#8599;</b></a><a href="/services/rag-chatbot-development/">RAG chatbots <b>&#8599;</b></a></article>'''
        text = text.replace('          <div class="services_grid">', '          <div class="services_grid">' + cards, 1)
    text = text.replace('Frontend, backend, data, realtime systems, mobile apps, and production delivery - connected as one practical engineering stack.', 'Frontend, backend, data, mobile and AI integrations connected as one practical engineering stack. Explore <a href="/services/#ai-services">AI and automation services</a>.')
    text = text.replace('One engineer from <em>product idea to production.</em>', 'One engineer from <em>product idea to production.</em>')
    if '<option>AI application or RAG chatbot</option>' not in text:
        text = text.replace('<option>Technical consultation</option>', '<option>AI application or RAG chatbot</option><option>AI voice receptionist</option><option>WhatsApp automation</option><option>n8n or Zapier automation</option><option>Technical consultation</option>')
    def schema(match):
        data = json.loads(match[1])
        for node in data.get('@graph', []):
            if node.get('@type') == 'ProfilePage':
                node['dateModified'] = DATE
            if node.get('@type') == 'Person':
                node['jobTitle'] = 'AI Full-Stack Developer'
                node['description'] = 'Full-stack developer based in Karachi, offering React, Next.js, AI integrations and business automation for remote UK and US teams.'
                node['knowsAbout'] = list(dict.fromkeys(node.get('knowsAbout', []) + ['OpenAI', 'Claude', 'n8n', 'Zapier', 'Retrieval-augmented generation', 'AI chatbots', 'Voice assistants', 'WhatsApp Business integrations']))
                for slug, label in [('ai-development', 'AI application development'), ('n8n-automation', 'n8n workflow automation'), ('zapier-automation', 'Zapier automation')]:
                    url = 'https://hasnainqureshi.online/services/' + slug + '/'
                    if not any(x.get('itemOffered', {}).get('url') == url for x in node.get('makesOffer', [])):
                        node.setdefault('makesOffer', []).append({'@type': 'Offer', 'itemOffered': {'@type': 'Service', 'name': label, 'url': url}})
        return '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False, indent=2) + '</script>'
    return re.sub(r'<script type="application/ld\+json">(.*?)</script>', schema, text, flags=re.S)


edit('index.html', home)

# Existing services receive concrete scope content, without inventing project results.
next_section = '''<section class="case-section" id="hire-scope"><h2>What you can hire me for</h2><div class="case-section_copy"><ul><li><strong>Design implementation</strong> Responsive Next.js pages and reusable components from an agreed design and content inventory.</li><li><strong>WordPress integration</strong> Connect editor-managed fields to a custom frontend and agree preview and publishing behavior.</li><li><strong>Existing-product improvements</strong> Scope a specific interface, integration or operational problem in your current application.</li><li><strong>Agency collaboration</strong> Agree design inputs, review rounds, client communication, repository and handover ownership before starting.</li></ul><p>For London, UK and US teams, I work remotely from Karachi. Project capacity and working-hour overlap are agreed for the actual engagement. See <a href="/services/agency-development-support/">agency development support</a>.</p></div></section>
<section class="case-section" id="content-workflow"><h2>From editor fields to a public page</h2><div class="case-section_copy"><p>A useful content model makes the editor's responsibility clear. In this synthetic building example, the title becomes a heading, the introduction becomes page copy and the brochure link appears only when a brochure is supplied.</p><pre><code>building.name -&gt; page heading\nbuilding.introduction -&gt; introduction\nbuilding.brochure -&gt; optional download link</code></pre><p><a href="/resources/cms-content-example.json" download>Download the original synthetic field example</a>. The <a href="/project-case-study-2.html">Cambridge Research Park case study</a> documents related implementation work; this example is a separate planning model.</p><p>Agree preview access, content publishing, form destinations and update ownership alongside the visible design. Use the <a href="/insights/wordpress-to-nextjs-migration-checklist/">WordPress-to-Next.js checklist</a> when planning a replacement frontend.</p></div></section>'''
add_before('services/nextjs-development/index.html', '      <div class="case-body">', '')
edit('services/nextjs-development/index.html', lambda s: s.replace('Next.js &amp; Headless WordPress Developer | Hasnain Qureshi', 'Freelance Next.js &amp; WordPress Developer | Hasnain Qureshi').replace('Next.js & Headless WordPress Developer | Hasnain Qureshi', 'Freelance Next.js & WordPress Developer | Hasnain Qureshi').replace('<h1>Next.js websites with content your team can manage</h1>', '<h1>Freelance Next.js development for UK and US teams</h1>'))
add_before('services/nextjs-development/index.html', '<section class="case-section"><h2>When this service fits</h2>', next_section)

saas_section = '''<section class="case-section" id="first-release"><h2>A first release you can review</h2><div class="case-section_copy"><p>For a synthetic support-product example, a permitted operator signs in, opens an assigned enquiry and records its next action. The first release needs access rules, a useful record view, a confirmed save and retained history. Billing plans, AI suggestions and native mobile apps can be deferred for this particular example.</p><p>Acceptance checks include a rejected unauthorized read, visible history after a successful save and retained input after a failed save. Your product's real outcome determines its scope.</p><p><a href="/insights/saas-mvp-scope-template/">Read the filled SaaS scope example</a> or <a href="/resources/saas-mvp-scope-template.txt" download>download the blank template</a>.</p></div></section>'''
add_before('services/saas-mvp-development/index.html', '<section class="case-section"><h2>What we can build</h2>', saas_section)
edit('services/saas-mvp-development/index.html', lambda s: s.replace('<li><a href="/insights/csv-column-mapping/">Map CSV columns to a destination template</a></li>', '<li><a href="/insights/saas-mvp-scope-template/">SaaS MVP scope template and filled example</a></li><li><a href="/project-case-study-1.html">ChatKnot implementation work</a></li>'))

property_section = '''<section class="case-section wrap" id="content-handoff"><h2>A building-page handoff example</h2><div class="case-section_copy"><p>Use this synthetic review model to connect the property story to maintained information and an enquiry. It is a planning example rather than a screenshot of a client's CMS.</p><ol class="architecture-flow"><li><strong>Introduction:</strong> the content editor supplies the building name, summary and approved imagery.</li><li><strong>Availability:</strong> the property owner confirms the source, status and update responsibility for each space.</li><li><strong>Documents:</strong> brochure and floor-plan links appear only when the current approved files are available.</li><li><strong>Enquiry:</strong> the recipient confirms form delivery, useful context and the response process.</li></ol><p><a href="/resources/cms-content-example.json" download>Download the synthetic field map</a> and review the <a href="/insights/commercial-property-website-checklist/">property launch checklist</a>. For an agency-supplied design, we agree which decisions and reviews stay with your team; branding and leasing strategy are separate scope.</p></div></section>'''
add_before('services/commercial-property-websites/index.html', '      <section class="region-section', property_section)

case_section = '''<section class="case-section" id="content-example"><h2>Review the editor-to-page boundary</h2><div class="case-section_copy"><p>A custom frontend needs a clear agreement about editable content and layout responsibility. For a building page, the reviewer can trace a title, introduction, brochure and availability from the content source to their place in the public experience.</p><p>The <a href="/resources/cms-content-example.json" download>downloadable field map</a> is an original synthetic example for discussing that boundary. It is separate from this project's internal implementation. Review which fields are optional, who approves the values and what should happen when content is missing.</p><p>Before a new project is handed over, agree publishing ownership, repository/deployment access and the scope of ongoing updates. See the <a href="/services/nextjs-development/">Next.js implementation service</a> and <a href="/insights/wordpress-to-nextjs-migration-checklist/">migration planning guide</a>.</p></div></section>'''
for name in ['project-case-study-2.html', 'project-case-study-3.html']:
    add_before(name, '      </article>', case_section)
edit('project-case-study-1.html', lambda s: s.replace('<li><a href="/insights/csv-column-mapping/">Map CSV columns to a destination template</a></li><li><a href="/services/data-import-integration/">Discuss implementation scope</a></li>', '<li><a href="/insights/saas-mvp-scope-template/">SaaS MVP scope template</a></li><li><a href="/services/saas-mvp-development/">Discuss SaaS implementation scope</a></li>'))
add_before('project-case-study-4.html', '    </main>', '<section class="related-resources"><div class="shared-container"><h2>Plan an AI product workflow</h2><p>Explore <a href="/services/ai-development/">AI full-stack development</a> and <a href="/services/rag-chatbot-development/">RAG knowledge assistants</a> for related implementation scope.</p></div></section>')

guide_cards = '''<article class="qa-card"><h2><a href="/insights/wordpress-to-nextjs-migration-checklist/">WordPress to Next.js migration checklist</a></h2><p>Inventory content, editor workflow and public URLs with an original downloadable example.</p></article><article class="qa-card"><h2><a href="/insights/headless-wordpress-vs-traditional-wordpress/">Headless or traditional WordPress?</a></h2><p>Compare editing, preview, integrations and maintenance responsibilities before choosing the architecture.</p></article><article class="qa-card"><h2><a href="/insights/saas-mvp-scope-template/">SaaS MVP scope template</a></h2><p>Use a blank template and a synthetic filled example to define a complete first release.</p></article>'''
add_before('insights/index.html', '          <article class="qa-card">', guide_cards)

# Keep the established five-link header layout; make Services directly discoverable.
public_paths = [ROOT / 'index.html', *ROOT.glob('project-case-study-[1-4].html'), *ROOT.glob('services/**/index.html'), *ROOT.glob('insights/**/index.html'), *ROOT.glob('tools/**/index.html'), ROOT / 'privacy/index.html']
for path in public_paths:
    text = path.read_text(encoding='utf-8')
    text = text.replace('<a href="/#stack">Stack</a>', '<a href="/services/">Services</a>').replace('<a href="#stack">Stack</a>', '<a href="/services/">Services</a>')
    if 'AI &amp; automation services</a>' not in text:
        text = text.replace('<nav aria-label="Services">', '<nav aria-label="Services"><a href="/services/">All development services</a><a href="/services/#ai-services">AI &amp; automation services</a>', 1)
    if '/tools/redirect-map-checker/">Redirect map checker' not in text:
        text = text.replace('<nav aria-label="Free tools">', '<nav aria-label="Free tools"><a href="/tools/redirect-map-checker/">Redirect map checker</a>', 1)
    text = text.replace('Full-stack development for web and mobile.', 'Full-stack development, AI and business automation.')
    # Drop the legacy embedded icon; stable crawlable favicon files already exist.
    text = re.sub(r'\s*<link rel="icon" href="data:image/svg\+xml,[^>]+/>', '', text)
    path.write_text(text, encoding='utf-8')

# Extend the discovery map without claims about AI citations or rankings.
path = ROOT / 'llms.txt'
text = path.read_text(encoding='utf-8')
if '## AI and automation services' not in text:
    text += '\n## AI and automation services\n\n- [All services](https://hasnainqureshi.online/services/)\n'
    for slug in ['ai-development', 'ai-voice-receptionist', 'whatsapp-automation', 'n8n-automation', 'zapier-automation', 'rag-chatbot-development', 'agency-development-support']:
        text += '- [' + slug.replace('-', ' ') + '](https://hasnainqureshi.online/services/' + slug + '/)\n'
    text += '\n## New planning resources\n\n- [Migration checklist](https://hasnainqureshi.online/insights/wordpress-to-nextjs-migration-checklist/)\n- [WordPress architecture decisions](https://hasnainqureshi.online/insights/headless-wordpress-vs-traditional-wordpress/)\n- [SaaS MVP scope template](https://hasnainqureshi.online/insights/saas-mvp-scope-template/)\n- [Redirect-map checker](https://hasnainqureshi.online/tools/redirect-map-checker/)\n'
path.write_text(text, encoding='utf-8')
print('Updated homepage, skills, existing services/case studies, navigation, guide discovery and site map summary.')
