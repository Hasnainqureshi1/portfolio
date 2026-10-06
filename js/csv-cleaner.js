(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  if (!$("csv-source")) return;
  const core = window.CSVCleaner;
  let result = null, inputRecords = null, name = "spreadsheet", detected = ",", reading = false;
  let targets = [], sourceHeaders = [], mappingSignature = "", destinationSignature = "", baseResult = null;
  const labels = { ",": "comma", ";": "semicolon", "\t": "tab", "|": "pipe" };
  const separator = id => $(id).value === "tab" ? "\t" : $(id).value;
  const options = () => ({ header: $("csv-header").checked, trim: $("csv-trim").checked, blank: $("csv-blank").checked, duplicates: $("csv-duplicates").checked, protect: $("csv-protect").checked, ragged: $("csv-ragged").value });
  function node(tag, text) { const el = document.createElement(tag); if (text !== undefined) el.textContent = text; return el; }
  function invalidate() {
    result = null; inputRecords = null; $("csv-review").checked = false;
    $("csv-download").disabled = true; $("csv-report").disabled = true;
    $("csv-unresolved").disabled = true; $("csv-excluded").disabled = true;
    $("csv-results").hidden = true;
    $("csv-status").textContent = "Input or options changed. Check the CSV again to review the new result.";
  }
  function downloads() {
    $("csv-download").disabled = reading || !result || result.blockers > 0 || !result.counts.output || !$("csv-review").checked;
    $("csv-report").disabled = reading || !result;
    $("csv-unresolved").disabled = reading || !result?.review?.length;
    $("csv-excluded").disabled = reading || !result?.excluded?.length;
  }
  function readSource() {
    const text = $("csv-source").value;
    if (new Blob([text]).size > 5 * 1024 * 1024) throw new Error("Maximum 5 MB of CSV text.");
    detected = $("csv-delimiter").value === "auto" ? core.detect(text) : separator("csv-delimiter");
    return core.parse(text, detected);
  }
  function keyChoices(previous = $("csv-key").value) {
    const names = targets.length ? targets.map(t=>t.name) : sourceHeaders;
    $("csv-key").replaceChildren();
    const empty=node("option","No key check");empty.value="-1";$("csv-key").append(empty);
    names.forEach((name,index)=>{const option=node("option",`${index+1}. ${name}`);option.value=index;$("csv-key").append(option);});
    $("csv-key").value = Number(previous)<names.length ? previous : "-1";
  }
  function renderMapping() {
    $("csv-mapping").replaceChildren();
    targets.forEach((target,index)=>{
      const group=node("div");group.className="tool-mapping-row";
      const label=node("label",`Destination column ${index+1}`), input=node("input");input.type="text";input.maxLength=100;input.value=target.name;input.dataset.target=index;input.dataset.field="name";input.id=`csv-target-${index}`;label.htmlFor=input.id;label.append(input);
      const sourceLabel=node("label","Source column"),select=node("select");select.id=`csv-map-${index}`;sourceLabel.htmlFor=select.id;select.dataset.target=index;select.dataset.field="source";
      const blank=node("option","Leave empty");blank.value=-1;select.append(blank);
      sourceHeaders.forEach((name,i)=>{const option=node("option",`${i+1}. ${name}`);option.value=i;select.append(option);});select.value=target.source;sourceLabel.append(select);
      const requiredLabel=node("label"),required=node("input");required.type="checkbox";required.checked=target.required;required.dataset.target=index;required.dataset.field="required";requiredLabel.append(required,document.createTextNode(" Required field"));
      const actions=node("div");actions.className="tool-actions";
      for(const [action,text] of [["up","Move up"],["down","Move down"],["remove","Remove column"]]){const button=node("button",text);button.type="button";button.className="tool-small-button";button.dataset.target=index;button.dataset.action=action;button.disabled=action==="up"&&index===0||action==="down"&&index===targets.length-1;actions.append(button);}
      group.append(label,sourceLabel,requiredLabel,actions);$("csv-mapping").append(group);
    });
    keyChoices();
  }
  function prepareMapping(force = false) {
    const records=readSource();
    const destination=$("csv-target-headers").value.trim();
    if(destination && !$("csv-header").checked) throw new Error("Enable source headers before mapping to destination columns.");
    const headers=records[0].cells.map(c=>c.trim());
    const signature=JSON.stringify([$("csv-header").checked,headers]);
    if(!force && signature===mappingSignature && destination===destinationSignature)return records;
    sourceHeaders=$("csv-header").checked ? headers : headers.map((_,i)=>`Column ${i+1}`);
    const normalize=name=>name.toLowerCase().replace(/[\s_-]+/g,"");
    const targetNames=destination ? core.parse(destination,core.detect(destination))[0].cells : [];
    targets=targetNames.map(name=>({name:name.trim(),source:sourceHeaders.findIndex(h=>normalize(h)===normalize(name.trim())),required:false}));
    mappingSignature=signature;destinationSignature=destination;renderMapping();return records;
  }
  function mappingOptions() { return { targets:targets.map(t=>({...t})), key:Number($("csv-key").value), ignoreCase:$("csv-key-ignore-case").checked, quarantine:$("csv-quarantine").checked }; }
  function analyse() {
    if (reading) return;
    invalidate();
    try {
      inputRecords = prepareMapping();
      baseResult = core.analyse(inputRecords, options());
      result = core.mapAndReview(baseResult, mappingOptions());
      $("csv-results").hidden = false;
      $("csv-summary").replaceChildren();
      for (const [key, label] of [["input", "Input rows"], ["output", "Output rows"], ["duplicate", "Exact duplicates"], ["ragged", "Inconsistent rows"]]) {
        const item = node("div"); item.className = "tool-stat"; item.append(node("strong", String(result.counts[key])), node("span", label)); $("csv-summary").append(item);
      }
      $("csv-changes").textContent = `${labels[detected]} delimiter detected/selected. ${result.width} expected columns. ${result.counts.blank} blank rows; ${result.counts.trimmed} cells trimmed; ${result.counts.removed} rows removed; ${result.counts.padded} short rows padded; ${result.counts.protected} cells prefixed for spreadsheet viewing.`;
      $("csv-changes").textContent += ` ${result.counts.review} records require review; ${result.counts.quarantined} moved to the unresolved file. ${targets.length ? "Destination layout applied. Unmapped source columns are not in the output." : "Source column layout retained."}`;
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
      $("csv-status").textContent = result.blockers ? `${result.blockers} unresolved problem(s). Review source structure, required fields or repeated keys, then check again. Clean CSV download is blocked.` : "Check complete. Review the proposed output and change log, then confirm to enable the CSV download.";
      window.trackBusinessEvent?.("tool_complete",{item_count:result.counts.input});
      downloads();
    } catch (error) { result = null; inputRecords = null; $("csv-status").textContent = `Could not check this CSV: ${error.message}`; downloads(); }
  }
  function download(contents, filename, type) {
    const url = URL.createObjectURL(new Blob([contents], { type })); const link = node("a"); link.href = url; link.download = filename;
    link.addEventListener("click",event=>event.stopPropagation());document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  $("csv-form").addEventListener("submit", event => { event.preventDefault(); analyse(); });
  $("csv-form").addEventListener("input", event => { if (event.target.id !== "csv-file") invalidate(); });
  $("csv-form").addEventListener("change", event => { if (event.target.id !== "csv-file") invalidate(); });
  $("csv-review").addEventListener("change", downloads);
  $("csv-output-delimiter").addEventListener("change", () => { $("csv-review").checked = false; downloads(); });
  $("csv-download").addEventListener("click", () => {
    if (!result || result.blockers || !$("csv-review").checked || !result.counts.output) return;
    const rows = result.output.map(r => r.cells); if (result.header) rows.unshift(result.header);
    download("\uFEFF" + core.stringify(rows, separator("csv-output-delimiter")), "reviewed-import.csv", "text/csv;charset=utf-8");
    window.trackBusinessEvent?.("tool_download",{format:"csv",item_count:result.counts.output});
    $("csv-status").textContent = "Clean CSV download requested. Test a small import in your destination system first.";
  });
  $("csv-report").addEventListener("click", () => {
    if (!result) return;
    download(JSON.stringify({ tool: "CSV Cleaner & Import Checker", source: name, inputDelimiter: labels[detected], outputDelimiter: labels[separator("csv-output-delimiter")], options: options(), mapping:mappingOptions(), counts: result.counts, unresolvedProblems: result.blockers, findings: result.issues, changes: result.log, limitation: "Checks selected structure, required fields and keys; not every destination-specific rule or data type." }, null, 2), "csv-check-report.json", "application/json");
    window.trackBusinessEvent?.("tool_download",{format:"json"});
  });
  for(const [id,key] of [["csv-unresolved","review"],["csv-excluded","excluded"]])$(id).addEventListener("click",()=>{
    if(!result?.[key]?.length)return;
    const records=result[key];const width=Math.max(...records.map(r=>r.cells.length));
    const header=key==="review" ? result.header : baseResult.header;
    const rows=[["Source record","Source line","Review reason",...Array.from({length:width},(_,i)=>header?.[i]||`Column ${i+1}`)],...records.map(row=>[String(row.number),String(row.line),row.reason,...Array.from({length:width},(_,i)=>row.cells[i]??"")])];
    download("\uFEFF"+core.stringify(rows),key==="review"?"unresolved-import-rows.csv":"removed-source-rows.csv","text/csv;charset=utf-8");window.trackBusinessEvent?.("tool_download",{format:"csv",item_count:records.length});
  });
  $("csv-prepare-mapping").addEventListener("click",()=>{if(reading)return;invalidate();try{prepareMapping(true);$("csv-status").textContent="Mapping prepared. Choose source columns and mark required fields, then check the CSV.";}catch(error){$("csv-status").textContent=error.message;}});
  $("csv-mapping").addEventListener("input",event=>{const control=event.target,target=targets[Number(control.dataset.target)];if(!target||!control.dataset.field)return;target[control.dataset.field]=control.dataset.field==="required"?control.checked:control.dataset.field==="source"?Number(control.value):control.value;invalidate();if(control.dataset.field==="name")keyChoices();});
  $("csv-mapping").addEventListener("click",event=>{const button=event.target.closest("button[data-action]");if(!button)return;const index=Number(button.dataset.target);if(button.dataset.action==="remove")targets.splice(index,1);else{const other=index+(button.dataset.action==="up"?-1:1);if(other<0||other>=targets.length)return;[targets[index],targets[other]]=[targets[other],targets[index]];}$("csv-key").value="-1";invalidate();renderMapping();});
  $("csv-template-file").addEventListener("change",async event=>{
    const file=event.target.files[0];if(!file||reading)return;invalidate();reading=true;$("csv-form").querySelectorAll("input,select,textarea,button").forEach(el=>el.disabled=true);
    try{if(file.size>1024*1024||! /\.(csv|tsv|txt)$/i.test(file.name))throw new Error("Choose a CSV template up to 1 MB.");
      const bytes=new Uint8Array(await file.arrayBuffer());let encoding=$("csv-encoding").value;if(encoding==="auto")encoding=bytes[0]===255&&bytes[1]===254?"utf-16le":bytes[0]===254&&bytes[1]===255?"utf-16be":"utf-8";
      const text=new TextDecoder(encoding,{fatal:true}).decode(bytes);const headers=core.parse(text,core.detect(text))[0].cells;
      $("csv-target-headers").value=core.stringify([headers]).trimEnd();destinationSignature="";$("csv-status").textContent="Destination headers loaded. Prepare column mapping after adding your source CSV.";
    }catch(error){$("csv-status").textContent=error.message;}finally{reading=false;$("csv-form").querySelectorAll("input,select,textarea,button").forEach(el=>el.disabled=false);event.target.value="";downloads();}
  });
  $("csv-save-recipe").addEventListener("click",()=>{
    try{prepareMapping();const recipe={version:1,sourceHeaders,targets,options:options(),key:Number($("csv-key").value),ignoreCase:$("csv-key-ignore-case").checked,quarantine:$("csv-quarantine").checked};download(JSON.stringify(recipe,null,2),"csv-mapping-recipe.json","application/json");window.trackBusinessEvent?.("tool_download",{format:"json"});$("csv-status").textContent="Mapping recipe downloaded. It contains headers and rules, not customer records.";}catch(error){$("csv-status").textContent=error.message;}
  });
  $("csv-recipe-file").addEventListener("change",async event=>{
    const file=event.target.files[0];if(!file||reading)return;invalidate();reading=true;$("csv-form").querySelectorAll("input,select,textarea,button").forEach(el=>el.disabled=true);
    try{if(file.size>100000)throw new Error("Recipe must be under 100 KB.");const recipe=JSON.parse(await file.text());
      const records=readSource();const actual=records[0].cells.map(c=>c.trim());
      if(recipe.version!==1||!Array.isArray(recipe.sourceHeaders)||JSON.stringify(recipe.sourceHeaders)!==JSON.stringify(actual)||!Array.isArray(recipe.targets)||recipe.targets.length>100)throw new Error("Use a version 1 recipe with the same source headers, or prepare a fresh mapping.");
      core.mapAndReview({header:actual,width:actual.length,output:[],excluded:[],blockers:0,counts:{},log:[],issues:[]},{targets:recipe.targets,key:recipe.key});
      if(recipe.targets.some(t=>t.name.length>100||typeof t.required!=="boolean")||!Number.isInteger(recipe.key)||recipe.key< -1||recipe.key>=Math.max(actual.length,recipe.targets.length))throw new Error("Invalid recipe settings.");
      sourceHeaders=actual;targets=recipe.targets.map(t=>({name:t.name,source:t.source,required:t.required}));mappingSignature=JSON.stringify([true,actual]);
      $("csv-target-headers").value=targets.length?core.stringify([targets.map(t=>t.name)]).trimEnd():"";destinationSignature=$("csv-target-headers").value.trim();
      for(const key of ["header","trim","blank","duplicates","protect"])$("csv-"+key).checked=recipe.options?.[key]===true;
      $("csv-header").checked=true;$("csv-ragged").value=["block","pad","exclude"].includes(recipe.options?.ragged)?recipe.options.ragged:"block";
      $("csv-key-ignore-case").checked=recipe.ignoreCase===true;$("csv-quarantine").checked=recipe.quarantine===true;renderMapping();$("csv-key").value=String(recipe.key);$("csv-status").textContent="Recipe loaded. Review its mapping and rules, then check the current CSV.";
    }catch(error){$("csv-status").textContent=`Could not load recipe: ${error.message}`;}finally{reading=false;$("csv-form").querySelectorAll("input,select,textarea,button").forEach(el=>el.disabled=false);event.target.value="";downloads();}
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
  $("csv-clear").addEventListener("click", () => { invalidate(); $("csv-source").value = ""; $("csv-target-headers").value="";targets=[];sourceHeaders=[];mappingSignature="";destinationSignature="";renderMapping();name = "spreadsheet"; $("csv-status").textContent = "Working data cleared. Your original file is unchanged."; });
})();
