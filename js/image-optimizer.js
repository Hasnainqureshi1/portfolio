(() => {
  "use strict";
  const form = document.querySelector("#optimizer-form");
  if (!form) return;
  const $ = (id) => document.getElementById(id);
  const filesInput = $("image-files");
  const drop = $("image-drop");
  const format = $("image-format");
  const quality = $("image-quality");
  const processButton = $("image-process");
  const resetButton = $("image-reset");
  const downloadAll = $("image-download-all");
  const resultsBox = $("image-results");
  const status = $("image-status");
  const errorsBox = $("image-errors");
  const summary = $("image-summary");
  const MAX_FILES = 20;
  const MAX_FILE_BYTES = 20 * 1024 * 1024;
  const MAX_BATCH_BYTES = 100 * 1024 * 1024;
  const MAX_PIXELS = 16000000;
  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
  let files = [];
  let results = [];
  let busy = false;
  let dragDepth = 0;

  const size = (bytes) => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  const node = (tag, text, className) => {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  };
  function addError(message) {
    errorsBox.append(node("li", message));
    errorsBox.hidden = false;
  }
  function clearResults() {
    results.forEach((result) => {
      URL.revokeObjectURL(result.originalUrl);
      URL.revokeObjectURL(result.outputUrl);
    });
    results = [];
    resultsBox.replaceChildren();
    summary.hidden = true;
  }
  function setBusy(value) {
    busy = value;
    form.querySelectorAll("input, select, button").forEach((control) => { control.disabled = value; });
    filesInput.disabled = value;
    downloadAll.disabled = value;
    if (!value) {
      processButton.disabled = !files.length;
      resetButton.disabled = !files.length && !results.length;
      syncSettings();
    }
    resultsBox.setAttribute("aria-busy", String(value));
  }
  function syncSettings() {
    quality.disabled = busy || format.value === "image/png";
    $("quality-value").textContent = format.value === "image/png" ? "Not applicable" : `${quality.value}%`;
    $("quality-hint").textContent = format.value === "image/png" ? "PNG uses lossless encoding. Resize dimensions to reduce pixel count; quality does not apply." : "Lower quality usually creates smaller files. Check the preview before using them.";
    $("jpeg-background").hidden = format.value !== "image/jpeg";
  }
  function acceptFiles(incoming) {
    if (busy) return;
    errorsBox.replaceChildren();
    errorsBox.hidden = true;
    let totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    let added = 0;
    for (const file of incoming) {
      if (!allowedTypes.has(file.type) && !(file.type === "" && /\.(jpe?g|png|webp)$/i.test(file.name))) {
        addError(`${file.name}: choose a JPG, PNG or WebP image.`);
      } else if (file.size > MAX_FILE_BYTES) {
        addError(`${file.name}: exceeds the 20 MB file limit.`);
      } else if (files.some((existing) => existing.name === file.name && existing.size === file.size && existing.lastModified === file.lastModified)) {
        addError(`${file.name}: already selected.`);
      } else if (files.length >= MAX_FILES) {
        addError(`${file.name}: the batch already contains 20 images.`);
      } else if (totalBytes + file.size > MAX_BATCH_BYTES) {
        addError(`${file.name}: would exceed the 100 MB batch limit.`);
      } else {
        files.push(file);
        totalBytes += file.size;
        added++;
      }
    }
    if (added) clearResults();
    status.textContent = files.length ? `${files.length} image${files.length === 1 ? "" : "s"} selected (${size(totalBytes)}). Choose output settings and select Optimize images. Adding files appends to this batch.` : "No supported images selected. Choose JPG, PNG or WebP files.";
    filesInput.value = "";
    processButton.disabled = !files.length;
    resetButton.disabled = !files.length;
  }
  filesInput.addEventListener("change", () => acceptFiles(filesInput.files));
  drop.addEventListener("dragenter", (event) => { event.preventDefault(); dragDepth++; if (!busy) drop.classList.add("is-dragging"); });
  drop.addEventListener("dragover", (event) => { event.preventDefault(); event.dataTransfer.dropEffect = busy ? "none" : "copy"; });
  drop.addEventListener("dragleave", (event) => { event.preventDefault(); if (--dragDepth <= 0) { dragDepth = 0; drop.classList.remove("is-dragging"); } });
  drop.addEventListener("drop", (event) => { event.preventDefault(); dragDepth = 0; drop.classList.remove("is-dragging"); acceptFiles(event.dataTransfer.files); });
  // Prevent an image dropped outside the upload zone from navigating away.
  window.addEventListener("dragover", (event) => { if (event.dataTransfer.types.includes("Files")) event.preventDefault(); });
  window.addEventListener("drop", (event) => { if (event.dataTransfer.types.includes("Files")) event.preventDefault(); });
  format.addEventListener("change", syncSettings);
  quality.addEventListener("input", syncSettings);
  resetButton.addEventListener("click", () => {
    if (busy) return;
    clearResults();
    files = [];
    filesInput.value = "";
    errorsBox.replaceChildren();
    errorsBox.hidden = true;
    processButton.disabled = true;
    resetButton.disabled = true;
    status.textContent = "Images and results cleared. Choose images to start a new batch.";
  });

  function decode(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
      image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("This file could not be decoded as an image.")); };
      image.src = url;
    });
  }
  const encode = (canvas, type, imageQuality) => new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("The browser could not encode this image. Try smaller dimensions."));
      else if (blob.type !== type) reject(new Error("This browser does not support the selected output format. Try JPG or PNG."));
      else resolve(blob);
    }, type, imageQuality);
  });
  function outputName(file, type, names) {
    const extension = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[type];
    // Safe, short names work in ZIP extractors and avoid paths from input names.
    const stem = (file.name.replace(/\.[^.]*$/, "").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "image") + "-optimized";
    let name = `${stem}.${extension}`;
    let suffix = 2;
    while (names.has(name.toLowerCase())) name = `${stem}-${suffix++}.${extension}`;
    names.add(name.toLowerCase());
    return name;
  }
  function renderResult(result) {
    const card = node("article", undefined, "image-result");
    card.append(node("h3", result.file.name));
    const previews = node("div", undefined, "image-previews");
    for (const [label, url, bytes, width, height] of [
      ["Original", result.originalUrl, result.file.size, result.originalWidth, result.originalHeight],
      ["Optimized", result.outputUrl, result.blob.size, result.width, result.height]
    ]) {
      const figure = node("figure");
      const image = node("img");
      image.src = url;
      image.alt = `${label} preview of ${result.file.name}`;
      image.loading = "lazy";
      figure.append(image, node("figcaption", `${label}: ${width} × ${height} px · ${size(bytes)}`));
      previews.append(figure);
    }
    card.append(previews);
    const change = result.file.size - result.blob.size;
    card.append(node("p", change >= 0 ? `${(change / result.file.size * 100).toFixed(1)}% smaller (${size(change)} saved).` : `${size(-change)} larger than the original. Try a lower quality, smaller dimensions or keep the original.`));
    const link = node("a", `Download ${result.name}`, "text-link");
    link.href = result.outputUrl;
    link.download = result.name;
    link.addEventListener("click", event => {event.stopPropagation();window.trackBusinessEvent?.("tool_download", {format:result.blob.type.split("/")[1],item_count:1});});
    card.append(link);
    resultsBox.append(card);
  }
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy || !files.length || !form.reportValidity()) return;
    const settings = { type: format.value, quality: Number(quality.value) / 100, maxWidth: Number($("image-width").value), maxHeight: Number($("image-height").value), background: $("image-background").value };
    clearResults();
    errorsBox.replaceChildren();
    errorsBox.hidden = true;
    setBusy(true);
    const names = new Set();
    try {
      for (const [index, file] of files.entries()) {
        status.textContent = `Processing ${index + 1} of ${files.length}: ${file.name}`;
        // Let progress paint between files and avoid decoding the whole batch at once.
        await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
        let canvas;
        let image;
        try {
          image = await decode(file);
          const originalWidth = image.naturalWidth;
          const originalHeight = image.naturalHeight;
          if (!originalWidth || !originalHeight) throw new Error("The image has invalid dimensions.");
          if (originalWidth * originalHeight > MAX_PIXELS) throw new Error("Exceeds the 16 megapixel limit. Resize the original before using this tool.");
          const ratio = Math.min(1, settings.maxWidth / originalWidth, settings.maxHeight / originalHeight);
          const width = Math.max(1, Math.round(originalWidth * ratio));
          const height = Math.max(1, Math.round(originalHeight * ratio));
          canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext("2d");
          if (!context) throw new Error("Canvas image processing is unavailable in this browser.");
          if (settings.type === "image/jpeg") { context.fillStyle = settings.background; context.fillRect(0, 0, width, height); }
          context.imageSmoothingEnabled = true;
          context.imageSmoothingQuality = "high";
          context.drawImage(image, 0, 0, width, height);
          const blob = await encode(canvas, settings.type, settings.quality);
          const result = { file, blob, width, height, originalWidth, originalHeight, name: outputName(file, settings.type, names), originalUrl: URL.createObjectURL(file), outputUrl: URL.createObjectURL(blob) };
          results.push(result);
          renderResult(result);
        } catch (error) {
          addError(`${file.name}: ${error.message || "Processing failed. Try a smaller image."}`);
        } finally {
          if (canvas) { canvas.width = 0; canvas.height = 0; }
          if (image) image.src = "";
        }
      }
      const originalBytes = results.reduce((sum, result) => sum + result.file.size, 0);
      const outputBytes = results.reduce((sum, result) => sum + result.blob.size, 0);
      const difference = originalBytes - outputBytes;
      $("image-totals").textContent = `${results.length} image${results.length === 1 ? "" : "s"}: ${size(originalBytes)} → ${size(outputBytes)}. ${difference >= 0 ? `${size(difference)} saved` : `${size(-difference)} larger overall`}.`;
      summary.hidden = !results.length;
      status.textContent = `${results.length} of ${files.length} images optimized. ${results.length < files.length ? "See skipped files below. " : ""}Results use the settings from this run. Change settings and optimize again to create a new batch.`;
      if(results.length) window.trackBusinessEvent?.("tool_complete",{item_count:results.length});
    } finally { setBusy(false); }
  });

  // ZIP storage records, CRC32 and a central directory, using only browser APIs.
  // Images are already encoded; ZIP packages them without recompression.
  const crcTable = Uint32Array.from({ length: 256 }, (_, index) => {
    let value = index;
    for (let bit = 0; bit < 8; bit++) value = (value & 1) ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    return value >>> 0;
  });
  function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }
  async function makeZip(batch) {
    const chunks = [];
    const directory = [];
    let offset = 0;
    let directorySize = 0;
    const now = new Date();
    const time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
    const date = ((Math.max(1980, now.getFullYear()) - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
    for (const result of batch) {
      const bytes = new Uint8Array(await result.blob.arrayBuffer());
      const filename = new TextEncoder().encode(result.name);
      const crc = crc32(bytes);
      const local = new Uint8Array(30 + filename.length);
      const view = new DataView(local.buffer);
      view.setUint32(0, 0x04034b50, true);
      view.setUint16(4, 20, true);
      view.setUint16(6, 0x0800, true);
      view.setUint16(10, time, true);
      view.setUint16(12, date, true);
      view.setUint32(14, crc, true);
      view.setUint32(18, bytes.length, true);
      view.setUint32(22, bytes.length, true);
      view.setUint16(26, filename.length, true);
      local.set(filename, 30);
      const central = new Uint8Array(46 + filename.length);
      const entry = new DataView(central.buffer);
      entry.setUint32(0, 0x02014b50, true);
      entry.setUint16(4, 20, true);
      entry.setUint16(6, 20, true);
      entry.setUint16(8, 0x0800, true);
      entry.setUint16(12, time, true);
      entry.setUint16(14, date, true);
      entry.setUint32(16, crc, true);
      entry.setUint32(20, bytes.length, true);
      entry.setUint32(24, bytes.length, true);
      entry.setUint16(28, filename.length, true);
      entry.setUint32(42, offset, true);
      central.set(filename, 46);
      chunks.push(local, result.blob);
      directory.push(central);
      directorySize += central.length;
      offset += local.length + bytes.length;
    }
    const end = new Uint8Array(22);
    const view = new DataView(end.buffer);
    view.setUint32(0, 0x06054b50, true);
    view.setUint16(8, batch.length, true);
    view.setUint16(10, batch.length, true);
    view.setUint32(12, directorySize, true);
    view.setUint32(16, offset, true);
    return new Blob([...chunks, ...directory, end], { type: "application/zip" });
  }
  downloadAll.addEventListener("click", async () => {
    if (busy || !results.length) return;
    setBusy(true);
    status.textContent = "Preparing your ZIP download...";
    try {
      const zip = await makeZip(results);
      const url = URL.createObjectURL(zip);
      const link = node("a");
      link.href = url;
      link.download = "optimized-website-images.zip";
      link.addEventListener("click",event=>event.stopPropagation());
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      status.textContent = "ZIP download requested. Your individual downloads are also available below.";
      window.trackBusinessEvent?.("tool_download",{format:"zip",item_count:results.length});
    } catch {
      status.textContent = "Could not create the ZIP. Download the images individually below.";
    } finally { setBusy(false); }
  });
  // Hide output encoders the browser does not support, rather than mislabel files.
  const probe = document.createElement("canvas");
  probe.width = probe.height = 1;
  for (const option of Array.from(format.options)) {
    if (!probe.toDataURL(option.value).startsWith(`data:${option.value}`)) option.remove();
  }
  probe.width = probe.height = 0;
  syncSettings();
})();
