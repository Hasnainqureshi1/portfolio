(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  if (!$("csv-source")) return;
  const core = window.CSVCleaner;
  let result = null, inputRecords = null, name = "spreadsheet", detected = ",", reading = false;
  const labels = { ",": "comma", ";": "semicolon", "\t": "tab", "|": "pipe" };
  const separator = id => $(id).value === "tab" ? "\t" : $(id).value;
  const options = () => ({ header: $("csv-header").checked, trim: $("csv-trim").checked, blank: $("csv-blank").checked, duplicates: $("csv-duplicates").checked, protect: $("csv-protect").checked, ragged: $("csv-ragged").value });
  function node(tag, text) { const el = document.createElement(tag); if (text !== undefined) el.textContent = text; return el; }
  function invalidate() {
    result = null; inputRecords = null; $("csv-review").checked = false;
    $("csv-download").disabled = true; $("csv-report").disabled = true;
    $("csv-results").hidden = true;
    $("csv-status").textContent = "Input or options changed. Check the CSV again to review the new result.";
  }
  function downloads() {
    $("csv-download").disabled = reading || !result || result.blockers > 0 || !result.counts.output || !$("csv-review").checked;
    $("csv-report").disabled = reading || !result;
  }
  function analyse() {
    if (reading) return;
    invalidate();
    try {
      const text = $("csv-source").value;
      if (new Blob([text]).size > 5 * 1024 * 1024) throw new Error("Maximum 5 MB of CSV text.");
      detected = $("csv-delimiter").value === "auto" ? core.detect(text) : separator("csv-delimiter");
      inputRecords = core.parse(text, detected);
      result = core.analyse(inputRecords, options());
      $("csv-results").hidden = false;
      $("csv-summary").replaceChildren();
      for (const [key, label] of [["input", "Input rows"], ["output", "Output rows"], ["duplicate", "Exact duplicates"], ["ragged", "Inconsistent rows"]]) {
        const item = node("div"); item.className = "tool-stat"; item.append(node("strong", String(result.counts[key])), node("span", label)); $("csv-summary").append(item);
      }
      $("csv-changes").textContent = `${labels[detected]} delimiter detected/selected. ${result.width} expected columns. ${result.counts.blank} blank rows; ${result.counts.trimmed} cells trimmed; ${result.counts.removed} rows removed; ${result.counts.padded} short rows padded; ${result.counts.protected} cells prefixed for spreadsheet viewing.`;
      $("csv-issues").replaceChildren();
      result.issues.slice(0, 100).forEach(issue => $("csv-issues").append(node("li", `Record ${issue.record}, source line ${issue.line}: ${issue.message}`)));
      $("csv-issue-limit").textContent = result.issues.length > 100 ? `Showing 100 of ${result.issues.length} findings. The report includes every finding.` : result.issues.length ? `${result.issues.length} findings. Review any removals and changes below.` : "No issues found by these structural checks.";
      const table = node("table"); table.className = "tool-table";
      const head = node("thead"), hr = node("tr"); hr.append(node("th", "Source record"));
      const maxWidth = Math.max(result.width, ...result.output.slice(0, 50).map(r => r.cells.length));
      for (let i = 0; i < maxWidth; i++) hr.append(node("th", result.header?.[i] ?? `Column ${i + 1}`));
      head.append(hr); table.append(head);
      const body = node("tbody");
      result.output.slice(0, 50).forEach(row => { const tr = node("tr"); tr.append(node("td", String(row.number))); for (let i = 0; i < maxWidth; i++) tr.append(node("td", row.cells[i] ?? "")); body.append(tr); });
      table.append(body); $("csv-preview").replaceChildren(table);
      $("csv-log").replaceChildren();
      result.log.slice(0, 100).forEach(change => $("csv-log").append(node("li", `Record ${change.record}: ${change.action}`)));
      $("csv-log-limit").textContent = `${result.log.length} change entries. Showing up to 100 here; download the report for all entries.`;
      $("csv-status").textContent = result.blockers ? `${result.blockers} unresolved structural problem(s). Fix headers in the source or choose how to handle inconsistent rows, then check again. Clean CSV download is blocked.` : "Check complete. Review the proposed output and change log, then confirm to enable the CSV download.";
      downloads();
    } catch (error) { result = null; inputRecords = null; $("csv-status").textContent = `Could not check this CSV: ${error.message}`; downloads(); }
  }
  function download(contents, filename, type) {
    const url = URL.createObjectURL(new Blob([contents], { type })); const link = node("a"); link.href = url; link.download = filename;
    document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  $("csv-form").addEventListener("submit", event => { event.preventDefault(); analyse(); });
  $("csv-form").addEventListener("input", event => { if (event.target.id !== "csv-file") invalidate(); });
  $("csv-form").addEventListener("change", event => { if (event.target.id !== "csv-file") invalidate(); });
  $("csv-review").addEventListener("change", downloads);
  $("csv-output-delimiter").addEventListener("change", () => { $("csv-review").checked = false; downloads(); });
  $("csv-download").addEventListener("click", () => {
    if (!result || result.blockers || !$("csv-review").checked || !result.counts.output) return;
    const rows = result.output.map(r => r.cells); if (result.header) rows.unshift(result.header);
    download("\uFEFF" + core.stringify(rows, separator("csv-output-delimiter")), `${name}-clean.csv`, "text/csv;charset=utf-8");
    $("csv-status").textContent = "Clean CSV download requested. Test a small import in your destination system first.";
  });
  $("csv-report").addEventListener("click", () => {
    if (!result) return;
    download(JSON.stringify({ tool: "CSV Cleaner & Import Checker", source: name, inputDelimiter: labels[detected], outputDelimiter: labels[separator("csv-output-delimiter")], options: options(), counts: result.counts, unresolvedStructuralProblems: result.blockers, findings: result.issues, changes: result.log, limitation: "Checks CSV syntax and row structure, not destination-specific schemas or data types." }, null, 2), `${name}-check-report.json`, "application/json");
  });
  $("csv-file").addEventListener("change", async event => {
    if (reading) return;
    invalidate();
    const file = event.target.files[0]; if (!file) return;
    if (!/\.(csv|tsv|txt)$/i.test(file.name) || file.size > 5 * 1024 * 1024) { $("csv-status").textContent = "Choose a CSV, TSV or text file up to 5 MB. Export Excel workbooks as CSV first."; event.target.value = ""; return; }
    reading = true; $("csv-form").querySelectorAll("input,select,textarea,button").forEach(el => el.disabled = true); downloads();
    $("csv-status").textContent = "Reading file locally...";
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      let encoding = $("csv-encoding").value;
      if (encoding === "auto") encoding = bytes[0] === 255 && bytes[1] === 254 ? "utf-16le" : bytes[0] === 254 && bytes[1] === 255 ? "utf-16be" : "utf-8";
      const text = new TextDecoder(encoding, { fatal: true }).decode(bytes);
      if (text.includes("\u0000")) throw new Error("Unexpected null bytes. Choose the correct text encoding or re-export as UTF-8 CSV.");
      $("csv-source").value = text;
      name = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "-").slice(0,80) || "spreadsheet";
      $("csv-status").textContent = `Read ${file.name}. Choose cleanup rules, then check the CSV.`;
    } catch (error) { $("csv-status").textContent = `Could not read the file: ${error.message}. Try another encoding and select the file again.`; }
    finally { reading = false; $("csv-form").querySelectorAll("input,select,textarea,button").forEach(el => el.disabled = false); event.target.value = ""; downloads(); }
  });
  $("csv-demo").addEventListener("click", () => {
    invalidate(); name = "sample-contacts";
    $("csv-source").value = 'Name,Email,Company\r\n Alice ,alice@example.com,North Studio\r\nBob,bob@example.com,"Field, Ltd"\r\nAlice,alice@example.com,North Studio\r\n,,\r\nCara,cara@example.com\r\nDan,dan@example.com,West Studio,Extra cell\r\n';
    $("csv-status").textContent = "Sample CSV loaded. It includes whitespace, a quoted comma, a duplicate, a blank row and inconsistent column counts.";
  });
  $("csv-clear").addEventListener("click", () => { invalidate(); $("csv-source").value = ""; name = "spreadsheet"; $("csv-status").textContent = "Working data cleared. Your original file is unchanged."; });
})();
