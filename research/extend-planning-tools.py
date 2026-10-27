from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def change(name, replacements):
    path = ROOT / name
    text = path.read_text(encoding='utf-8')
    for old, new in replacements:
        assert old in text, (name, old[:70])
        text = text.replace(old, new, 1)
    path.write_text(text, encoding='utf-8')

change('tools/website-cost-calculator/index.html', [
    ('            <div class="type-options cost-type-options">', '            <div class="type-options cost-type-options"><label class="type-option"><input type="radio" name="projectType" value="headless" /><span><strong>Headless CMS website</strong>Custom frontend connected to an editor-managed content source.</span></label>'),
    ('            <p class="field-hint">Contact forms, responsive layouts, basic accessibility checks and launch QA are already in the base scope.</p>', '''            <label for="migration-pages">Existing URLs to review for a replacement<input id="migration-pages" name="migrationPages" type="number" min="0" max="2000" step="1" value="0" inputmode="numeric" /><span>Used only when replacing an existing site. This is a separate inventory from the new page count.</span></label>
            <div class="cost-check-grid"><label class="cost-check"><input type="checkbox" name="features" value="preview" /><span><strong>Editor preview</strong>Review unpublished content in the custom frontend.</span></label><label class="cost-check"><input type="checkbox" name="features" value="publishing" /><span><strong>Publishing refresh</strong>Connect agreed content updates to the frontend.</span></label></div>
            <p class="field-hint">Contact forms, responsive layouts, basic accessibility checks and launch QA are already in the base scope. Preview and publishing requirements need review against your CMS.</p>'''),
    ('Built for people commissioning a business or commercial property website.', 'Built for people commissioning a business, headless CMS or commercial property website.')
])
change('js/cost-calculator.js', [
    ('  const BASE = { business: 42, property: 68 };', '  const BASE = { business: 42, property: 68, headless: 68 };\n  const PROJECT_NAMES = { business: "Business website", property: "Commercial property website", headless: "Headless CMS website" };'),
    ('    listing: ["Availability feed", 32]', '    listing: ["Availability feed", 32],\n    preview: ["Editor preview", 10],\n    publishing: ["Content publishing refresh", 8]'),
    ('      migration: data.has("migration"),', '      migration: data.has("migration"),\n      migrationPages: Number(data.get("migrationPages") || 0),'),
    ('[input.type === "property" ? "Commercial property base build" : "Business website base build", BASE[input.type]]', '[PROJECT_NAMES[input.type] + " base build", BASE[input.type]]'),
    ('    if (input.migration) lines.push(["Existing site migration and redirects", 18]);', '    if (input.migration) {\n      lines.push(["Existing site migration and redirects", 18]);\n      if (input.migrationPages) lines.push([`${input.migrationPages} existing URLs: inventory review`, Math.ceil(input.migrationPages / 20) * 2]);\n    }'),
    ('`Project: ${input.type === "property" ? "Commercial property website" : "Business website"}`', '`Project: ${PROJECT_NAMES[input.type]}`'),
    ('      `Replacing a site: ${input.migration ? "Yes" : "No"}`,', '      `Replacing a site: ${input.migration ? "Yes" : "No"}`,\n      `Existing URL inventory: ${input.migration ? input.migrationPages : 0}`,')
])
change('js/cost-calculator.js', [
    ('    estimate = calculate(fields());', '''    const input = fields();
    if (input.migration && (!Number.isInteger(input.migrationPages) || input.migrationPages < 0 || input.migrationPages > 2000)) {
      errorBox.textContent = "Enter a whole existing-URL count between 0 and 2,000.";
      estimate = null; $("#cost-breakdown").hidden = true; $("#cost-actions").hidden = true;
      return;
    }
    estimate = calculate(input);'''),
    ('if (estimate && event.target.name === "pages") run(false);', 'if (estimate && ["pages", "migrationPages"].includes(event.target.name)) run(false);')
])

change('tools/website-brief-builder/index.html', [
    ('            <div class="type-options" role="radiogroup" aria-label="Project type">', '            <div class="type-options" role="radiogroup" aria-label="Project type"><label class="type-option"><input type="radio" name="projectType" value="automation" /><span><strong>AI application or automation</strong>Assistants, knowledge search, voice, messaging or connected workflows.</span></label>'),
    ('            <label for="brief-notes">', '''            <label for="brief-delivery">Delivery setup <span>(optional)</span><select id="brief-delivery" name="deliverySetup"><option value="">Choose if known</option><option value="direct">Direct business project</option><option value="agency">Agency-supplied design or brief</option><option value="migration">Replacing a frontend or migrating content</option></select></label>
            <label for="brief-inventory">Current URL inventory and content owner <span>(optional)</span><textarea id="brief-inventory" name="inventoryNotes" rows="3" placeholder="Which public pages must remain? Who approves content and URL changes?"></textarea></label>
            <label for="brief-publishing">Editing, preview and publishing requirements <span>(optional)</span><textarea id="brief-publishing" name="publishingNotes" rows="3" placeholder="Who edits? How should drafts be reviewed? When should public pages update?"></textarea></label>
            <label for="brief-handoff">Review, acceptance and handover <span>(optional)</span><textarea id="brief-handoff" name="handoffNotes" rows="3" placeholder="Who supplies designs, reviews work and owns deployment or support? For AI, what needs a human decision?"></textarea></label>
            <label for="brief-notes">''')
])
change('js/brief-builder.js', [
    ('  const TYPES = {', '''  const TYPES = {
    automation: {
      label: "AI application or automation",
      audience: "e.g. an operations team handling incoming enquiries",
      action: "e.g. review a qualified enquiry and record its next action",
      pages: ["Input or conversation", "Review queue", "Workflow status", "Settings"],
      features: ["AI assistant", "Document knowledge search (RAG)", "Human review", "CRM integration", "n8n or Zapier workflow", "WhatsApp messaging", "Voice receptionist", "Logs and failure handling"],
      service: "/services/ai-development/"
    },'''),
    ('    field("Integrations", d.integrations, false);', '''    field("Integrations", d.integrations, false);
    field("Delivery setup", ({direct:"Direct business project",agency:"Agency-supplied design or brief",migration:"Frontend/content migration"})[d.deliverySetup], false);
    field("Existing URLs and content ownership", d.inventoryNotes, false);
    field("Editing, preview and publishing", d.publishingNotes, false);
    field("Review, acceptance and handover", d.handoffNotes, false);'''),
    ('    if (type === "product") q.push(', '    if (type === "automation") q.push("Which inputs are approved, which actions require review, and who handles a failed or unsupported task?");\n    if (d.deliverySetup === "agency") q.push("Who owns end-client communication, design changes and final acceptance?");\n    if (d.deliverySetup === "migration") q.push("Has the existing URL inventory been reviewed and has each change been assigned an owner?");\n    if (type === "product") q.push(')
])
print('Extended cost planning, migration inventory and agency/AI project briefs.')
