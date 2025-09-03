/* public/Js/lessen.js v0903p */
console.log("lessen.js geladen v0903p");

const $ = s => document.querySelector(s);

async function j(url){
  const r = await fetch(url, {headers:{'cache-control':'no-cache'}});
  if(!r.ok) throw new Error(`${url} failed: ${r.status}`);
  return r.json();
}
async function jSend(url, method, body){
  const r = await fetch(url, {
    method, headers: {"Content-Type":"application/json"},
    body: JSON.stringify(body||{})
  });
  if(!r.ok){
    let msg = r.statusText;
    try{ const e = await r.json(); msg = e.error || msg; }catch{}
    throw new Error(`${method} ${url} → ${r.status} ${msg}`);
  }
  return r.json();
}

function fmtDateTime(iso){
  if(!iso) return "";
  const d = new Date(iso);
  if(isNaN(d)) return iso;
  return d.toLocaleString(undefined, { weekday:"short", day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" });
}
function toIsoLocal(dtLocal){
  // dtLocal = "YYYY-MM-DDTHH:mm"
  if(!dtLocal) return null;
  // neem locale zonetijd aan en maak ISO string
  const d = new Date(dtLocal);
  if(isNaN(d)) return null;
  return d.toISOString();
}
function badge(status){
  const s = (status||"").toLowerCase();
  const map = {actief:'st-actief', vol:'st-vol', geannuleerd:'st-geannuleerd'};
  return `<span class="status-badge ${map[s]||'st-actief'}">${status||'actief'}</span>`;
}
function toCSV(rows, headers){
  const esc = v => `"${String(v??"").replace(/"/g,'""')}"`;
  return [headers.map(h=>esc(h.label)).join(","), ...rows.map(r=>headers.map(h=>esc(r[h.key])).join(","))].join("\n");
}

let DATA = { lessen: [], trainers: [], locaties: [] };
let ENRICHED = [];

function byId(arr){ return Object.fromEntries(arr.map(x=>[x.id,x])); }
function enrich(){
  const tBy = byId(DATA.trainers);
  const lBy = byId(DATA.locaties);
  ENRICHED = DATA.lessen.map(x=>({
    ...x,
    trainerNaam: tBy[x.trainer_id]?.naam || "",
    locatieNaam: lBy[x.locatie_id]?.locatie || "",
    startTekst: fmtDateTime(x.start),
    cap: `${x.bezet ?? 0}/${x.capaciteit ?? ""}`
  }));
}

function render(){
  const tbody = document.querySelector("#tbl-lessen tbody");
  const q = ($("#q").value||"").toLowerCase();
  const st = ($("#status").value||"");
  const tr = $("#trainer-filter").value;
  const lc = $("#loc-filter").value;

  const rows = ENRICHED.filter(d=>{
    const matchQ = !q || [d.naam,d.type,d.trainerNaam,d.locatieNaam].some(v=>(v||"").toLowerCase().includes(q));
    const matchS = !st || (d.status||"")===st;
    const matchT = !tr || d.trainerNaam===tr;
    const matchL = !lc || d.locatieNaam===lc;
    return matchQ && matchS && matchT && matchL;
  });

  if(!rows.length){
    tbody.innerHTML = `<tr class="placeholder"><td colspan="8" style="text-align:center;color:#777;">Geen lessen gevonden.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(r=>`
    <tr data-id="${r.id}">
      <td>${r.naam||""}</td>
      <td>${r.type||""}</td>
      <td>${r.trainerNaam||""}</td>
      <td>${r.locatieNaam||""}</td>
      <td>${r.startTekst||""}</td>
      <td>${r.cap||""}</td>
      <td>${badge(r.status)}</td>
      <td class="t-actions">
        <button class="icon-btn edit" title="Bewerken">✏️</button>
        <button class="icon-btn delete" title="Verwijderen">🗑️</button>
      </td>
    </tr>
  `).join("");
}

function fillFilters(){
  const trSel = $("#trainer-filter");
  const lcSel = $("#loc-filter");
  // reset
  trSel.innerHTML = `<option value="">Alle</option>`;
  lcSel.innerHTML = `<option value="">Alle</option>`;
  // vul
  [...new Set(ENRICHED.map(d=>d.trainerNaam).filter(Boolean))].sort()
    .forEach(n => trSel.insertAdjacentHTML("beforeend", `<option>${n}</option>`));
  [...new Set(ENRICHED.map(d=>d.locatieNaam).filter(Boolean))].sort()
    .forEach(n => lcSel.insertAdjacentHTML("beforeend", `<option>${n}</option>`));
}

function exportCSV(){
  const headers = [
    {key:"naam", label:"Naam"},
    {key:"type", label:"Type"},
    {key:"trainerNaam", label:"Trainer"},
    {key:"locatieNaam", label:"Locatie"},
    {key:"start", label:"Start (ISO)"},
    {key:"capaciteit", label:"Capaciteit"},
    {key:"bezet", label:"Bezet"},
    {key:"status", label:"Status"}
  ];
  const csv = toCSV(DATA.lessen, headers);
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "lessen.csv";
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function openModal(){ document.getElementById("modal-les").classList.add("open"); }
function closeModal(){ document.getElementById("modal-les").classList.remove("open"); }

function populateModal({selectedTrainer, selectedLoc, row}){
  const selT = $("#f-trainer");
  const selL = $("#f-locatie");

  selT.innerHTML = "";
  DATA.trainers.slice().sort((a,b)=>a.naam.localeCompare(b.naam))
    .forEach(t => selT.insertAdjacentHTML("beforeend", `<option value="${t.id}" ${t.id===selectedTrainer?"selected":""}>${t.naam}</option>`));

  selL.innerHTML = "";
  DATA.locaties.slice().sort((a,b)=>a.locatie.localeCompare(b.locatie))
    .forEach(l => selL.insertAdjacentHTML("beforeend", `<option value="${l.id}" ${l.id===selectedLoc?"selected":""}>${l.locatie}</option>`));

  $("#f-naam").value  = row?.naam || "";
  $("#f-type").value  = row?.type || "";
  $("#f-start").value = row?.start ? new Date(row.start).toISOString().slice(0,16) : "";
  $("#f-cap").value   = row?.capaciteit ?? "";
  $("#f-bezet").value = row?.bezet ?? "";
  $("#f-status").value= row?.status || "actief";
}

async function loadAll(){
  const [lessen, trainers, locaties] = await Promise.all([
    j("/api/lessen"), j("/api/trainers"), j("/api/locaties")
  ]);
  DATA = {lessen, trainers, locaties};
  enrich();
  fillFilters();
  render();
}

async function onSubmit(e){
  e.preventDefault();
  const f = e.currentTarget;
  const payload = Object.fromEntries(new FormData(f).entries());
  const body = {
    naam: payload.naam,
    type: payload.type || "",
    trainer_id: payload.trainer_id,
    locatie_id: payload.locatie_id,
    start: toIsoLocal(payload.start),
    capaciteit: payload.capaciteit ? Number(payload.capaciteit) : 0,
    bezet: payload.bezet ? Number(payload.bezet) : 0,
    status: payload.status || "actief"
  };
  try{
    if(!payload.id){
      const created = await jSend("/api/lessen","POST",body);
      DATA.lessen.push(created);
    }else{
      const updated = await jSend(`/api/lessen/${encodeURIComponent(payload.id)}`,"PUT",body);
      const i = DATA.lessen.findIndex(x=>x.id===payload.id);
      if(i!==-1) DATA.lessen[i] = updated;
    }
    closeModal();
    enrich(); fillFilters(); render();
  }catch(err){
    alert("Opslaan mislukt: "+err.message);
  }
}

async function onDelete(id){
  const row = DATA.lessen.find(x=>x.id===id);
  if(!row) return;
  if(!confirm(`Les “${row.naam}” verwijderen?`)) return;
  try{
    await jSend(`/api/lessen/${encodeURIComponent(id)}`,"DELETE");
    DATA.lessen = DATA.lessen.filter(x=>x.id!==id);
    enrich(); fillFilters(); render();
  }catch(err){
    alert("Verwijderen mislukt: "+err.message);
  }
}

function onNew(){
  $("#modal-title").textContent = "Nieuwe les";
  const form = $("#form-les"); form.reset(); form.id.value="";
  populateModal({selectedTrainer: DATA.trainers[0]?.id || null, selectedLoc: DATA.locaties[0]?.id || null, row:null});
  openModal();
}

function onEdit(id){
  const row = DATA.lessen.find(x=>x.id===id);
  if(!row) return;
  $("#modal-title").textContent = "Les bewerken";
  const form = $("#form-les"); form.reset(); form.id.value = id;
  populateModal({selectedTrainer: row.trainer_id, selectedLoc: row.locatie_id, row});
  openModal();
}

/* init */
(async function(){
  const tbody = document.querySelector("#tbl-lessen tbody");
  try{
    await loadAll();

    // events
    ["#q","#status","#trainer-filter","#loc-filter"].forEach(sel=>{
      $(sel).addEventListener("input", render);
      $(sel).addEventListener("change", render);
    });
    $("#export").addEventListener("click", exportCSV);
    $("#btn-new").addEventListener("click", onNew);
    $("[data-close='modal-les']").addEventListener("click", closeModal);
    $("#form-les").addEventListener("submit", onSubmit);

    // table actions
    tbody.addEventListener("click",(e)=>{
      const btn = e.target.closest("button"); if(!btn) return;
      const id = e.target.closest("tr")?.dataset?.id;
      if(btn.classList.contains("edit")) onEdit(id);
      if(btn.classList.contains("delete")) onDelete(id);
    });

  }catch(err){
    console.error(err);
    tbody.innerHTML = `<tr class="placeholder"><td colspan="8" style="text-align:center;color:#b00;">Kan data niet laden (${err.message}).</td></tr>`;
  }
})();
