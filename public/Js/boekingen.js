/* public/Js/boekingen.js v0903m */
console.log("boekingen.js geladen v0903m");

const $ = s => document.querySelector(s);

async function j(url){
  const r = await fetch(url, {headers:{'cache-control':'no-cache'}});
  if(!r.ok) throw new Error(`${url} → ${r.status}`);
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

(async function init(){
  const tbody = document.querySelector("#tbl-boeking tbody");
  try{
    const [boekingen, lessen, klanten, honden] = await Promise.all([
      j("/api/boekingen"), j("/api/lessen"), j("/api/klanten"), j("/api/honden")
    ]);

    const lesById = Object.fromEntries(lessen.map(l=>[l.id,l]));
    const klantById = Object.fromEntries(klanten.map(k=>[k.id,k]));
    const hondById = Object.fromEntries(honden.map(h=>[h.id,h]));

    const rows = boekingen.map(b=>{
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

    // Les-filter vullen
    const selLes = $("#les-filter");
    [...new Set(rows.map(r=>r.lesNaam).filter(Boolean))].sort()
      .forEach(n => selLes.insertAdjacentHTML("beforeend", `<option>${n}</option>`));

    function inRange(iso, from, to){
      if(!iso) return true;
      const t = new Date(iso).setHours(0,0,0,0);
      if(from && t < new Date(from).setHours(0,0,0,0)) return false;
      if(to   && t > new Date(to  ).setHours(23,59,59,999)) return false;
      return true;
    }

    function render(){
      const q = ($("#q").value||"").toLowerCase();
      const st= ($("#status").value||"").toLowerCase();
      const lf= selLes.value;
      const from=$("#from").value;
      const to  =$("#to").value;

      const filtered = rows.filter(r=>{
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
        <tr>
          <td>${r.klantNaam}</td>
          <td>${r.hondNaam}</td>
          <td>${r.lesNaam}</td>
          <td>${r.datum}</td>
          <td>${r.tijd}</td>
          <td>${badge(r.status)}</td>
          <td class="t-actions">
            <button class="icon-btn" title="Bewerken">✏️</button>
            <button class="icon-btn delete" title="Verwijderen">🗑️</button>
          </td>
        </tr>
      `).join("");
    }
    render();

    ["#q","#status","#from","#to","#les-filter"].forEach(sel=>{
      $(sel).addEventListener("input", render);
      $(sel).addEventListener("change", render);
    });

    $("#export").addEventListener("click", ()=>{
      const headers = [
        {key:"klantNaam", label:"Klant"},
        {key:"hondNaam",  label:"Hond"},
        {key:"lesNaam",   label:"Les"},
        {key:"datum",     label:"Datum"},
        {key:"tijd",      label:"Tijd"},
        {key:"status",    label:"Status"}
      ];
      const csv = toCSV(rows, headers);
      const blob = new Blob([csv], {type:"text/csv;charset=utf-8"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "boekingen.csv";
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    });

  }catch(err){
    console.error(err);
    tbody.innerHTML = `<tr class="placeholder"><td colspan="7" style="text-align:center;color:#b00;">Kan data niet laden (${err.message}).</td></tr>`;
  }
})();
