(() => {
  const form = document.querySelector("#brief-builder");
  const output = document.querySelector("#brief-output");
  if (!form || !output) return;

  const STORAGE_KEY = "hq-brief-builder-v1";
  const featureBox = document.querySelector("#feature-options");
  const suggestionBox = document.querySelector("#page-suggestions");
  const suggestionList = suggestionBox.querySelector(".suggestion-list");
  const pagesField = form.elements.pages;
  const progress = document.querySelector("#brief-progress");
  const readinessList = document.querySelector("#readiness-list");
  const actionStatus = document.querySelector("#brief-action-status");

  const TYPES = {
    company: {
      label: "Company or marketing website",
      audience: "e.g. operations managers at mid-sized UK manufacturers",
      action: "e.g. request a consultation",
      pages: ["Home", "About", "Services", "Service detail", "Case studies", "Team", "News", "Contact"],
      features: ["Contact or enquiry form", "Content editing (CMS)", "News or blog", "Case study pages", "Newsletter sign-up", "Booking or scheduling", "Multiple languages", "Analytics and conversion tracking"],
      service: "/services/nextjs-development/"
    },
    property: {
      label: "Commercial property website",
      audience: "e.g. occupiers, leasing agents and their advisers",
      action: "e.g. arrange a viewing or download the brochure",
      pages: ["Home", "The building", "Available space", "Amenities", "Location", "Gallery", "News", "Contact"],
      features: ["Availability schedule", "Floor plan and brochure downloads", "Image gallery", "Location map", "Enquiry form routed to agents", "Content editing (CMS)", "Listing or CRM feed", "Analytics and conversion tracking"],
      service: "/services/commercial-property-websites/"
    },
    product: {
      label: "SaaS product or web app",
      audience: "e.g. small clinic managers who handle bookings manually",
      action: "e.g. sign up and complete their first booking",
      pages: ["Marketing home", "Pricing", "Sign up and log in", "Onboarding", "Main dashboard", "Settings", "Admin area"],
      features: ["User accounts and login", "Roles and permissions", "Subscription billing", "Admin dashboard", "Email notifications", "Real-time updates or chat", "Reports and exports", "Public API or integrations"],
      service: "/services/saas-mvp-development/"
    }
  };

  const LABELS = {
    replacing: { new: "A new website or product", replace: "Replacing an existing website", extend: "Adding to an existing website or product" },
    design: { none: "No design or brand yet", brand: "Brand guidelines, no page designs", progress: "Page designs in progress", ready: "Final desktop and mobile designs" },
    content: { ready: "Mostly ready", partial: "Some exists, some needs writing", none: "Needs writing or sourcing" },
    editing: { often: "Our team, weekly or more", sometimes: "Our team, occasionally", developer: "A developer, on request" },
    deadline: { fixed: "Fixed, tied to an event or campaign", preferred: "Preferred, but flexible", open: "No fixed date" }
  };

  const track = (name, detail = {}) => {
    if (typeof window.gtag === "function") {
      window.gtag("event", name, { tool: "website-brief-builder", ...detail });
    }
  };

  const storage = {
    read() {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch { return null; }
    },
    write(value) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch { /* storage unavailable */ }
    },
    clear() {
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* storage unavailable */ }
    }
  };

  const getData = () => {
    const data = {};
    new FormData(form).forEach((value, key) => {
      if (key === "features") (data.features ||= []).push(value);
      else data[key] = String(value).trim();
    });
    data.features ||= [];
    return data;
  };

  const pageLines = () => pagesField.value.split("\n").map((line) => line.trim()).filter(Boolean);

  const renderSuggestions = (type) => {
    suggestionList.replaceChildren();
    if (!TYPES[type]) { suggestionBox.hidden = true; return; }
    const current = pageLines().map((line) => line.toLowerCase());
    TYPES[type].pages.forEach((page) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = page;
      button.setAttribute("aria-pressed", String(current.includes(page.toLowerCase())));
      button.addEventListener("click", () => {
        const lines = pageLines();
        const index = lines.findIndex((line) => line.toLowerCase() === page.toLowerCase());
        if (index === -1) lines.push(page); else lines.splice(index, 1);
        pagesField.value = lines.join("\n");
        button.setAttribute("aria-pressed", String(index === -1));
        update();
      });
      suggestionList.append(button);
    });
    suggestionBox.hidden = false;
  };

  const renderFeatures = (type, selected = []) => {
    featureBox.replaceChildren();
    if (!TYPES[type]) {
      const hint = document.createElement("p");
      hint.className = "field-hint";
      hint.textContent = "Choose a project type above to see common features.";
      featureBox.append(hint);
      return;
    }
    TYPES[type].features.forEach((feature) => {
      const label = document.createElement("label");
      label.className = "feature-option";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.name = "features";
      input.value = feature;
      input.checked = selected.includes(feature);
      const text = document.createElement("span");
      text.textContent = feature;
      label.append(input, text);
      featureBox.append(label);
    });
  };

  const applyTypePlaceholders = (type) => {
    const config = TYPES[type];
    form.querySelectorAll("[data-placeholder-key]").forEach((field) => {
      field.placeholder = config ? config[field.dataset.placeholderKey] : "";
    });
  };

  const formatMonth = (value) => {
    if (!value) return "";
    const [year, month] = value.split("-").map(Number);
    if (!year || !month) return value;
    return new Date(year, month - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  };

  const checks = (d) => [
    ["Project type", Boolean(d.projectType)],
    ["What it does", Boolean(d.about)],
    ["Visitors", Boolean(d.audience)],
    ["Key action", Boolean(d.action)],
    ["Design and content", Boolean(d.design && d.content)],
    ["Pages", pageLines().length > 0],
    ["Timing", Boolean(d.launch || d.deadline === "open")],
    ["Budget", Boolean(d.budget)]
  ];

  const openQuestions = (d) => {
    const q = [];
    const type = d.projectType;
    if (!type) q.push("What kind of project is this: a company website, a property website or a product?");
    if (!d.audience) q.push("Who are the main visitors or users?");
    if (!d.action) q.push("What is the one thing a visitor should do on the site?");
    if (d.design === "none") q.push("Is design part of this project, or will a designer or agency supply it?");
    if (!d.design) q.push("What design material exists today?");
    if (!d.content) q.push("How much of the text and imagery exists today?");
    if (d.content === "none" || d.content === "partial") q.push("Who will write the copy and supply photography, and by when?");
    if (d.replacing === "replace") q.push("Which current pages get search traffic or are linked from elsewhere? They will need redirects if their addresses change.");
    if (d.editing === "often" && type && !d.features.includes("Content editing (CMS)")) q.push("Your team will update content often: should content editing (CMS) be in scope?");
    if (d.integrations) q.push(`Which accounts, API access and documentation are available for: ${d.integrations}?`);
    if (type === "product") q.push("What is the one workflow a first user must be able to complete end to end?");
    if (type === "product" && d.features.includes("Subscription billing")) q.push("Which billing provider and pricing model (plans, trials, usage) will you use?");
    if (type === "property" && d.features.includes("Availability schedule")) q.push("Where does availability data come from today, and who updates it?");
    if (!d.launch && d.deadline !== "open") q.push("Is there a launch date, campaign or event the site needs to be ready for?");
    if (!d.budget) q.push("What budget range is realistic? A range helps shape a first phase that fits.");
    if (!d.decision) q.push("Who reviews and signs off the work?");
    return q;
  };

  const buildBrief = (d) => {
    const pending = "To confirm";
    const type = TYPES[d.projectType];
    const lines = [];
    const section = (title) => { lines.push("", title.toUpperCase(), "-".repeat(title.length)); };
    const field = (label, value, required = true) => {
      if (value) lines.push(`${label}: ${value}`);
      else if (required) lines.push(`${label}: ${pending}`);
    };
    const list = (label, items) => {
      if (!items.length) { lines.push(`${label}: ${pending}`); return; }
      lines.push(`${label}:`);
      items.forEach((item) => lines.push(`  - ${item}`));
    };

    lines.push(`WEBSITE PROJECT BRIEF${d.organisation ? ` - ${d.organisation}` : ""}`);
    lines.push(`Prepared ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`);

    section("1. Overview");
    field("Project type", type && type.label);
    field("Organisation", d.organisation);
    field("Current website", d.currentUrl, false);
    field("About", d.about);

    section("2. Goals");
    field("Main visitors", d.audience);
    field("Key visitor action", d.action);
    field("Success looks like", d.success, false);

    section("3. Starting point");
    field("New or replacement", LABELS.replacing[d.replacing]);
    field("Design", LABELS.design[d.design]);
    field("Content", LABELS.content[d.content]);
    field("Updated after launch by", LABELS.editing[d.editing]);

    section("4. Scope");
    list("Pages or screens", pageLines());
    if (d.projectType) list("Features", d.features);
    field("Integrations", d.integrations, false);

    section("5. Timing and budget");
    field("Target launch", formatMonth(d.launch));
    field("Date", LABELS.deadline[d.deadline], false);
    field("Budget range", d.budget);
    field("Sign-off", d.decision, false);

    if (d.notes) { section("6. Notes"); lines.push(d.notes); }

    const questions = openQuestions(d);
    if (questions.length) {
      section(`${d.notes ? 7 : 6}. Open questions`);
      questions.forEach((question) => lines.push(`  - ${question}`));
    }
    return lines.join("\n");
  };

  const renderReadiness = (d) => {
    const items = checks(d);
    readinessList.replaceChildren(...items.map(([label, done]) => {
      const li = document.createElement("li");
      li.textContent = label;
      if (done) li.className = "is-done";
      return li;
    }));
    progress.textContent = `${items.filter(([, done]) => done).length} of ${items.length} covered`;
  };

  let started = false;
  let saveTimer;
  const update = () => {
    const data = getData();
    output.textContent = buildBrief(data);
    renderReadiness(data);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => storage.write(data), 300);
  };

  const restore = (saved) => {
    if (!saved) return;
    Object.entries(saved).forEach(([key, value]) => {
      if (key === "features") return;
      const field = form.elements[key];
      if (!field) return;
      if (key === "projectType") {
        const radio = form.querySelector(`input[name="projectType"][value="${CSS.escape(value)}"]`);
        if (radio) radio.checked = true;
      } else {
        field.value = value;
      }
    });
    renderFeatures(saved.projectType, saved.features || []);
    renderSuggestions(saved.projectType);
    applyTypePlaceholders(saved.projectType);
  };

  form.addEventListener("input", (event) => {
    if (!started) { started = true; track("tool_start"); }
    if (event.target.name === "pages") renderSuggestions(getData().projectType);
    update();
  });

  form.addEventListener("change", (event) => {
    if (event.target.name === "projectType") {
      const type = event.target.value;
      const kept = getData().features.filter((feature) => TYPES[type].features.includes(feature));
      renderFeatures(type, kept);
      renderSuggestions(type);
      applyTypePlaceholders(type);
      track("tool_project_type", { project_type: type });
    }
    update();
  });

  form.addEventListener("submit", (event) => event.preventDefault());

  document.querySelector("#brief-reset").addEventListener("click", () => {
    if (!window.confirm("Clear all answers? This also removes the copy saved in this browser.")) return;
    form.reset();
    storage.clear();
    renderFeatures("");
    renderSuggestions("");
    applyTypePlaceholders("");
    update();
    actionStatus.textContent = "Answers cleared.";
  });

  const briefText = () => buildBrief(getData());
  const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

  document.querySelector("#brief-copy").addEventListener("click", async () => {
    const text = briefText();
    try {
      await navigator.clipboard.writeText(text);
      actionStatus.textContent = "Brief copied. Paste it into an email or document.";
    } catch {
      const range = document.createRange();
      range.selectNodeContents(output);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      actionStatus.textContent = "Brief selected. Press Ctrl+C (or Cmd+C) to copy.";
    }
    track("brief_copy");
  });

  document.querySelector("#brief-download").addEventListener("click", () => {
    const org = getData().organisation;
    const blob = new Blob([briefText()], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `website-brief${org && slug(org) ? `-${slug(org)}` : ""}.txt`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    actionStatus.textContent = "Brief downloaded.";
    track("brief_download");
  });

  document.querySelector("#brief-print").addEventListener("click", () => {
    track("brief_print");
    window.print();
  });

  restore(storage.read());
  update();

  // Optional send form
  const sendForm = document.querySelector("#brief-send-form");
  const sendStatus = document.querySelector("#brief-send-status");
  const sendContent = document.querySelector("#brief-send-content");
  if (!sendForm || !sendStatus || !sendContent) return;

  document.querySelectorAll('a[href="#send-brief"]').forEach((link) => {
    link.addEventListener("click", () => track("contact_click", { method: "header-send-brief" }));
  });

  let submitting = false;
  sendForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitting) return;
    if (!sendForm.checkValidity()) { sendForm.reportValidity(); return; }
    const data = getData();
    if (!data.projectType && !data.about && !pageLines().length) {
      sendStatus.textContent = "Your brief is empty. Answer a few questions above first.";
      return;
    }
    submitting = true;
    const button = sendForm.querySelector('button[type="submit"]');
    button.disabled = true;
    sendForm.setAttribute("aria-busy", "true");
    sendContent.value = buildBrief(data);
    sendForm.elements._subject.value = `Website brief${data.organisation ? ` - ${data.organisation}` : ""}`;
    sendStatus.textContent = "Sending your brief...";
    try {
      const response = await fetch(sendForm.action, {
        method: "POST",
        body: new FormData(sendForm),
        headers: { Accept: "application/json" }
      });
      if (!response.ok) throw new Error("Submission failed");
      sendForm.reset();
      sendStatus.textContent = "Thank you. Your brief has been sent. I'll reply by email.";
      track("generate_lead", { method: "brief-builder-form", project_type: data.projectType || "unknown" });
    } catch {
      sendStatus.replaceChildren(document.createTextNode("Your brief could not be sent. Your answers are still here. Try again, or copy the brief and "));
      const email = document.createElement("a");
      email.href = "mailto:husnainqureshi134@gmail.com?subject=Website%20brief";
      email.textContent = "email Hasnain directly";
      sendStatus.append(email, document.createTextNode("."));
    } finally {
      submitting = false;
      button.disabled = false;
      sendForm.removeAttribute("aria-busy");
    }
  });
})();
