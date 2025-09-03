/* public/Js/boekingen.js v0903r (live vrije plaatsen + statusblok) */
console.log("boekingen.js geladen v0903r");

const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

async function j(url){
  const r = await fetch(url, {headers:{'cache-control':'no-cache'}});
  if(!r.ok) throw new Error(`${url} → ${r.status}`);
  return r.json();
}
async function jSend(url, method, body){
  const r = await fetch(url, {
    method,
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(body||{})
  });
  if(!r.ok){
    let msg = r.statusText;
    try{ const e = await r.json(); msg = e.error || msg; }catch{}
    throw new Error(`${method} ${url} → ${r.status} ${msg}`);
  }
  return r.json();
}
function badge(st){
  const s=(st||"").toLowerCase();
  const cls = s==="geannuleerd" ? "st-geannuleerd" : s==="wachtlijst" ? "st-wachtlijst" : "st-bevestigd";
  return `<span class="status-badge ${cls}">${st||"bevestigd"}</span>`;
}
function fmtDate(iso){
  if(!iso) return "";
  const d = new Date(iso);
  if(isNaN(d)) return iso;
  return d.toLocaleDateString();
}
function fmtTime(iso){
  if(!iso) return "";
  const d = new Date(iso);
  if(isNaN(d)) return "";
  return d.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
}
function toCSV(rows, headers){
  const esc=v=>`"${String(v??"").replace(/"/g,'""')}"`;
  const head = headers.map(h=>esc(h.label)).join(",");
  const body = rows.map(r=>headers.map(h=>esc(r[h.key])).join(",")).join("\n");
  return head+"\n"+body;
}

/* ------- state ------- */
let DATA = {
  boekingen: [],
  lessen: [],
  klanten: [],
  honden: []
};
let ENRICHED = []; // verrijkte rijen voor render
const byId = (arr) => Object.fromEntries(arr.map(x=>[x.id,x]));

/* ------- modal helpers ------- */
function openModal(id){ $(id).classList.add("open"); }
function closeModal(id){ $(id).classList.remove("open"); }
function clearSelect(sel){ while(sel.options.length) sel.remove(0); }

/* ------- init ------- */
(async function init(){
  const tbody = $("#tbl-boeking tbody");
  try{
    const [boekingen, lessen, klanten, honden] = await Promise.all([
      j("/api/boekingen"), j("/api/lessen"), j("/api/klanten"), j("/api/honden")
    ]);
    DATA = {boekingen, lessen, klanten, honden};
    rebuild();

    // filters vullen
    const selLes = $("#les-filter");
    clearSelect(selLes);
    selLes.insertAdjacentHTML("beforeend", `<option value="">Alle</option>`);
    [...new Set(ENRICHED.map(r=>r.lesNaam).filter(Boolean))].sort()
      .forEach(n => selLes.insertAdjacentHTML("beforeend", `<option>${n}</option>`));

    // events
    ["#q","#status","#from","#to","#les-filter"].forEach(sel=>{
      $(sel).addEventListener("input", render);
      $(sel).addEventListener("change", render);
    });

    $("#export").addEventListener("click", exportCSV);
    $("#btn-new").addEventListener("click", onNew);

    // table click (edit/delete)
    tbody.addEventListener("click", (e)=>{
      const btn = e.target.closest("button");
      if(!btn) return;
      const tr = e.target.closest("tr");
      const id = tr?.dataset?.id;
      if(btn.classList.contains("edit")) onEdit(id);
      if(btn.classList.contains("delete")) onDelete(id);
    });

    // modal close
    $("[data-close='modal-bk']").addEventListener("click", ()=>closeModal("#modal-bk"));

    // form submit
    $("#form-bk").addEventListener("submit", onSubmit);

    // live: check vrije plaatsen bij les-selectie
    $("#f-les").addEventListener("change", updateCapacityInfo);

    render();
  }catch(err){
    console.error(err);
    tbody.innerHTML = `<tr class="placeholder"><td colspan="7" style="text-align:center;color:#b00;">Kan data niet laden (${err.message}).</td></tr>`;
  }
})();

/* ------- data transform & render ------- */
function rebuild(){
  const lesById  = byId(DATA.lessen);
  const klantById= byId(DATA.klanten);
  const hondById = byId(DATA.honden);

  ENRICHED = DATA.boekingen.map(b=>{
    const les = lesById[b.les_id] || {};
    const kl  = klantById[b.klant_id] || {};
    const hd  = hondById[b.hond_id] || {};
    const dt  = les.start || b.datum || null;
    return {
      ...b,
      klantNaam: kl.naam || "",
      hondNaam : hd.hond_naam || "",
      lesNaam  : les.naam || "",
      iso      : dt,
      datum    : fmtDate(dt),
      tijd     : fmtTime(dt),
      status   : b.status || "bevestigd"
    };
  });
}

function render(){
  const tbody = $("#tbl-boeking tbody");
  const q = ($("#q").value||"").toLowerCase();
  const st= ($("#status").value||"").toLowerCase();
  const lf= $("#les-filter").value;
  const from=$("#from").value;
  const to  =$("#to").value;

  function inRange(iso, from, to){
    if(!iso) return true;
    const t = new Date(iso).setHours(0,0,0,0);
    if(from && t < new Date(from).setHours(0,0,0,0)) return false;
    if(to   && t > new Date(to  ).setHours(23,59,59,999)) return false;
    return true;
  }

  const filtered = ENRICHED.filter(r=>{
    const mq = !q || [r.klantNaam,r.hondNaam,r.lesNaam].some(v=>(v||"").toLowerCase().includes(q));
    const ms = !st || (r.status||"").toLowerCase()===st;
    const ml = !lf || r.lesNaam===lf;
    const md = inRange(r.iso, from, to);
    return mq && ms && ml && md;
  });

  if(!filtered.length){
    tbody.innerHTML = `<tr class="placeholder"><td colspan="7" style="text-align:center;color:#777;">Geen boekingen gevonden.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(r=>`
    <tr data-id="${r.id}">
      <td>${r.klantNaam}</td>
      <td>${r.hondNaam}</td>
      <td>${r.lesNaam}</td>
      <td>${r.datum}</td>
      <td>${r.tijd}</td>
      <td>${badge(r.status)}</td>
      <td class="t-actions">
        <button class="icon-btn edit" title="Bewerken">✏️</button>
        <button class="icon-btn delete" title="Verwijderen">🗑️</button>
      </td>
    </tr>
  `).join("");
}

function exportCSV(){
  const headers = [
    {key:"klantNaam", label:"Klant"},
    {key:"hondNaam",  label:"Hond"},
    {key:"lesNaam",   label:"Les"},
    {key:"datum",     label:"Datum"},
    {key:"tijd",      label:"Tijd"},
    {key:"status",    label:"Status"}
  ];
  const csv = toCSV(ENRICHED, headers);
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "boekingen.csv";
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

/* ------- modal: vullen/selects ------- */
function populateSelects({selectedKlant, selectedHond, selectedLes, selectedStatus="bevestigd"}) {
  const selKlant = $("#f-klant");
  const selHond  = $("#f-hond");
  const selLes   = $("#f-les");
  const selSt    = $("#f-status");

  clearSelect(selKlant);
  clearSelect(selHond);
  clearSelect(selLes);

  // Klanten
  DATA.klanten
    .slice().sort((a,b)=>a.naam.localeCompare(b.naam))
    .forEach(k => selKlant.insertAdjacentHTML("beforeend",
      `<option value="${k.id}" ${k.id===selectedKlant?"selected":""}>${k.naam}</option>`));

  // Honden
  const honden = selectedKlant ? DATA.honden.filter(h=>h.klant_id===selectedKlant) : DATA.honden;
  honden
    .slice().sort((a,b)=>a.hond_naam.localeCompare(b.hond_naam))
    .forEach(h => selHond.insertAdjacentHTML("beforeend",
      `<option value="${h.id}" ${h.id===selectedHond?"selected":""}>${h.hond_naam}</option>`));

  // Lessen
  DATA.lessen
    .slice().sort((a,b)=>a.naam.localeCompare(b.naam))
    .forEach(l => selLes.insertAdjacentHTML("beforeend",
      `<option value="${l.id}" ${l.id===selectedLes?"selected":""}>${l.naam}</option>`));

  // Status
  selSt.value = selectedStatus;

  // Als klant wijzigt → honden filteren
  selKlant.onchange = () => {
    populateSelects({
      selectedKlant: selKlant.value,
      selectedHond: null,
      selectedLes: selLes.value,
      selectedStatus: selSt.value
    });
  };

  // update capaciteit info direct
  updateCapacityInfo();
}

/* ------- vrije plaatsen info ------- */
function updateCapacityInfo(){
  const selLes = $("#f-les");
  const infoBoxId = "cap-info";
  let infoBox = document.getElementById(infoBoxId);
  if(!infoBox){
    infoBox = document.createElement("div");
    infoBox.id = infoBoxId;
    infoBox.style.margin = "8px 0";
    infoBox.style.fontSize = "0.9rem";
    $("#form-bk").insertBefore(infoBox, $("#form-bk").firstChild);
  }

  const lesId = selLes.value;
  const les = DATA.lessen.find(l=>l.id===lesId);
  const selSt = $("#f-status");

  if(les){
    const cap = Number(les.capaciteit||0);
    const bez = Number(les.bezet||0);
    if(cap>0){
      const vrij = cap - bez;
      if(vrij>0){
        infoBox.textContent = `ℹ️ Vrije plaatsen: ${vrij} (van ${cap})`;
        infoBox.style.color = "#185b00";
        // status weer activeren
        [...selSt.options].forEach(o=>o.disabled=false);
      }else{
        infoBox.textContent = `⚠️ Les is vol (${bez}/${cap}). Alleen wachtlijst of geannuleerd mogelijk.`;
        infoBox.style.color = "#b00";
        // blokkeer 'bevestigd'
        [...selSt.options].forEach(o=>{
          if(o.value==="bevestigd") o.disabled=true;
        });
        if(selSt.value==="bevestigd") selSt.value="wachtlijst";
      }
    }else{
      infoBox.textContent = "ℹ️ Onbeperkte capaciteit";
      infoBox.style.color = "#444";
      [...selSt.options].forEach(o=>o.disabled=false);
    }
  }else{
    infoBox.textContent = "";
  }
}

/* ------- acties ------- */
function onNew(){
  $("#modal-title").textContent = "Nieuwe boeking";
  $("#form-bk").reset();
  $("#form-bk").id.value = "";
  populateSelects({ selectedKlant: DATA.klanten[0]?.id || null, selectedHond: null, selectedLes: DATA.lessen[0]?.id || null });
  openModal("#modal-bk");
}

function onEdit(id){
  const row = DATA.boekingen.find(b=>b.id===id);
  if(!row) return;
  $("#modal-title").textContent = "Boeking bewerken";
  $("#form-bk").id.value = row.id;
  populateSelects({
    selectedKlant: row.klant_id,
    selectedHond : row.hond_id,
    selectedLes  : row.les_id,
    selectedStatus: row.status || "bevestigd"
  });
  $("#f-datum").value = row.datum || "";
  openModal("#modal-bk");
}

async function onDelete(id){
  const row = DATA.boekingen.find(b=>b.id===id);
  if(!row) return;
  if(!confirm(`Boeking verwijderen?`)) return;
  try{
    await jSend(`/api/boekingen/${encodeURIComponent(id)}`, "DELETE");
    DATA.boekingen = DATA.boekingen.filter(b=>b.id!==id);
    rebuild(); render();
  }catch(err){
    alert("Verwijderen mislukt: "+err.message);
  }
}

async function onSubmit(e){
  e.preventDefault();
  const form = e.currentTarget;
  const payload = Object.fromEntries(new FormData(form).entries());
  const body = {
    klant_id: payload.klant_id,
    hond_id: payload.hond_id,
    les_id: payload.les_id,
    status: payload.status || "bevestigd",
    datum : payload.datum || null
  };

  try{
    if(!payload.id){
      const created = await jSend("/api/boekingen", "POST", body);
      DATA.boekingen.push(created);
    }else{
      const updated = await jSend(`/api/boekingen/${encodeURIComponent(payload.id)}`, "PUT", body);
      const idx = DATA.boekingen.findIndex(b=>b.id===payload.id);
      if(idx!==-1) DATA.boekingen[idx] = updated;
    }
    closeModal("#modal-bk");
    rebuild(); render();
  }catch(err){
    alert("Opslaan mislukt: "+err.message);
  }
}
