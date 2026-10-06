(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const canvas = $("feedback-canvas"); if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let image = null, imageName = "", notes = [], selected = null, nextId = 1, pointer = null, loading = false, exporting = false;
  let pages = [], currentPage = null, nextPageId = 1;
  const priorities = { high: "#a52c32", medium: "#80520b", low: "#236646" };
  const status = text => { $("feedback-status").textContent = text; };
  function el(tag, text) { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; return node; }
  function sync() {
    stash();
    const busy = loading || exporting;
    $("feedback-editor").querySelectorAll("input,select,textarea,button").forEach(control => control.disabled = busy);
    $("feedback-save-note").disabled = busy || !selected;
    $("feedback-note").disabled = busy || !selected;
    for(const id of ["feedback-owner","feedback-acceptance","feedback-category","feedback-state"])$(id).disabled=busy||!selected;
    $("feedback-add-centre").disabled = busy || !image;
    $("feedback-undo").disabled = busy || !notes.length;
    $("feedback-image-download").disabled = busy || !image || !notes.length;
    $("feedback-brief-download").disabled = busy || !pages.some(page=>page.notes.length);
    $("feedback-print").disabled=busy||!pages.length;
    $("feedback-save-project").disabled=busy||!pages.length;
    $("feedback-remove-page").disabled=busy||!pages.length;
  }
  function badge(context, x, y, text, colour, size) {
    context.fillStyle = colour; context.beginPath(); context.arc(x,y,size,0,Math.PI*2); context.fill();
    context.strokeStyle = "#ffffff"; context.lineWidth = size*.16; context.stroke();
    context.fillStyle = "#ffffff"; context.font = `500 ${size*1.08}px Moderat, Arial, sans-serif`; context.textAlign = "center"; context.textBaseline = "middle"; context.fillText(text,x,y);
  }
  function draw(target = canvas, editing = true) {
    const context = target.getContext("2d"), w = target.width, h = target.height;
    context.clearRect(0,0,w,h);
    if (!image) { context.fillStyle = "#e9ebe3"; context.fillRect(0,0,w,h); context.fillStyle = "#23322c"; context.font = "500 28px Moderat, Arial, sans-serif"; context.textAlign = "center"; context.fillText("Choose a website screenshot to start",w/2,h/2,w*.85); return; }
    context.drawImage(image,0,0,w,h);
    const size = Math.max(9,Math.min(w,h)*.022), line = Math.max(2,size*.19);
    notes.forEach((note,index) => {
      const colour = priorities[note.priority]; const x=note.x*w, y=note.y*h, ex=note.ex*w, ey=note.ey*h;
      context.save(); context.strokeStyle=colour; context.lineWidth=line;
      if (note.type === "highlight") { context.globalAlpha=.2; context.fillStyle=colour; context.fillRect(Math.min(x,ex),Math.min(y,ey),Math.abs(ex-x),Math.abs(ey-y)); context.globalAlpha=1; context.strokeRect(Math.min(x,ex),Math.min(y,ey),Math.abs(ex-x),Math.abs(ey-y)); }
      if (note.type === "arrow") {
        context.beginPath();context.moveTo(x,y);context.lineTo(ex,ey);context.stroke();
        const angle=Math.atan2(ey-y,ex-x), head=size*1.4; context.beginPath();context.moveTo(ex-head*Math.cos(angle-.45),ey-head*Math.sin(angle-.45));context.lineTo(ex,ey);context.lineTo(ex-head*Math.cos(angle+.45),ey-head*Math.sin(angle+.45));context.stroke();
      }
      const bx=Math.max(size+2,Math.min(w-size-2,x)), by=Math.max(size+2,Math.min(h-size-2,y));
      badge(context,bx,by,String(index+1),colour,size);
      if (editing && note.id===selected) { context.strokeStyle="#23322c";context.setLineDash([line*2,line*2]);context.beginPath();context.arc(bx,by,size*1.4,0,Math.PI*2);context.stroke(); }
      context.restore();
    });
  }
  function list() {
    $("feedback-notes").replaceChildren();
    notes.forEach((note,index) => {
      const li=el("li");li.classList.toggle("is-selected",note.id===selected);
      li.append(el("strong",`${index+1}. ${note.priority.toUpperCase()} / ${note.type}`),el("p",note.text || "Add a change request before exporting the brief."));
      li.append(el("p",`${note.category || "content"} / ${note.state || "planned"}${note.owner ? " / Owner: "+note.owner : ""}`));
      if(note.acceptance)li.append(el("p",`Acceptance: ${note.acceptance}`));
      const edit=el("button","Edit note");edit.type="button";edit.className="tool-small-button";edit.dataset.edit=note.id;edit.setAttribute("aria-label",`Edit note ${index+1}`);
      const remove=el("button","Remove");remove.type="button";remove.className="tool-small-button";remove.dataset.remove=note.id;remove.setAttribute("aria-label",`Remove note ${index+1}`);
      li.append(edit,remove);$("feedback-notes").append(li);
    });
    $("feedback-count").textContent=`${notes.length} change request${notes.length===1?"":"s"}. Numbers match the image and brief.`;
    sync();
  }
  function select(id, focus = false) {
    selected=id;const note=notes.find(n=>n.id===id);
    $("feedback-note").value=note?.text || "";$("feedback-priority").value=note?.priority || "medium";
    $("feedback-owner").value=note?.owner||"";$("feedback-acceptance").value=note?.acceptance||"";$("feedback-category").value=note?.category||"content";$("feedback-state").value=note?.state||"planned";
    $("feedback-note-label").textContent=note ? `Change request ${notes.indexOf(note)+1}` : "Change request";
    draw();list();if(focus) $("feedback-note").focus();
  }
  function add(type,x,y,ex,ey) {
    if(notes.length>=100){status("Maximum 100 annotations per screenshot. Remove a note before adding another.");return;}
    const note={id:nextId++,type,x,y,ex,ey,text:"",priority:$("feedback-priority").value,category:"content",owner:"",acceptance:"",state:"planned"};notes.push(note);select(note.id,true);
    status("Mark added. Describe the change, choose a priority, then save the note.");
  }
  function point(event) { const r=canvas.getBoundingClientRect();return {x:Math.max(0,Math.min(1,(event.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(event.clientY-r.top)/r.height))}; }
  canvas.addEventListener("pointerdown",event=>{
    if(!image||loading||exporting||(event.pointerType==="mouse"&&event.button!==0))return;
    const p=point(event);pointer={...p,id:event.pointerId,type:$("feedback-mark").value};canvas.setPointerCapture(event.pointerId);event.preventDefault();
  });
  canvas.addEventListener("pointermove",event=>{
    if(!pointer||event.pointerId!==pointer.id)return;draw();const p=point(event);
    ctx.save();ctx.strokeStyle=priorities[$("feedback-priority").value];ctx.lineWidth=Math.max(2,canvas.width*.003);ctx.setLineDash([8,6]);
    if(pointer.type==="highlight")ctx.strokeRect(pointer.x*canvas.width,pointer.y*canvas.height,(p.x-pointer.x)*canvas.width,(p.y-pointer.y)*canvas.height);
    else if(pointer.type==="arrow"){ctx.beginPath();ctx.moveTo(pointer.x*canvas.width,pointer.y*canvas.height);ctx.lineTo(p.x*canvas.width,p.y*canvas.height);ctx.stroke();}ctx.restore();
  });
  canvas.addEventListener("pointerup",event=>{
    if(!pointer||event.pointerId!==pointer.id)return;const p=point(event),start=pointer;pointer=null;
    if(start.type!=="pin"&&Math.hypot(p.x-start.x,p.y-start.y)<.015){draw();status("Drag across the screenshot to draw an arrow or highlight. For a single click, choose Numbered pin.");return;}
    add(start.type,start.x,start.y,p.x,p.y);
  });
  canvas.addEventListener("pointercancel",()=>{pointer=null;draw();});
  canvas.addEventListener("lostpointercapture",()=>{if(pointer){pointer=null;draw();}});
  $("feedback-add-centre").addEventListener("click",()=>{if(image&&!loading&&!exporting)add($("feedback-mark").value,.5,.5,.7,.7);});
  $("feedback-save-note").addEventListener("click",()=>{
    const note=notes.find(n=>n.id===selected);if(!note)return;
    if(!$("feedback-note").value.trim()){status("Describe what should change before saving this note.");$("feedback-note").focus();return;}
    note.text=$("feedback-note").value.trim();note.priority=$("feedback-priority").value;draw();list();status("Change request saved.");
    window.trackBusinessEvent?.("tool_complete",{item_count:notes.length});
  });
  // Keep the active draft in sync so downloading never loses typed feedback.
  $("feedback-note").addEventListener("input",()=>{const note=notes.find(n=>n.id===selected);if(note){note.text=$("feedback-note").value;list();}});
  $("feedback-priority").addEventListener("change",()=>{const note=notes.find(n=>n.id===selected);if(note){note.priority=$("feedback-priority").value;draw();list();}});
  for(const [id,key] of [["feedback-owner","owner"],["feedback-acceptance","acceptance"],["feedback-category","category"],["feedback-state","state"]])$(id).addEventListener("input",()=>{const note=notes.find(n=>n.id===selected);if(note){note[key]=$(id).value;list();}});
  $("feedback-notes").addEventListener("click",event=>{
    const button=event.target.closest("button");if(!button||loading||exporting)return;
    if(button.dataset.edit)select(Number(button.dataset.edit),true);
    if(button.dataset.remove){notes=notes.filter(n=>n.id!==Number(button.dataset.remove));select(notes.at(-1)?.id??null);status("Note removed. Image and brief numbering updated.");}
  });
  $("feedback-undo").addEventListener("click",()=>{notes.pop();select(notes.at(-1)?.id??null);status("Last annotation removed.");});
  async function load(url,name) {
    const candidate=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error("Could not decode this image."));img.src=url;});
    if(candidate.naturalWidth*candidate.naturalHeight>16000000)throw new Error("Maximum 16 megapixels. Resize the screenshot first.");
    if(pages.length>=5)throw new Error("Maximum five screenshots per project. Remove a page first.");
    if(pages.reduce((sum,page)=>sum+page.image.naturalWidth*page.image.naturalHeight,0)+candidate.naturalWidth*candidate.naturalHeight>20000000)throw new Error("Maximum 20 megapixels across all screenshots. Resize images or remove a page first.");
    stash();image=candidate;imageName=name;notes=[];selected=null;
    const scale=Math.min(1,4096/Math.max(candidate.naturalWidth,candidate.naturalHeight));canvas.width=Math.round(candidate.naturalWidth*scale);canvas.height=Math.round(candidate.naturalHeight*scale);
    currentPage=nextPageId++;pages.push({id:currentPage,image,imageName:name,notes,width:canvas.width,height:canvas.height});pageOptions();
    $("feedback-caption").textContent=`${name}: ${candidate.naturalWidth} × ${candidate.naturalHeight} px. Image export: ${canvas.width} × ${canvas.height} px. Red: high priority. Amber: medium. Green: low.`;
    select(null);status("Screenshot ready. Choose a mark type and click or drag on the image.");
  }
  function stash(){const page=pages.find(p=>p.id===currentPage);if(page){page.notes=notes;page.image=image;}}
  function pageOptions(){const select=$("feedback-page");select.replaceChildren();pages.forEach((page,index)=>{const option=el("option",`${index+1}. ${page.imageName}`);option.value=page.id;select.append(option);});select.value=String(currentPage);}
  function switchPage(id){stash();const page=pages.find(p=>p.id===id);if(!page)return;currentPage=id;image=page.image;imageName=page.imageName;notes=page.notes;canvas.width=page.width;canvas.height=page.height;pageOptions();$("feedback-caption").textContent=`${imageName}: ${canvas.width} × ${canvas.height} px. Note references use page and mark numbers in the project brief.`;select(notes.at(-1)?.id??null);}
  $("feedback-page").addEventListener("change",event=>switchPage(Number(event.target.value)));
  $("feedback-remove-page").addEventListener("click",()=>{const index=pages.findIndex(p=>p.id===currentPage);if(index<0)return;pages.splice(index,1);if(pages.length){currentPage=null;switchPage(pages[Math.min(index,pages.length-1)].id);}else{image=null;notes=[];currentPage=null;pageOptions();select(null);}status("Screenshot page removed. Page references updated.");});
  $("feedback-file").addEventListener("change",async event=>{
    const file=event.target.files[0];if(!file||loading||exporting)return;
    if(!["image/png","image/jpeg","image/webp"].includes(file.type)||file.size>20*1024*1024){status("Choose a JPG, PNG or WebP screenshot up to 20 MB.");event.target.value="";return;}
    loading=true;sync();const url=URL.createObjectURL(file);
    try{await load(url,file.name);}catch(error){status(error.message);}finally{URL.revokeObjectURL(url);loading=false;sync();event.target.value="";}
  });
  $("feedback-demo").addEventListener("click",async()=>{
    if(loading||exporting)return;loading=true;sync();
    try{
      await document.fonts.ready;const sample=document.createElement("canvas");sample.width=1200;sample.height=800;const c=sample.getContext("2d");
      c.fillStyle="#f5f2eb";c.fillRect(0,0,1200,800);c.fillStyle="#23322c";c.font="500 24px Moderat, Arial";c.fillText("NORTH STUDIO",50,65);c.font="20px Moderat, Arial";c.fillText("Services     Our work     Contact",780,65);
      c.font="500 60px Moderat, Arial";c.fillText("A better space to work.",50,240);c.font="28px Moderat, Arial";c.fillText("Flexible workspaces for growing teams.",50,300);c.fillRect(50,345,230,65);c.fillStyle="#ffffff";c.fillText("Book a viewing",65,386);
      ["#ceddcc","#e5d3ba","#c4d7da"].forEach((colour,i)=>{c.fillStyle=colour;c.fillRect(50+i*380,470,340,210);});
      await load(sample.toDataURL("image/png"),"Demo website screenshot");
    }catch(error){status(error.message);}finally{loading=false;sync();}
  });
  function download(blob,filename) {const url=URL.createObjectURL(blob),link=el("a");link.href=url;link.download=filename;link.addEventListener("click",event=>event.stopPropagation());document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
  function validNotes() {if(!image||!notes.length)return false;if(notes.some(n=>!n.text.trim())){status("Add a change request for every numbered annotation before exporting.");select(notes.find(n=>!n.text.trim()).id,true);return false;}return true;}
  $("feedback-image-download").addEventListener("click",async()=>{
    if(loading||exporting||!validNotes())return;exporting=true;sync();let output;
    try{await document.fonts.ready;output=document.createElement("canvas");output.width=canvas.width;output.height=canvas.height;draw(output,false);const blob=await new Promise(resolve=>output.toBlob(resolve,"image/png"));if(!blob)throw new Error("Could not encode the image. Try a smaller screenshot.");download(blob,`website-feedback-page-${pages.findIndex(p=>p.id===currentPage)+1}.png`);window.trackBusinessEvent?.("tool_download",{format:"png",item_count:notes.length});status("Annotated PNG download requested. Its page and note numbers match the brief.");}
    catch(error){status(error.message);}finally{if(output){output.width=0;output.height=0;}exporting=false;sync();}
  });
  $("feedback-brief-download").addEventListener("click",()=>{
    if(loading||exporting||!validProject())return;
    const lines=["WEBSITE FEEDBACK & REDESIGN BRIEF","",`Project: ${$("feedback-project").value.trim()||"Website redesign"}`,`Page reference: ${$("feedback-url").value.trim()||"Not supplied"}`,`Screenshot: ${imageName}`,`Goal: ${$("feedback-goal").value.trim()||"Not supplied"}`,"","CHANGE REQUESTS (numbers match annotated PNG)",""];
    pages.forEach((page,pageIndex)=>{lines.push(`PAGE ${pageIndex+1}: ${page.imageName}`,"");page.notes.forEach((note,index)=>{lines.push(`${pageIndex+1}.${index+1}. [${note.priority.toUpperCase()}] ${note.type} / ${note.category} / ${note.state}`,note.text.trim(),`Owner: ${note.owner||"Unassigned"}`,`Acceptance criteria: ${note.acceptance||"To agree"}`,`Position: ${Math.round(note.x*100)}% from left, ${Math.round(note.y*100)}% from top.`,"");});});
    lines.push("NEXT STEPS","Agree scope, dependencies and acceptance criteria with your developer before implementation.","This brief records your feedback; it is not an automated site audit or a quote.");
    download(new Blob([lines.join("\n")],{type:"text/plain;charset=utf-8"}),"website-redesign-brief.txt");status("Developer brief download requested. Send it with the annotated PNG.");
    window.trackBusinessEvent?.("tool_download",{format:"txt",item_count:pages.reduce((sum,page)=>sum+page.notes.length,0)});
  });
  function validProject(){stash();const incomplete=pages.find(page=>page.notes.some(note=>!note.text.trim()));if(incomplete){switchPage(incomplete.id);return validNotes();}if(!pages.some(page=>page.notes.length)){status("Add at least one change request first.");return false;}return true;}
  $("feedback-save-project").addEventListener("click",()=>{
    if(loading||exporting||!pages.length)return;stash();exporting=true;sync();
    try {
    const screens=pages.map(page=>{const snapshot=document.createElement("canvas");snapshot.width=page.width;snapshot.height=page.height;snapshot.getContext("2d").drawImage(page.image,0,0,page.width,page.height);const data=snapshot.toDataURL("image/png");snapshot.width=snapshot.height=0;return {name:page.imageName,data,notes:page.notes};});
    const file=new Blob([JSON.stringify({version:1,project:$("feedback-project").value,url:$("feedback-url").value,goal:$("feedback-goal").value,pages:screens})],{type:"application/json"});if(file.size>50*1024*1024){status("Project export exceeds 50 MB. Use smaller screenshots before saving, or download page images and the brief separately.");return;}download(file,"website-feedback-project.json");window.trackBusinessEvent?.("tool_download",{format:"project"});status("Project saved locally with screenshots and notes. Reopen it here to continue later.");
    } catch(error) { status(`Could not save project: ${error.message}. Try smaller screenshots or export the brief separately.`); }
    finally {exporting=false;sync();}
  });
  $("feedback-load-project").addEventListener("change",async event=>{
    const file=event.target.files[0];if(!file||loading||exporting)return;loading=true;sync();
    try{
      if(file.size>50*1024*1024)throw new Error("Maximum 50 MB project file.");const project=JSON.parse(await file.text());
      if(project.version!==1||!Array.isArray(project.pages)||!project.pages.length||project.pages.length>5)throw new Error("Choose a version 1 project with one to five pages.");
      for(const [key,max] of [["project",120],["url",300],["goal",1500]])if(typeof project[key]!=="string"||project[key].length>max)throw new Error("Invalid project details.");
      const restored=[];let pixels=0,sequence=1;
      for(const page of project.pages){
        if(typeof page.name!=="string"||page.name.length>300||typeof page.data!=="string"||!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(page.data)||!Array.isArray(page.notes)||page.notes.length>100)throw new Error("Invalid screenshot or notes in project.");
        const decoded=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error("Could not decode project screenshot."));img.src=page.data;});
        pixels+=decoded.naturalWidth*decoded.naturalHeight;if(pixels>20000000||decoded.naturalWidth*decoded.naturalHeight>16000000||Math.max(decoded.naturalWidth,decoded.naturalHeight)>4096)throw new Error("Project exceeds screenshot limits.");
        const restoredNotes=page.notes.map(note=>{
          if(!["pin","arrow","highlight"].includes(note.type)||!Object.hasOwn(priorities,note.priority)||!["content","usability","visual","functionality","accessibility"].includes(note.category)||!["planned","in-progress","done"].includes(note.state))throw new Error("Invalid note settings.");
          for(const key of ["x","y","ex","ey"])if(typeof note[key]!=="number"||!Number.isFinite(note[key])||note[key]<0||note[key]>1)throw new Error("Invalid note position.");
          for(const [key,max] of [["text",2000],["owner",100],["acceptance",1500]])if(typeof note[key]!=="string"||note[key].length>max)throw new Error("Invalid note text.");
          return {id:sequence++,type:note.type,priority:note.priority,category:note.category,state:note.state,x:note.x,y:note.y,ex:note.ex,ey:note.ey,text:note.text,owner:note.owner,acceptance:note.acceptance};
        });
        restored.push({id:restored.length+1,image:decoded,imageName:page.name,notes:restoredNotes,width:decoded.naturalWidth,height:decoded.naturalHeight});
      }
      pages=restored;currentPage=null;nextPageId=pages.length+1;nextId=sequence;$("feedback-project").value=project.project;$("feedback-url").value=project.url;$("feedback-goal").value=project.goal;switchPage(pages[0].id);status("Saved project restored locally. No screenshots were uploaded.");
    }catch(error){status(`Could not load project: ${error.message}`);}finally{loading=false;sync();event.target.value="";}
  });
  $("feedback-print").addEventListener("click",async()=>{
    if(loading||exporting||!validProject())return;await document.fonts.ready;document.body.classList.add("feedback-print-ready");stash();const active=currentPage;const container=$("feedback-print-view");container.replaceChildren();container.append(el("h1",$("feedback-project").value||"Website redesign brief"),el("p",$("feedback-goal").value||"Goal to agree"),el("p",$("feedback-url").value||"Page reference not supplied"));
    pages.forEach((page,pageIndex)=>{switchPage(page.id);const section=el("section");section.append(el("h2",`Page ${pageIndex+1}: ${page.imageName}`));const output=document.createElement("canvas");output.width=page.width;output.height=page.height;draw(output,false);const preview=el("img");preview.src=output.toDataURL("image/png");preview.alt=`Annotated screenshot for page ${pageIndex+1}`;section.append(preview);output.width=output.height=0;page.notes.forEach((note,index)=>section.append(el("h3",`${pageIndex+1}.${index+1} / ${note.priority} / ${note.state}`),el("p",note.text),el("p",`Owner: ${note.owner||"Unassigned"}. Acceptance: ${note.acceptance||"To agree"}.`)));container.append(section);});switchPage(active);await Promise.all([...container.querySelectorAll("img")].map(img=>img.decode()));window.trackBusinessEvent?.("tool_download",{format:"print"});window.print();
  });
  $("feedback-clear").addEventListener("click",()=>{image=null;pages=[];currentPage=null;nextPageId=1;nextId=1;notes=[];imageName="";pointer=null;canvas.width=1200;canvas.height=750;pageOptions();select(null);$("feedback-caption").textContent="Your annotated screenshot will appear here.";status("Screenshot and annotations cleared. Your original file is unchanged.");});
  draw();sync();document.fonts.ready.then(()=>draw());
})();
