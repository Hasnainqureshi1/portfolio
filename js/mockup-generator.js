(() => {
  "use strict";
  const form = document.getElementById("mockup-form");
  if (!form) return;
  const $ = (id) => document.getElementById(id);
  const canvas = $("mockup-canvas");
  const context = canvas.getContext("2d");
  const filesInput = $("mockup-files");
  const status = $("mockup-status");
  const errors = $("mockup-errors");
  const cards = $("mockup-images");
  const drop = $("mockup-drop");
  const maxFiles = 3;
  const maxBytes = 20 * 1024 * 1024;
  const maxPixels = 16000000;
  let images = [];
  let isDemo = false;
  let busy = false;
  let nextId = 1;
  let dragDepth = 0;
  let animation = 0;
  let selectedId = null;
  let previewGeometry = [];
  let pointer = null;
  const ratios = { landscape: 16 / 9, square: 1, portrait: 4 / 5 };
  const frames = { browser: "Browser window", phone: "Phone", tablet: "Tablet", plain: "No frame" };

  function element(tag, text, className) {
    const item = document.createElement(tag);
    if (text !== undefined) item.textContent = text;
    if (className) item.className = className;
    return item;
  }
  function rounded(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
  function settings() {
    return {
      ratio: ratios[$("mockup-ratio").value],
      arrangement: $("mockup-layout").value,
      fit: $("mockup-fit").value,
      padding: Number($("mockup-padding").value) / 100,
      background: $("mockup-background").value,
      colourOne: $("mockup-colour-one").value,
      colourTwo: $("mockup-colour-two").value,
      shadow: $("mockup-shadow").value,
      frameColour: $("mockup-frame-colour").value,
      heading: $("mockup-heading").value.trim(),
      subtitle: $("mockup-subtitle").value.trim(),
      textAlign: $("mockup-text-align").value,
      textSize: Number($("mockup-text-size").value),
      textColour: $("mockup-text-colour").value
    };
  }
  function syncOptions() {
    $("mockup-padding-value").textContent = `${$("mockup-padding").value}%`;
    $("mockup-colours").hidden = $("mockup-background").value === "transparent";
    $("mockup-colour-two-label").hidden = $("mockup-background").value !== "gradient";
    $("mockup-download").disabled = busy || !images.length;
    $("mockup-quick-download").disabled = busy || !images.length;
    $("mockup-recentre").disabled = busy || !images.length;
    $("mockup-text-size-value").textContent = $("mockup-text-size").value;
    $("mockup-quality").disabled = busy || $("mockup-format").value !== "image/webp";
    $("mockup-quality-value").textContent = $("mockup-format").value === "image/webp" ? `${$("mockup-quality").value}%` : "Not applicable for PNG";
  }
  function setBusy(value) {
    busy = value;
    form.querySelectorAll("input, select, button").forEach((control) => { control.disabled = value; });
    $("mockup-text-options").querySelectorAll("input, select, button").forEach((control) => { control.disabled = value; });
    cards.querySelectorAll("select, button, input").forEach((control) => {
      const index = images.findIndex((entry) => String(entry.id) === control.dataset.imageId);
      control.disabled = value || (control.dataset.action === "previous" && index === 0) || (control.dataset.action === "next" && index === images.length - 1);
    });
    filesInput.disabled = value;
    $("mockup-quick-download").disabled = value || !images.length;
    $("mockup-recentre").disabled = value || !images.length;
    $("mockup-add-text").disabled = value;
    if (!value) syncOptions();
    canvas.setAttribute("aria-busy", String(value));
  }
  function clearImages() {
    images.forEach((entry) => {
      if (entry.file) URL.revokeObjectURL(entry.url);
      entry.image.src = "";
    });
    images = [];
    isDemo = false;
    selectedId = null;
    previewGeometry = [];
  }
  function clearErrors() { errors.replaceChildren(); errors.hidden = true; }
  function error(message) { errors.append(element("li", message)); errors.hidden = false; }
  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Could not decode this file as an image."));
      image.src = url;
    });
  }
  function drawImageInScreen(ctx, entry, x, y, width, height, fit) {
    const image = entry.image;
    const iw = image.naturalWidth;
    const ih = image.naturalHeight;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    if (fit === "contain") {
      const scale = Math.min(width / iw, height / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      ctx.drawImage(image, x + (width - dw) / 2, y + (height - dh) / 2, dw, dh);
    } else {
      const scale = Math.max(width / iw, height / ih);
      const sw = width / scale;
      const sh = height / scale;
      ctx.drawImage(image, (iw - sw) / 2, (ih - sh) * entry.crop, sw, sh, x, y, width, height);
    }
  }
  function drawFrame(ctx, entry, x, y, width, height, options) {
    const frame = entry.frame;
    const radius = width * (frame === "phone" ? .11 : frame === "tablet" ? .065 : .02);
    ctx.save();
    if (options.shadow === "soft") {
      ctx.shadowColor = "rgba(20, 40, 30, .23)";
      ctx.shadowBlur = width * .055;
      ctx.shadowOffsetY = width * .035;
    }
    ctx.fillStyle = frame === "phone" || frame === "tablet" ? options.frameColour : "#fbfcf9";
    rounded(ctx, x, y, width, height, radius);
    ctx.fill();
    ctx.restore();
    let sx = x, sy = y, sw = width, sh = height, screenRadius = radius;
    if (frame === "browser") {
      const edge = width * .005;
      const toolbar = width * .068;
      sx += edge; sy += toolbar; sw -= edge * 2; sh -= toolbar + edge;
      screenRadius = width * .009;
      ctx.save();
      ["#d18d7d", "#d5bc78", "#91b69e"].forEach((colour, index) => {
        ctx.fillStyle = colour;
        ctx.beginPath(); ctx.arc(x + width * (.029 + index * .025), y + toolbar / 2, width * .0065, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = "#e8ede7";
      rounded(ctx, x + width * .14, y + toolbar * .25, width * .66, toolbar * .5, toolbar * .1); ctx.fill();
      ctx.restore();
    } else if (frame === "phone" || frame === "tablet") {
      const edge = width * .035;
      sx += edge; sy += edge; sw -= edge * 2; sh -= edge * 2;
      screenRadius = radius - edge;
    }
    ctx.save();
    rounded(ctx, sx, sy, sw, sh, screenRadius); ctx.clip();
    ctx.fillStyle = "#ffffff"; ctx.fillRect(sx, sy, sw, sh);
    drawImageInScreen(ctx, entry, sx, sy, sw, sh, options.fit);
    ctx.restore();
    if (frame === "phone") {
      ctx.fillStyle = options.frameColour;
      rounded(ctx, x + width * .36, y + width * .065, width * .28, width * .045, width * .0225); ctx.fill();
    }
  }
  function wrappedLines(ctx, text, maxWidth, limit) {
    // Break long tokens too, so even a heading without spaces fits the export.
    const lines = [];
    let line = "";
    for (const character of text) {
      if (line && ctx.measureText(line + character).width > maxWidth) {
        const space = line.lastIndexOf(" ");
        if (space > line.length / 2) { lines.push(line.slice(0, space)); line = line.slice(space + 1) + character; }
        else { lines.push(line); line = character; }
      } else line += character;
    }
    if (line) lines.push(line);
    if (lines.length > limit) {
      lines.length = limit;
      let last = lines[limit - 1];
      while (last && ctx.measureText(last + "…").width > maxWidth) last = last.slice(0, -1);
      lines[limit - 1] = last + "…";
    }
    return lines;
  }
  function drawText(ctx, options, w, margin) {
    if (!options.heading && !options.subtitle) return 0;
    ctx.save();
    ctx.fillStyle = options.textColour;
    ctx.textAlign = options.textAlign;
    ctx.textBaseline = "top";
    const x = options.textAlign === "center" ? w / 2 : margin;
    const width = w - margin * 2;
    const size = options.textSize * w / 1200;
    let y = margin;
    if (options.heading) {
      ctx.font = `500 ${size}px Moderat, Arial, sans-serif`;
      for (const line of wrappedLines(ctx, options.heading, width, 2)) { ctx.fillText(line, x, y); y += size * 1.18; }
    }
    if (options.subtitle) {
      y += w * .012;
      const captionSize = w * .018;
      ctx.font = `400 ${captionSize}px Moderat, Arial, sans-serif`;
      for (const line of wrappedLines(ctx, options.subtitle, width, 3)) { ctx.fillText(line, x, y); y += captionSize * 1.35; }
    }
    ctx.restore();
    return y - margin + w * .025;
  }
  function render(target, options, editing = false) {
    const ctx = target.getContext("2d");
    if (!ctx) throw new Error("Canvas drawing is unavailable in this browser.");
    const w = target.width;
    const h = target.height;
    ctx.clearRect(0, 0, w, h);
    if (options.background !== "transparent") {
      if (options.background === "gradient") {
        const gradient = ctx.createLinearGradient(0, 0, w, h);
        gradient.addColorStop(0, options.colourOne); gradient.addColorStop(1, options.colourTwo);
        ctx.fillStyle = gradient;
      } else ctx.fillStyle = options.colourOne;
      ctx.fillRect(0, 0, w, h);
    }
    if (!images.length) {
      if (editing) previewGeometry = [];
      ctx.fillStyle = "#23322c";
      ctx.font = `500 ${Math.round(w * .024)}px Moderat, Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("Add screenshots to create your mockup", w / 2, h / 2, w * .84);
      return;
    }
    const unit = Math.min(w, h);
    const margin = unit * options.padding;
    const textHeight = drawText(ctx, options, w, margin);
    const gap = unit * .035;
    const availableWidth = w - margin * 2;
    const availableHeight = Math.max(h * .2, h - margin * 2 - textHeight);
    const stagger = options.arrangement === "staggered" && images.length > 1 ? availableHeight * .065 : 0;
    const slotWidth = (availableWidth - gap * (images.length - 1)) / images.length;
    const maxHeight = availableHeight - stagger * 2;
    const dimensions = images.map((entry) => {
      const aspect = { browser: .693, phone: 2.12, tablet: 1.38, plain: entry.image.naturalHeight / entry.image.naturalWidth }[entry.frame];
      const width = Math.min(slotWidth, maxHeight / aspect);
      return { width, height: width * aspect };
    });
    const totalWidth = dimensions.reduce((sum, dimension) => sum + dimension.width, 0) + gap * (images.length - 1);
    let x = (w - totalWidth) / 2;
    const geometry = [];
    images.forEach((entry, index) => {
      let { width, height } = dimensions[index];
      const offset = stagger ? (index % 2 === 0 ? -stagger : stagger) : 0;
      const baseCentreX = x + width / 2;
      const baseCentreY = margin + textHeight + availableHeight / 2 + offset;
      x += width + gap;
      const angle = (entry.rotation || 0) * Math.PI / 180;
      width *= entry.scale || 1;
      height *= entry.scale || 1;
      const cos = Math.abs(Math.cos(angle)), sin = Math.abs(Math.sin(angle));
      const safe = unit * .02;
      const top = margin + textHeight;
      const shrink = Math.min(1, (w - safe * 2) / (cos * width + sin * height), Math.max(h * .1, h - top - safe) / (sin * width + cos * height));
      width *= shrink; height *= shrink;
      const boundX = (cos * width + sin * height) / 2;
      const boundY = (sin * width + cos * height) / 2;
      const cx = Math.max(safe + boundX, Math.min(w - safe - boundX, baseCentreX + (entry.offsetX || 0) * w));
      const cy = Math.max(top + boundY, Math.min(h - safe - boundY, baseCentreY + (entry.offsetY || 0) * h));
      const item = { id: entry.id, cx, cy, width, height, angle, baseCentreX, baseCentreY };
      geometry.push(item);
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle);
      drawFrame(ctx, entry, -width / 2, -height / 2, width, height, options);
      if (editing && entry.id === selectedId) {
        ctx.strokeStyle = "#945035"; ctx.lineWidth = w / 600; ctx.setLineDash([w / 150, w / 200]);
        rounded(ctx, -width / 2 - w * .004, -height / 2 - w * .004, width + w * .008, height + w * .008, width * .03); ctx.stroke();
      }
      ctx.restore();
    });
    if (editing) previewGeometry = geometry;
  }
  function preview() {
    animation = 0;
    const options = settings();
    canvas.width = 1200;
    canvas.height = Math.round(canvas.width / options.ratio);
    if (!images.some((entry) => entry.id === selectedId)) selectedId = images[0]?.id ?? null;
    try { render(canvas, options, true); }
    catch (cause) { status.textContent = cause.message; return; }
    const exportWidth = Number($("mockup-width").value);
    $("mockup-caption").textContent = `${isDemo ? "Demo screenshots. " : ""}${images.length} screen${images.length === 1 ? "" : "s"}. Export: ${exportWidth} × ${Math.round(exportWidth / options.ratio)} px. ${options.background === "transparent" ? "Transparent background." : ""}`;
    canvas.setAttribute("aria-label", images.length ? `Mockup preview with ${images.length} screenshot${images.length === 1 ? "" : "s"}: ${images.map((entry) => `${entry.name} in a ${frames[entry.frame].toLowerCase()} frame`).join("; ")}.` : "Empty mockup. Choose screenshot images to create a preview.");
    syncOptions();
    cards.querySelectorAll(".mockup-image").forEach((card) => card.classList.toggle("is-selected", Number(card.dataset.imageId) === selectedId));
  }
  function schedulePreview() {
    syncOptions();
    if (!animation) animation = requestAnimationFrame(preview);
  }
  function selectControl(entry, title, type, options, selected) {
    const label = element("label", title);
    const select = element("select");
    const id = `mockup-${type}-${entry.id}`;
    label.htmlFor = id;
    select.id = id;
    select.dataset.control = type;
    select.dataset.imageId = entry.id;
    select.setAttribute("aria-label", `${title} for ${entry.name}`);
    for (const [value, text] of (Array.isArray(options) ? options : Object.entries(options))) {
      const option = element("option", text);
      option.value = value;
      option.selected = String(value) === String(selected);
      select.append(option);
    }
    label.append(select);
    return label;
  }
  function renderCards(focusId) {
    cards.replaceChildren();
    images.forEach((entry, index) => {
      const card = element("article", undefined, "mockup-image");
      card.dataset.imageId = entry.id;
      const thumb = element("img"); thumb.src = entry.url; thumb.alt = "";
      const heading = element("div");
      heading.append(element("h3", `${index + 1}. ${entry.name}`), element("p", `${entry.image.naturalWidth} × ${entry.image.naturalHeight} px${entry.file ? "" : " · demo"}`));
      const controls = element("div", undefined, "mockup-image-settings");
      controls.append(selectControl(entry, "Frame", "frame", frames, entry.frame), selectControl(entry, "Crop position", "crop", [[0, "Top"], [.5, "Centre"], [1, "Bottom"]], entry.crop));
      const actions = element("div", undefined, "mockup-image-actions");
      for (const [action, text, disabled] of [["select", "Select screen", false], ["previous", "Move left", index === 0], ["next", "Move right", index === images.length - 1], ["remove", "Remove", false]]) {
        const button = element("button", text, "mockup-text-button");
        button.type = "button";
        button.dataset.action = action;
        button.dataset.imageId = entry.id;
        button.id = `mockup-${action}-${entry.id}`;
        button.disabled = disabled;
        button.setAttribute("aria-label", `${text}: ${entry.name}`);
        actions.append(button);
      }
      const transforms = element("details", undefined, "mockup-options mockup-image-transform");
      transforms.append(element("summary", "Position, size and rotation"));
      for (const [key, title, min, max, fallback, factor] of [["offsetX", "Horizontal position", -40, 40, 0, 100], ["offsetY", "Vertical position", -40, 40, 0, 100], ["scale", "Size", 50, 150, 1, 100], ["rotation", "Rotation", -30, 30, 0, 1]]) {
        const label = element("label", title);
        const input = element("input");
        input.type = "range"; input.min = min; input.max = max; input.step = 1;
        input.value = Math.round((entry[key] ?? fallback) * factor);
        input.id = `mockup-${key}-${entry.id}`; label.htmlFor = input.id;
        input.dataset.control = key; input.dataset.imageId = entry.id;
        input.setAttribute("aria-label", `${title} for ${entry.name}`);
        const output = element("output", `${input.value}${key === "rotation" ? "°" : "%"}`);
        output.id = `${input.id}-value`; output.htmlFor = input.id;
        label.append(output, input); transforms.append(label);
      }
      const reset = element("button", "Reset this screen", "mockup-text-button");
      reset.type = "button"; reset.dataset.action = "reset-transform"; reset.dataset.imageId = entry.id;
      transforms.append(reset);
      card.append(thumb, heading, controls, actions, transforms); cards.append(card);
    });
    if (focusId) $(focusId)?.focus();
  }
  async function addFiles(incoming) {
    if (busy) return;
    clearErrors(); setBusy(true);
    let added = 0;
    try {
      for (const file of incoming) {
        if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) && !(file.type === "" && /\.(png|jpe?g|webp)$/i.test(file.name))) { error(`${file.name}: choose a JPG, PNG or WebP screenshot.`); continue; }
        if (file.size > maxBytes) { error(`${file.name}: exceeds the 20 MB file limit.`); continue; }
        if (!isDemo && images.length >= maxFiles) { error(`${file.name}: only three screenshots fit in a mockup. Remove one before adding another.`); continue; }
        if (images.some((entry) => entry.file && entry.file.name === file.name && entry.file.size === file.size && entry.file.lastModified === file.lastModified)) { error(`${file.name}: already selected.`); continue; }
        const url = URL.createObjectURL(file);
        let image;
        try {
          status.textContent = `Reading ${file.name}...`;
          image = await loadImage(url);
          if (!image.naturalWidth || !image.naturalHeight) throw new Error("The image has invalid dimensions.");
          if (image.naturalWidth * image.naturalHeight > maxPixels) throw new Error("Exceeds the 16 megapixel image limit. Resize it first.");
          if (isDemo) clearImages();
          images.push({ id: nextId++, image, url, file, name: file.name, frame: $("mockup-frame").value, crop: 0 });
          added++;
        } catch (cause) { URL.revokeObjectURL(url); if (image) image.src = ""; error(`${file.name}: ${cause.message}`); }
      }
      filesInput.value = "";
      renderCards(); preview();
      status.textContent = added ? `${images.length} screenshot${images.length === 1 ? "" : "s"} ready. Adjust the frames below, then download your mockup.` : "No new screenshots added. Review any errors below.";
    } finally { setBusy(false); }
  }
  filesInput.addEventListener("change", () => addFiles(Array.from(filesInput.files)));
  drop.addEventListener("dragenter", (event) => { event.preventDefault(); dragDepth++; if (!busy) drop.classList.add("is-dragging"); });
  drop.addEventListener("dragover", (event) => { event.preventDefault(); event.dataTransfer.dropEffect = busy ? "none" : "copy"; });
  drop.addEventListener("dragleave", () => { if (--dragDepth <= 0) { dragDepth = 0; drop.classList.remove("is-dragging"); } });
  drop.addEventListener("drop", (event) => { event.preventDefault(); dragDepth = 0; drop.classList.remove("is-dragging"); addFiles(Array.from(event.dataTransfer.files)); });
  window.addEventListener("dragover", (event) => { if (event.dataTransfer.types.includes("Files")) event.preventDefault(); });
  window.addEventListener("drop", (event) => { if (event.dataTransfer.types.includes("Files")) event.preventDefault(); });
  function customStyle() { $("mockup-preset").value = "custom"; }
  $("mockup-text-options").addEventListener("input", () => { customStyle(); schedulePreview(); });
  $("mockup-text-options").addEventListener("change", schedulePreview);
  form.addEventListener("input", (event) => {
    if (!["mockup-preset", "mockup-width", "mockup-format", "mockup-quality"].includes(event.target.id)) customStyle();
    schedulePreview();
  });
  form.addEventListener("change", (event) => {
    if (event.target.id === "mockup-preset") { applyPreset(event.target.value); return; }
    if (!["mockup-width", "mockup-format", "mockup-quality"].includes(event.target.id)) customStyle();
    if (event.target.id === "mockup-frame") { images.forEach((entry) => { entry.frame = event.target.value; }); renderCards(); }
    schedulePreview();
  });
  function resetTransform(entry) { Object.assign(entry, { offsetX: 0, offsetY: 0, scale: 1, rotation: 0 }); }
  function syncTransform(entry) {
    for (const key of ["offsetX", "offsetY", "scale", "rotation"]) {
      const input = $(`mockup-${key}-${entry.id}`);
      if (!input) continue;
      input.value = Math.round((entry[key] ?? (key === "scale" ? 1 : 0)) * (key === "rotation" ? 1 : 100));
      $(`${input.id}-value`).textContent = `${input.value}${key === "rotation" ? "°" : "%"}`;
    }
  }
  function applyPreset(name) {
    if (name === "custom") return;
    const values = {
      clean: { ratio: "landscape", layout: "row", padding: 10, "colour-one": "#dce6de", "colour-two": "#f4eee2" },
      launch: { ratio: "square", layout: "staggered", padding: 10, "colour-one": "#e0e6e8", "colour-two": "#f1e3d3" },
      apps: { ratio: "portrait", layout: "row", padding: 8, "colour-one": "#dbe4ef", "colour-two": "#efe1eb" }
    }[name];
    if (!values) return;
    Object.entries(values).forEach(([key, value]) => { $(`mockup-${key}`).value = value; });
    $("mockup-background").value = "gradient"; $("mockup-shadow").value = "soft";
    images.forEach((entry, index) => {
      resetTransform(entry);
      if (name === "apps") { entry.frame = "phone"; entry.rotation = (index - (images.length - 1) / 2) * 5; }
      if (name === "launch") { entry.frame = index === 0 ? "browser" : "phone"; entry.rotation = index % 2 === 0 ? -4 : 4; }
    });
    renderCards(); preview(); status.textContent = "Style applied. Your heading and caption are preserved.";
  }
  cards.addEventListener("input", (event) => {
    const control = event.target;
    const entry = images.find((item) => String(item.id) === control.dataset.imageId);
    if (!entry || busy || !["offsetX", "offsetY", "scale", "rotation"].includes(control.dataset.control)) return;
    entry[control.dataset.control] = Number(control.value) / (control.dataset.control === "rotation" ? 1 : 100);
    selectedId = entry.id; customStyle(); syncTransform(entry); schedulePreview();
  });
  cards.addEventListener("change", (event) => {
    const control = event.target;
    const entry = images.find((item) => String(item.id) === control.dataset.imageId);
    if (!entry || busy) return;
    selectedId = entry.id; customStyle();
    if (control.dataset.control === "frame") entry.frame = control.value;
    if (control.dataset.control === "crop") entry.crop = Number(control.value);
    schedulePreview();
  });
  cards.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button || busy) return;
    const index = images.findIndex((entry) => String(entry.id) === button.dataset.imageId);
    if (index < 0) return;
    const entry = images[index];
    if (button.dataset.action === "select") {
      selectedId = entry.id; canvas.focus({ preventScroll: true });
      status.textContent = `${entry.name} selected. Drag it or use the arrow keys to move it.`;
    } else if (button.dataset.action === "reset-transform") {
      resetTransform(entry); syncTransform(entry); selectedId = entry.id; customStyle();
      status.textContent = `${entry.name} position, size and rotation reset.`;
    } else if (button.dataset.action === "remove") {
      if (entry.file) URL.revokeObjectURL(entry.url);
      entry.image.src = "";
      images.splice(index, 1);
      const adjacent = images[Math.min(index, images.length - 1)];
      renderCards(adjacent ? `mockup-frame-${adjacent.id}` : undefined);
      if (!images.length) { isDemo = false; filesInput.focus(); }
      status.textContent = `${entry.name} removed. ${images.length} screenshot${images.length === 1 ? "" : "s"} remaining.`;
    } else {
      const target = index + (button.dataset.action === "previous" ? -1 : 1);
      if (target < 0 || target >= images.length) return;
      [images[index], images[target]] = [images[target], images[index]];
      renderCards(`mockup-frame-${entry.id}`);
      status.textContent = `${entry.name} moved to position ${target + 1}.`;
    }
    preview();
  });
  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height };
  }
  canvas.addEventListener("pointerdown", (event) => {
    if (busy || (event.pointerType === "mouse" && event.button !== 0)) return;
    const point = canvasPoint(event);
    const hit = [...previewGeometry].reverse().find((item) => {
      const dx = point.x - item.cx, dy = point.y - item.cy;
      const cos = Math.cos(item.angle), sin = Math.sin(item.angle);
      return Math.abs(cos * dx + sin * dy) <= item.width / 2 && Math.abs(-sin * dx + cos * dy) <= item.height / 2;
    });
    if (!hit) return;
    selectedId = hit.id; pointer = { ...hit, pointerId: event.pointerId, startX: point.x, startY: point.y };
    canvas.focus({ preventScroll: true }); canvas.setPointerCapture(event.pointerId); canvas.classList.add("is-dragging");
    event.preventDefault(); schedulePreview();
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!pointer || event.pointerId !== pointer.pointerId || busy) return;
    const entry = images.find((item) => item.id === pointer.id);
    if (!entry) return;
    const point = canvasPoint(event);
    entry.offsetX = Math.max(-.4, Math.min(.4, (pointer.cx + point.x - pointer.startX - pointer.baseCentreX) / canvas.width));
    entry.offsetY = Math.max(-.4, Math.min(.4, (pointer.cy + point.y - pointer.startY - pointer.baseCentreY) / canvas.height));
    syncTransform(entry); schedulePreview();
    customStyle();
  });
  function finishDrag(event) {
    if (!pointer || event.pointerId !== pointer.pointerId) return;
    pointer = null; canvas.classList.remove("is-dragging");
    status.textContent = "Screen position updated. Use its controls below to resize or rotate it.";
  }
  canvas.addEventListener("pointerup", finishDrag);
  canvas.addEventListener("pointercancel", finishDrag);
  canvas.addEventListener("lostpointercapture", finishDrag);
  canvas.addEventListener("keydown", (event) => {
    if (busy || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    const entry = images.find((item) => item.id === selectedId);
    if (!entry) return;
    event.preventDefault();
    const horizontal = ["ArrowLeft", "ArrowRight"].includes(event.key);
    const key = horizontal ? "offsetX" : "offsetY";
    const sign = ["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 1;
    entry[key] = Math.max(-.4, Math.min(.4, (entry[key] || 0) + sign * (event.shiftKey ? 20 : 5) / (horizontal ? canvas.width : canvas.height)));
    syncTransform(entry); schedulePreview();
    customStyle();
  });
  $("mockup-recentre").addEventListener("click", () => {
    if (busy) return;
    images.forEach(resetTransform); images.forEach(syncTransform); customStyle(); preview();
    status.textContent = "All screen positions, sizes and rotations reset.";
  });
  $("mockup-add-text").addEventListener("click", () => {
    if (busy) return;
    $("mockup-heading").focus();
    status.textContent = "Add a heading and an optional caption. Text appears above your screens and is included in the download.";
  });
  $("mockup-clear-text").addEventListener("click", () => {
    if (busy) return;
    $("mockup-heading").value = ""; $("mockup-subtitle").value = "";
    customStyle(); preview();
    status.textContent = "Heading and caption removed.";
  });
  $("mockup-reset").addEventListener("click", () => {
    if (busy) return;
    clearImages(); clearErrors(); filesInput.value = ""; renderCards(); preview();
    status.textContent = "Screenshots cleared. Choose images to start a new mockup.";
  });

  function demoArtwork(phone) {
    const sample = document.createElement("canvas");
    sample.width = phone ? 420 : 1000;
    sample.height = phone ? 880 : 625;
    const ctx = sample.getContext("2d");
    const w = sample.width;
    ctx.fillStyle = "#f6f3e9"; ctx.fillRect(0, 0, w, sample.height);
    ctx.fillStyle = "#1f3c2e";
    ctx.font = "500 22px Moderat, Arial, sans-serif";
    ctx.fillText("FIELDNOTES", 32, phone ? 66 : 48);
    if (!phone) { ctx.font = "16px Moderat, Arial, sans-serif"; ctx.fillText("Spaces     Journal     About", 715, 48); }
    ctx.font = "500 56px Moderat, Arial, sans-serif";
    ctx.fillText(phone ? "A little room" : "A little room to breathe.", 32, phone ? 162 : 177);
    if (phone) ctx.fillText("to breathe.", 32, 225);
    ctx.font = "20px Moderat, Arial, sans-serif";
    ctx.fillText(phone ? "Find your next quiet corner." : "Thoughtful spaces for the way you work.", 32, phone ? 279 : 222);
    ctx.fillStyle = "#1f3c2e";
    rounded(ctx, 32, phone ? 320 : 263, 172, 48, 24); ctx.fill();
    ctx.fillStyle = "#f6f3e9"; ctx.font = "18px Moderat, Arial, sans-serif"; ctx.fillText("Explore spaces", 51, phone ? 350 : 293);
    const top = phone ? 410 : 350;
    const columns = phone ? 1 : 3;
    const cw = (w - 64 - (columns - 1) * 20) / columns;
    for (let index = 0; index < columns; index++) {
      const x = 32 + index * (cw + 20);
      ctx.fillStyle = ["#ceddcc", "#e5d3ba", "#c4d7da"][index];
      rounded(ctx, x, top, cw, phone ? 300 : 160, 16); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.45)";
      rounded(ctx, x + cw * .48, top + 20, cw * .36, phone ? 190 : 105, 60); ctx.fill();
      ctx.fillStyle = "#53735a"; ctx.fillRect(x + 25, top + (phone ? 186 : 100), cw * .45, 22);
      ctx.fillStyle = "#3c5843"; ctx.fillRect(x + 31, top + (phone ? 208 : 122), 10, phone ? 55 : 25);
      ctx.fillRect(x + cw * .45, top + (phone ? 208 : 122), 10, phone ? 55 : 25);
      ctx.fillStyle = "#1f3c2e"; ctx.font = "500 20px Moderat, Arial, sans-serif";
      ctx.fillText(["The garden room", "Studio mornings", "A place to gather"][index], x, top + (phone ? 338 : 197));
      ctx.font = "16px Moderat, Arial, sans-serif"; ctx.fillText("Open space. Fresh perspective.", x, top + (phone ? 368 : 224));
    }
    return sample.toDataURL("image/png");
  }
  async function loadDemo() {
    if (busy) return;
    setBusy(true); clearErrors();
    try {
      await document.fonts.ready;
      const demos = [];
      for (const phone of [false, true]) {
        const url = demoArtwork(phone);
        const image = await loadImage(url);
        demos.push({ id: nextId++, url, image, file: null, name: phone ? "Demo mobile app" : "Demo website", frame: phone ? "phone" : "browser", crop: 0 });
      }
      clearImages(); images = demos; isDemo = true; renderCards(); preview();
      status.textContent = "Demo preview. Add your screenshots to replace these examples, or adjust settings to try the editor.";
    } catch (cause) { status.textContent = `Could not load the demo: ${cause.message}. Choose a screenshot to continue.`; }
    finally { setBusy(false); }
  }
  $("mockup-demo").addEventListener("click", loadDemo);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy || !images.length || !form.reportValidity()) return;
    setBusy(true);
    status.textContent = "Preparing your mockup download...";
    let output;
    try {
      await document.fonts.ready;
      const options = settings();
      const type = $("mockup-format").value;
      output = document.createElement("canvas");
      output.width = Number($("mockup-width").value);
      output.height = Math.round(output.width / options.ratio);
      render(output, options);
      const blob = await new Promise((resolve, reject) => {
        output.toBlob((file) => {
          if (!file) reject(new Error("Could not encode this image. Try a smaller export width."));
          else if (file.type !== type) reject(new Error("This browser does not support that format. Choose PNG."));
          else resolve(file);
        }, type, Number($("mockup-quality").value) / 100);
      });
      const url = URL.createObjectURL(blob);
      const link = element("a"); link.href = url; link.download = `website-app-mockup-${output.width}x${output.height}.${type === "image/png" ? "png" : "webp"}`;
      link.addEventListener("click",event=>event.stopPropagation());
      document.body.append(link); link.click(); link.remove();
      window.trackBusinessEvent?.("tool_complete",{item_count:images.length});
      window.trackBusinessEvent?.("tool_download",{format:type.split("/")[1],item_count:images.length});
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      status.textContent = `Download requested: ${output.width} × ${output.height} px, ${(blob.size / 1024 / 1024).toFixed(2)} MB. ${isDemo ? "This export uses the demo screenshots." : "Your original screenshots are unchanged."}`;
    } catch (cause) { status.textContent = `Download failed: ${cause.message}`; }
    finally { if (output) { output.width = 0; output.height = 0; } setBusy(false); }
  });
  if (!context) { status.textContent = "This browser does not support Canvas. Try a current browser."; filesInput.disabled = true; return; }
  const probe = document.createElement("canvas"); probe.width = probe.height = 1;
  if (!probe.toDataURL("image/webp").startsWith("data:image/webp")) $("mockup-format").querySelector('[value="image/webp"]').remove();
  probe.width = probe.height = 0;
  loadDemo();
})();
