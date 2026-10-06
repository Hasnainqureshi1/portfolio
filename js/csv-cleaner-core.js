/* Strict CSV parsing and explicit, non-destructive cleanup rules. */
((root) => {
  "use strict";
  function parse(text, delimiter = ",") {
    text = text.replace(/^\uFEFF/, "");
    if (!text.length) throw new Error("Add a CSV file or paste data first.");
    const records = [];
    let row = [], field = "", quoted = false, closed = false, start = true, line = 1, recordLine = 1;
    function cell() { row.push(field); field = ""; closed = false; start = true; if (row.length > 100) throw new Error("Maximum 100 columns per record."); }
    function record() { cell(); records.push({ cells: row, line: recordLine, number: records.length + 1 }); row = []; if (records.length > 20001) throw new Error("Maximum 20,000 data records plus a header."); }
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (quoted) {
        if (char === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else { quoted = false; closed = true; } }
        else { field += char; if (char === "\n" || (char === "\r" && text[i + 1] !== "\n")) line++; }
      } else if (char === delimiter) cell();
      else if (char === "\r" || char === "\n") { record(); if (char === "\r" && text[i + 1] === "\n") i++; line++; recordLine = line; }
      else if (closed) throw new Error(`Unexpected character after a closing quote on line ${line}. Correct the source CSV before cleaning.`);
      else if (char === '"') { if (!start) throw new Error(`Unexpected quote on line ${line}. Quote the whole field and double quotes inside it.`); quoted = true; start = false; }
      else { field += char; start = false; }
    }
    if (quoted) throw new Error(`Unclosed quoted field starting in record ${records.length + 1} (line ${recordLine}).`);
    if (row.length || field.length || closed || start === false) record();
    if (!records.length) throw new Error("No CSV records found.");
    return records;
  }
  function detect(text) {
    let best = ",", bestScore = -Infinity;
    for (const separator of [",", ";", "\t", "|"]) {
      try {
        const rows = parse(text, separator).filter(r => r.cells.some(c => c.trim())).slice(0, 30);
        const counts = new Map(); rows.forEach(r => counts.set(r.cells.length, (counts.get(r.cells.length) || 0) + 1));
        const mode = [...counts].sort((a,b) => b[1] - a[1] || b[0] - a[0])[0];
        const score = mode && mode[0] > 1 ? mode[1] / rows.length * 100 + Math.min(mode[0], 20) : 0;
        if (score > bestScore) { bestScore = score; best = separator; }
      } catch (_) { /* The explicitly selected delimiter still reports syntax errors. */ }
    }
    return best;
  }
  function analyse(records, options) {
    const header = options.header ? records[0] : null;
    const data = options.header ? records.slice(1) : records;
    const width = records[0].cells.length;
    const issues = [], log = [], seen = new Map(), output = [], excluded = [];
    const counts = { input: data.length, output: 0, blank: 0, duplicate: 0, ragged: 0, trimmed: 0, formula: 0, removed: 0, padded: 0, protected: 0 };
    let blockers = 0;
    const addIssue = (record, message) => issues.push({ record: record.number, line: record.line, message });
    if (header) {
      const names = header.cells.map(c => options.trim ? c.trim() : c);
      const namesSeen = new Set();
      names.forEach((name, index) => {
        if (!name.trim() || namesSeen.has(name.trim().toLowerCase())) { addIssue(header, `Column ${index + 1} has an empty or repeated header. Edit the source header before importing.`); blockers++; }
        namesSeen.add(name.trim().toLowerCase());
      });
    }
    const clean = (record, isHeader = false) => {
      let cells = record.cells.map(c => options.trim ? c.trim() : c);
      const trimCount = cells.filter((c,i) => c !== record.cells[i]).length;
      counts.trimmed += trimCount;
      if (trimCount) log.push({ record: record.number, action: `Trimmed ${trimCount} cell(s)` });
      const risky = cells.filter(c => /^[\s]*[=+@-]/.test(c)).length;
      counts.formula += risky;
      if (risky) addIssue(record, `${risky} cell(s) start with a spreadsheet formula character. Review before opening in a spreadsheet; negative numbers are flagged too.`);
      if (options.protect) { cells = cells.map(c => /^[\s]*[=+@-]/.test(c) ? "'" + c : c); counts.protected += risky; if (risky) log.push({ record: record.number, action: `Prefixed ${risky} cell(s) with an apostrophe` }); }
      if (isHeader) return cells;
      const blank = cells.every(c => c.trim() === "");
      if (blank) {
        counts.blank++; addIssue(record, "Blank row.");
        if (options.blank) { counts.removed++; excluded.push({ ...record, reason: "Blank row" }); log.push({ record: record.number, action: "Removed blank row" }); return null; }
      }
      if (cells.length !== width) {
        counts.ragged++; addIssue(record, `${cells.length} columns; expected ${width}.`);
        if (options.ragged === "exclude") { counts.removed++; excluded.push({ ...record, reason: "Inconsistent column count" }); log.push({ record: record.number, action: "Excluded inconsistent-width row" }); return null; }
        if (options.ragged === "pad" && cells.length < width) { while (cells.length < width) cells.push(""); counts.padded++; log.push({ record: record.number, action: "Added empty cells to short row" }); }
        else blockers++;
      }
      const key = JSON.stringify(cells);
      if (!blank && seen.has(key)) {
        counts.duplicate++; addIssue(record, `Exact duplicate of record ${seen.get(key)} after selected fixes.`);
        if (options.duplicates) { counts.removed++; excluded.push({ ...record, reason: "Exact duplicate" }); log.push({ record: record.number, action: "Removed exact duplicate; kept first occurrence" }); return null; }
      } else if (!blank) seen.set(key, record.number);
      return cells;
    };
    const cleanedHeader = header ? clean(header, true) : null;
    for (const record of data) { const cells = clean(record); if (cells) output.push({ cells, number: record.number, line: record.line }); }
    counts.output = output.length;
    if (!data.length) { blockers++; issues.push({record: 1,line:1,message:"No data records found after the header."}); }
    return { header: cleanedHeader, output, counts, issues, log, blockers, width, excluded };
  }
  function mapAndReview(result, config) {
    const targets = config.targets || [];
    if (!Array.isArray(targets) || targets.length > 100) throw new Error("Maximum 100 destination columns.");
    const names = new Set();
    targets.forEach(target => {
      if (typeof target.name !== "string" || !target.name.trim() || names.has(target.name.trim().toLowerCase())) throw new Error("Destination headers must be non-empty and unique.");
      names.add(target.name.trim().toLowerCase());
      if (!Number.isInteger(target.source) || target.source < -1 || target.source >= result.width) throw new Error("Choose a valid source column for each destination field.");
    });
    const header = targets.length ? targets.map(t => t.name.trim()) : result.header;
    const rows = result.output.map(row => ({ ...row, cells: targets.length ? targets.map(t => t.source < 0 ? "" : row.cells[t.source] ?? "") : [...row.cells] }));
    const findings = [], reasons = new Map();
    const required = targets.length ? targets.flatMap((t,i) => t.required ? [i] : []) : [];
    const mark = (row, message) => { if (!reasons.has(row.number)) reasons.set(row.number, []); reasons.get(row.number).push(message); findings.push({record:row.number,line:row.line,message}); };
    rows.forEach(row => required.forEach(index => { if (!row.cells[index].trim()) mark(row, `Missing required destination field: ${header[index]}.`); }));
    if (config.key !== undefined && config.key !== -1) {
      const width = targets.length || result.width;
      if (!Number.isInteger(config.key) || config.key < 0 || config.key >= width) throw new Error("Choose a valid duplicate key column.");
      const groups = new Map();
      rows.forEach(row => {
        const key = row.cells[config.key]?.trim();
        if (!key) { mark(row, "Selected ID/email key is blank."); return; }
        const normalized = config.ignoreCase ? key.toLowerCase() : key;
        if (!groups.has(normalized)) groups.set(normalized, []); groups.get(normalized).push(row);
      });
      groups.forEach(group => {
        if (group.length < 2) return;
        const conflicting = new Set(group.map(row => JSON.stringify(row.cells))).size > 1;
        group.forEach(row => mark(row, `${conflicting ? "Conflicting" : "Repeated"} selected key across source records ${group.slice(0,20).map(r=>r.number).join(", ")}${group.length>20?" and more":""}. Review all matching records; none is automatically merged.`));
      });
    }
    const review = rows.filter(row => reasons.has(row.number)).map(row => ({...row, reason:reasons.get(row.number).join(" ")}));
    const output = config.quarantine ? rows.filter(row => !reasons.has(row.number)) : rows;
    return { header, output, review, findings, excluded: result.excluded, blockers: result.blockers + (config.quarantine ? 0 : review.length), counts: { ...result.counts, output:output.length, review:review.length, quarantined:config.quarantine ? review.length : 0 }, log:[...result.log,...(config.quarantine ? review.map(row=>({record:row.number,action:"Moved to unresolved-rows file for review"})) : [])], issues:[...result.issues,...findings], width:targets.length || result.width };
  }
  function stringify(rows, delimiter = ",") {
    return rows.map(row => row.map(cell => /["\r\n]/.test(cell) || cell.includes(delimiter) ? '"' + cell.replace(/"/g, '""') + '"' : cell).join(delimiter)).join("\r\n") + "\r\n";
  }
  const api = { parse, detect, analyse, mapAndReview, stringify };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.CSVCleaner = api;
})(typeof window !== "undefined" ? window : globalThis);
