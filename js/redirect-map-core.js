/* Exact-path review only. Never fetches URLs or modifies a redirect configuration. */
((root) => {
  'use strict';
  const csv = typeof module !== 'undefined' && module.exports ? require('./csv-cleaner-core.js') : root.CSVCleaner;
  const MAX_ROWS = 2000;
  function records(text) {
    const result = csv.parse(text, csv.detect(text)).filter(row => row.cells.some(cell => cell.trim()));
    if (result.length > MAX_ROWS + 1) throw new Error('Review at most 2,000 rows per file. Split a larger inventory first.');
    return result;
  }
  function validPath(value) {
    if (!value.startsWith('/') || value.startsWith('//') || /[\s?#\\*+()[\]{}^$]/.test(value)) return false;
    try {
      const decoded = decodeURIComponent(value);
      if (/[\\?#]/.test(decoded) || /%(?:2f|5c)/i.test(value) || /(?:^|\/)\.{1,2}(?:\/|$)/.test(decoded)) return false;
    } catch (_) { return false; }
    return true;
  }
  function review(mapText, inventoryText = '') {
    const parsed = records(mapText);
    const header = parsed[0].cells.map(cell => cell.trim().toLowerCase());
    if (new Set(header).size !== header.length) throw new Error('Map headers must be unique.');
    const sourceCol = header.indexOf('source_path'), targetCol = header.indexOf('destination_path');
    if (sourceCol < 0 || targetCol < 0) throw new Error('Map CSV needs source_path and destination_path headers.');
    const decisionCol = header.indexOf('decision'), statusCol = header.indexOf('status_code');
    const issues = [], rows = [], bySource = new Map();
    const issue = (row, type, message) => issues.push({ row, type, message });
    for (const record of parsed.slice(1)) {
      const cells = record.cells;
      const row = { row: record.line, source: (cells[sourceCol] || '').trim(), destination: (cells[targetCol] || '').trim(), decision: decisionCol < 0 ? 'redirect' : (cells[decisionCol] || '').trim().toLowerCase(), status: statusCol < 0 ? '' : (cells[statusCol] || '').trim(), valid: true };
      rows.push(row);
      const fail = (message) => { row.valid = false; issue(row.row, 'invalid', message); };
      if (cells.length !== header.length) fail('Column count differs from the header.');
      if (!validPath(row.source)) fail('Source must be an exact local path; full URLs, queries, patterns and dot segments are unsupported.');
      if (!['redirect', 'keep', 'remove'].includes(row.decision)) fail('Decision must be redirect, keep or remove.');
      if (row.decision === 'redirect') {
        if (!validPath(row.destination)) fail('A redirect needs an exact local destination path.');
        if (!row.status) row.status = '301';
        if (!['301', '302', '307', '308'].includes(row.status)) fail('Redirect status must be 301, 302, 307 or 308.');
      } else if (row.decision === 'keep') {
        if (row.destination && row.destination !== row.source) fail('A keep decision must leave the destination empty or equal to the source.');
        if (row.status && row.status !== '200') fail('A keep decision uses status 200.');
        row.status = '200';
      } else if (row.decision === 'remove') {
        if (row.destination) fail('A remove decision must not have a destination.');
        if (row.status && !['404', '410'].includes(row.status)) fail('A remove decision uses status 404 or 410.');
        row.status ||= '410';
      }
      if (validPath(row.source)) {
        const matches = bySource.get(row.source) || [];
        matches.push(row); bySource.set(row.source, matches);
      }
    }
    if (!rows.length) throw new Error('Add at least one map decision below the header.');
    for (const [source, matches] of bySource) if (matches.length > 1) {
      for (const row of matches) { row.valid = false; issue(row.row, 'duplicate', 'More than one decision uses ' + source + '; resolve all competing rows before tracing it.'); }
    }
    const decisions = new Map(rows.filter(row => row.valid).map(row => [row.source, row]));
    for (const row of rows.filter(row => row.valid && row.decision === 'redirect')) {
      const visited = new Set([row.source]);
      let destination = row.destination, hops = 1;
      while (true) {
        if (visited.has(destination)) { issue(row.row, 'loop', 'Redirect path returns to ' + destination + '.'); break; }
        visited.add(destination);
        const candidates = bySource.get(destination);
        if (candidates && (!decisions.has(destination))) { issue(row.row, 'blocked', 'Destination has an invalid or competing decision: ' + destination); break; }
        const next = decisions.get(destination);
        if (!next || next.decision === 'keep') { if (hops > 1) issue(row.row, 'chain', 'Redirect takes ' + hops + ' hops to ' + destination + '; review a direct destination.'); break; }
        if (next.decision === 'remove') { issue(row.row, 'removed-target', 'Redirect reaches a path marked for removal: ' + destination); break; }
        destination = next.destination; hops++;
      }
    }
    const inventory = new Set();
    if (inventoryText.trim()) {
      const input = records(inventoryText), columns = input[0].cells.map(cell => cell.trim().toLowerCase());
      const index = columns.includes('path') ? columns.indexOf('path') : columns.indexOf('existing_path');
      if (index < 0) throw new Error('Inventory CSV needs a path or existing_path header.');
      for (const record of input.slice(1)) {
        const path = (record.cells[index] || '').trim();
        if (record.cells.length !== columns.length || !validPath(path)) { issue(record.line, 'inventory-invalid', 'Inventory row has an unsupported path or column count.'); continue; }
        inventory.add(path);
        if (!decisions.has(path)) issue(record.line, 'unmapped', 'Inventory path has no valid, unique keep/redirect/remove decision: ' + path);
      }
    }
    return { rows, issues, inventoryCount: inventory.size, validDecisions: decisions.size, limitations: 'Exact, case-sensitive local paths; trailing slashes are distinct. No live HTTP checks, regex rules, destination-content review or deployment. Zero findings only covers these checks.' };
  }
  const api = { review, validPath };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RedirectMapReview = api;
})(typeof window !== 'undefined' ? window : globalThis);
