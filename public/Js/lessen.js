/* public/Js/lessen.js v0903l */
console.log("lessen.js geladen v0903l");

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

async function fetchJSON(url){
  const r = await fetch(url, {headers:{'cache-control':'no-cache'}});
  if(!r.ok) throw new Error(`${url} failed: ${r.status}`);
  return r.json();
}

function fmtDateTime(iso){
  if(!iso) return "";
  const d = new Date(iso);
  if(isNaN(d)) return iso;
  return d.toLocaleString(undefined, { weekday:"short", day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" });
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

(async function init(){
  const tbody = $("#tbl-lessen tbody");
  try{
    const [lessen, trainers, locaties] = await Promise.all([
      fetchJSON("/api/lessen"),
      fetchJSON("/api/trainers"),
      fetchJSON("/api/locaties")
    ]);

    // indexen
    const tById = Object.fromEntries(trainers.map(t=>[t.id, t]));
    const lById = Object.fromEntries(locaties.map(l=>[l.id, l]));

    // verrijk data
    const data = lessen.map(x => ({
      ...x,
      trainerNaam: tById[x.trainer_id]?.naam || "",
      locatieNaam: lById[x.locatie_id]?.locatie || "",
      startTekst: fmtDateTime(x.start),
      cap: `${x.bezet ?? 0}/${x.capaciteit ?? ""}`
    }));

    // populate filters (trainer/loc)
    const trSel = $("#trainer-filter");
    const lcSel = $("#loc-filter");
    [...new Set(data.map(d=>d.trainerNaam).filter(Boolean))].sort()
      .forEach(n => trSel.insertAdjacentHTML("beforeend", `<option>${n}</option>`));
    [...new Set(data.map(d=>d.locatieNaam).filter(Boolean))].sort()
      .forEach(n => lcSel.insertAdjacentHTML("beforeend", `<option>${n}</option>`));

    // render functie met filters
    function render(){
      const q = ($("#q").value||"").toLowerCase();
      const st = $("#status").value;
      const tr = trSel.value;
      const lc = lcSel.value;

      const rows = data.filter(d=>{
        const matchQ = !q || [d.naam,d.type,d.trainerNaam,d.locatieNaam].some(v=>(v||"").toLowerCase().includes(q));
        const matchS = !st || (d.status||"").toLowerCase()===st;
        const matchT = !tr || d.trainerNaam===tr;
        const matchL = !lc || d.locatieNaam===lc;
        return matchQ && matchS && matchT && matchL;
      });

      if(!rows.length){
        tbody.innerHTML = `<tr class="placeholder"><td colspan="8" style="text-align:center;color:#777;">Geen lessen gevonden.</td></tr>`;
        return;
      }

      tbody.innerHTML = rows.map(r=>`
        <tr>
          <td>${r.naam||""}</td>
          <td>${r.type||""}</td>
          <td>${r.trainerNaam||""}</td>
          <td>${r.locatieNaam||""}</td>
          <td>${r.startTekst||""}</td>
          <td>${r.cap||""}</td>
          <td>${badge(r.status)}</td>
          <td class="t-actions">
            <button class="icon-btn" title="Bewerken">✏️</button>
            <button class="icon-btn delete" title="Verwijderen">🗑️</button>
          </td>
        </tr>
      `).join("");
    }
    render();

    // filters + search
    ["#q","#status","#trainer-filter","#loc-filter"].forEach(sel=>{
      $(sel).addEventListener("input",render);
      $(sel).addEventListener("change",render);
    });

    // export CSV
    $("#export").addEventListener("click", ()=>{
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
      const csv = toCSV(lessen, headers);
      const blob = new Blob([csv], {type:"text/csv;charset=utf-8"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "lessen.csv";
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    });

  }catch(err){
    console.error(err);
    tbody.innerHTML = `<tr class="placeholder"><td colspan="8" style="text-align:center;color:#b00;">Kan data niet laden (${err.message}).</td></tr>`;
  }
})();
