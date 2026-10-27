(() => {
  'use strict';
  const form = document.getElementById('redirect-review');
  if (!form) return;
  const map = document.getElementById('redirect-csv'), inventory = document.getElementById('inventory-csv');
  const status = document.getElementById('redirect-status'), output = document.getElementById('redirect-results');
  let report = null, revision = 0;
  const LIMIT = 500000;
  function clearReport() { revision++; report = null; output.replaceChildren(); document.getElementById('download-review').disabled = true; status.textContent = 'Inputs changed. Run the review to refresh results.'; }
  for (const [id, field] of [['redirect-file', map], ['inventory-file', inventory]]) {
    document.getElementById(id).addEventListener('change', async event => {
      const file = event.target.files[0]; if (!file) return;
      clearReport(); const version = revision;
      if (file.size > LIMIT) { status.textContent = 'Each file must be 500 KB or smaller.'; return; }
      const text = await file.text();
      if (version !== revision) return;
      field.value = text; status.textContent = 'File loaded locally. Run the review.';
    });
  }
  form.addEventListener('input', clearReport);
  document.getElementById('redirect-example').addEventListener('click', () => {
    clearReport();
    map.value = 'source_path,destination_path,decision,status_code\n/old,/middle,redirect,301\n/middle,/new,redirect,301\n/loop-a,/loop-b,redirect,301\n/loop-b,/loop-a,redirect,301\n/contact,,keep,200\n/retired,,remove,410\n';
    inventory.value = 'path\n/old\n/contact\n/retired\n/missing\n';
    status.textContent = 'Synthetic example loaded. Review the chain, loop and missing decision.';
  });
  form.addEventListener('submit', event => {
    event.preventDefault(); report = null; output.replaceChildren(); document.getElementById('download-review').disabled = true;
    try {
      if (new Blob([map.value]).size > LIMIT || new Blob([inventory.value]).size > LIMIT) throw new Error('Each input must be 500 KB or smaller.');
      report = window.RedirectMapReview.review(map.value, inventory.value);
      status.textContent = `${report.rows.length} map rows; ${report.validDecisions} valid decisions; ${report.inventoryCount} inventory paths; ${report.issues.length} findings. Live destinations were not checked.`;
      if (!report.issues.length) { const p = document.createElement('p'); p.textContent = 'No findings in the supported checks. Review content relevance and deployed responses separately.'; output.append(p); }
      const list = document.createElement('ol');
      for (const issue of report.issues) { const li = document.createElement('li'); li.textContent = `${issue.type} (row ${issue.row}): ${issue.message}`; list.append(li); }
      output.append(list); document.getElementById('download-review').disabled = false;
      window.trackBusinessEvent?.('tool_complete', { item_count: report.rows.length });
    } catch (error) { status.textContent = error.message; }
  });
  document.getElementById('download-review').addEventListener('click', () => {
    if (!report) return;
    const lines = ['REDIRECT MAP REVIEW', status.textContent, report.limitations, '', ...report.issues.map(issue => `${issue.type}, row ${issue.row}: ${issue.message}`)];
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'redirect-map-review.txt'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    window.trackBusinessEvent?.('tool_download', { format: 'txt' });
  });
})();
