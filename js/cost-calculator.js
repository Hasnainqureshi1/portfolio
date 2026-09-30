(() => {
  const form = document.querySelector("#cost-form");
  if (!form) return;

  const $ = (selector) => document.querySelector(selector);
  const result = $("#cost-result");
  const pageField = $("#cost-pages");
  const listingOption = $("#listing-option");
  const errorBox = $("#cost-form-error");
  const status = $("#cost-action-status");
  const sendForm = $("#cost-send-form");
  let estimate = null;

  const BASE = { business: 42, property: 68 };
  const FEATURE_HOURS = {
    cms: ["Content editing (CMS)", 14],
    crm: ["CRM connection", 18],
    booking: ["Booking flow", 12],
    languages: ["Extra language structure", 24],
    listing: ["Availability feed", 32]
  };
  const RATES = {
    USD: { symbol: "$", low: 55, high: 95 },
    GBP: { symbol: "£", low: 45, high: 80 }
  };

  const track = (name, detail = {}) => {
    if (typeof window.gtag === "function") {
      window.gtag("event", name, { tool: "website-cost-calculator", ...detail });
    }
  };
  const money = (amount, symbol) => symbol + Math.round(amount).toLocaleString("en-GB");
  const roundDown = (value) => Math.floor(value / 100) * 100;
  const roundUp = (value) => Math.ceil(value / 100) * 100;

  const fields = () => {
    const data = new FormData(form);
    return {
      type: data.get("projectType"),
      pages: Number(data.get("pages")),
      currency: data.get("currency"),
      design: data.get("design"),
      content: data.get("content"),
      migration: data.has("migration"),
      features: data.getAll("features")
    };
  };

  const calculate = (input) => {
    const lines = [
      [input.type === "property" ? "Commercial property base build" : "Business website base build", BASE[input.type]]
    ];
    const extraPages = Math.max(0, input.pages - 5);
    if (extraPages) lines.push([`${extraPages} page${extraPages === 1 ? "" : "s"} beyond the first five`, extraPages * 3]);
    const design = { ready: 0, brand: 18, none: 36 }[input.design];
    if (design) lines.push([input.design === "brand" ? "Page design from brand guidelines" : "Design from scratch", design]);
    const content = { ready: 0, partial: 10, missing: 20 }[input.content];
    if (content) lines.push([input.content === "partial" ? "Content preparation and page entry" : "Content planning and page entry", content]);
    if (input.migration) lines.push(["Existing site migration and redirects", 18]);
    input.features.forEach((key) => {
      if (FEATURE_HOURS[key] && (key !== "listing" || input.type === "property")) lines.push(FEATURE_HOURS[key]);
    });
    const subtotal = lines.reduce((sum, [, hours]) => sum + hours, 0);
    const coordination = Math.ceil(subtotal * 0.15);
    const hours = subtotal + coordination;
    const rate = RATES[input.currency];
    const low = roundDown(hours * 0.8 * rate.low);
    const high = roundUp(hours * 1.2 * rate.high);
    return { input, lines, subtotal, coordination, hours, low, high, rate };
  };

  const reportText = (value) => {
    const { input, lines, subtotal, coordination, hours, low, high, rate } = value;
    return [
      "WEBSITE COST PLANNING ESTIMATE",
      "Prepared " + new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
      "",
      `Planning range: ${money(low, rate.symbol)} to ${money(high, rate.symbol)} ${input.currency}`,
      "This is a planning model, not a quote or a market average.",
      "",
      "SCOPE",
      `Project: ${input.type === "property" ? "Commercial property website" : "Business website"}`,
      `Pages: ${input.pages}`,
      `Design: ${{ ready: "Finished desktop and mobile designs", brand: "Brand guidelines only", none: "Design from scratch" }[input.design]}`,
      `Content: ${{ ready: "Mostly ready", partial: "Partly ready", missing: "Mostly to be supplied" }[input.content]}`,
      `Replacing a site: ${input.migration ? "Yes" : "No"}`,
      `Features: ${input.features.length ? input.features.map((key) => FEATURE_HOURS[key][0]).join(", ") : "None selected"}`,
      "",
      "MODELED WORK",
      ...lines.map(([label, count]) => `  ${label}: ${count} hours`),
      `  Subtotal: ${subtotal} hours`,
      `  Coordination and testing (15%): ${coordination} hours`,
      `  Central model: ${hours} hours`,
      "",
      `RANGE METHOD: ${hours} hours, widened by 20% either way, at illustrative rates of ${rate.symbol}${rate.low} to ${rate.symbol}${rate.high} per hour. Range boundaries rounded outward to the nearest 100.`,
      "AFTER LAUNCH: budget separately for hosting, domain, paid tools and ongoing updates.",
      "EXCLUDED: tax, paid software, copywriting and photography.",
      "Actual quotes depend on requirements, designs, content, integrations, review rounds and supplier.",
      "",
      "https://hasnainqureshi.online/tools/website-cost-calculator/"
    ].join("\n");
  };

  const render = (value) => {
    const { input, lines, subtotal, coordination, hours, low, high, rate } = value;
    $("#cost-range").textContent = `${money(low, rate.symbol)} - ${money(high, rate.symbol)}`;
    $("#cost-caption").textContent = `Illustrative one-time build budget in ${input.currency}. For ${input.pages} ${input.pages === 1 ? "page" : "pages"} and the options you selected.`;
    const list = $("#cost-lines");
    list.replaceChildren();
    [...lines, ["Coordination and testing (15%)", coordination]].forEach(([label, count]) => {
      const row = document.createElement("div");
      const name = document.createElement("dt");
      const amount = document.createElement("dd");
      name.textContent = label;
      amount.textContent = `${count} h`;
      row.append(name, amount);
      list.append(row);
    });
    $("#cost-hours").textContent = `${hours} modeled hours in total. The budget range allows 20% less or more work and applies ${rate.symbol}${rate.low} to ${rate.symbol}${rate.high} per hour.`;
    $("#cost-breakdown").hidden = false;
    $("#cost-ongoing").hidden = false;
    $("#cost-actions").hidden = false;
    status.textContent = "";
  };

  const updatePropertyFeature = () => {
    const show = form.elements.projectType.value === "property";
    listingOption.hidden = !show;
    const checkbox = listingOption.querySelector("input");
    checkbox.disabled = !show;
    if (!show) checkbox.checked = false;
  };

  const run = (focus = true) => {
    errorBox.textContent = "";
    if (!form.checkValidity() || !Number.isInteger(pageField.valueAsNumber) || pageField.valueAsNumber < 1 || pageField.valueAsNumber > 40) {
      errorBox.textContent = "Enter a whole number of pages between 1 and 40.";
      estimate = null;
      $("#cost-range").textContent = "Check the page count";
      $("#cost-caption").textContent = "Enter 1 to 40 pages to calculate a planning range.";
      $("#cost-breakdown").hidden = true;
      $("#cost-ongoing").hidden = true;
      $("#cost-actions").hidden = true;
      if (focus) pageField.focus();
      return;
    }
    estimate = calculate(fields());
    render(estimate);
    if (focus) {
      result.focus();
      track("cost_calculate");
    }
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    run(true);
  });
  form.addEventListener("change", (event) => {
    if (event.target.name === "projectType") updatePropertyFeature();
    if (estimate) run(false);
  });
  form.addEventListener("input", (event) => {
    if (estimate && event.target.name === "pages") run(false);
  });
  updatePropertyFeature();

  $("#cost-copy").addEventListener("click", async () => {
    if (!estimate) return;
    try {
      await navigator.clipboard.writeText(reportText(estimate));
      status.textContent = "Estimate copied.";
      track("cost_copy");
    } catch {
      status.textContent = "Copying is blocked in this browser. Use Download instead.";
    }
  });
  $("#cost-download").addEventListener("click", () => {
    if (!estimate) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([reportText(estimate)], { type: "text/plain;charset=utf-8" }));
    link.download = "website-cost-planning-estimate.txt";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    status.textContent = "Estimate downloaded.";
    track("cost_download");
  });

  let sending = false;
  sendForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (sending) return;
    if (!sendForm.checkValidity()) { sendForm.reportValidity(); return; }
    sending = true;
    const button = sendForm.querySelector('button[type="submit"]');
    const message = $("#cost-send-status");
    button.disabled = true;
    sendForm.setAttribute("aria-busy", "true");
    $("#cost-send-content").value = estimate ? reportText(estimate) : "No estimate calculated.";
    message.textContent = "Sending your details...";
    try {
      const response = await fetch(sendForm.action, {
        method: "POST",
        body: new FormData(sendForm),
        headers: { Accept: "application/json" }
      });
      if (!response.ok) throw new Error("Submission failed");
      sendForm.reset();
      message.textContent = "Thank you. Your details have been sent. I'll reply by email.";
      track("generate_lead", { method: "website-cost-calculator", has_estimate: Boolean(estimate) });
    } catch {
      message.replaceChildren(document.createTextNode("Your details could not be sent. Please try again, or "));
      const link = document.createElement("a");
      link.href = "mailto:husnainqureshi134@gmail.com?subject=Website%20cost%20planning";
      link.textContent = "email Hasnain directly";
      message.append(link, document.createTextNode("."));
    } finally {
      sending = false;
      button.disabled = false;
      sendForm.removeAttribute("aria-busy");
    }
  });
})();
