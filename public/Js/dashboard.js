/* public/Js/dashboard.js v0903p */
console.log("dashboard.js geladen v0903p");

async function j(url){ const r=await fetch(url,{headers:{"cache-control":"no-cache"}}); if(!r.ok) throw new Error(`${url} → ${r.status}`); return r.json(); }
const $ = (s, r=document)=>r.querySelector(s);

function fmtDateTime(iso){
  if(!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  const pad = n => String(n).padStart(2,"0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

(async function loadDashboard(){
  try{
    const [klanten, honden, lessen, boekingen] = await Promise.all([
      j("/api/klanten"),
      j("/api/honden"),
      j("/api/lessen"),
      j("/api/boekingen"),
    ]);

    // KPI's
    $("#kpi-klanten").textContent = klanten.length;
    $("#kpi-honden").textContent = honden.length;
    const actieveLessen = lessen.filter(l => (l.status ?? "actief") === "actief");
    $("#kpi-lessen").textContent = actieveLessen.length;

    const now = new Date();
    const in7 = new Date(now.getTime() + 7*24*60*60*1000);
    const boek7 = boekingen.filter(b=>{
      const d = new Date(b.datum || b.start || b.createdAt || b.updatedAt || 0);
      return !isNaN(d) && d >= now && d <= in7;
    });
    $("#kpi-boekingen").textContent = boek7.length;

    // Eerstvolgende lessen (top 5)
    const upcoming = [...lessen]
      .map(l => ({...l, _start: new Date(l.start || l.datumStart || l.datum || 0)}))
      .filter(l => !isNaN(l._start) && l._start >= now)
      .sort((a,b)=>a._start - b._start)
      .slice(0,5);

    const tbodyL = $("#tbl-nextlessen tbody");
    if(upcoming.length===0){
      tbodyL.innerHTML = `<tr><td class="muted" colspan="5">Geen komende lessen gevonden.</td></tr>`;
    }else{
      tbodyL.innerHTML = upcoming.map(l => `
        <tr>
          <td>${l.naam || l.type || "—"}</td>
          <td>${l.trainer || l.trainer_naam || "—"}</td>
          <td>${l.locatie || l.locatie_naam || "—"}</td>
          <td>${fmtDateTime(l.start || l.datumStart || l.datum)}</td>
          <td>${(l.bezet ?? 0)}/${(l.capaciteit ?? l.max_deelnemers ?? "—")}</td>
        </tr>
      `).join("");
    }

    // Laatste boekingen (laatste 5 op creatie/datum)
    const recent = [...boekingen]
      .map(b => ({...b, _d: new Date(b.createdAt || b.datum || b.start || 0)}))
      .sort((a,b)=>b._d - a._d)
      .slice(0,5);

    const tbodyB = $("#tbl-recentbook tbody");
    if(recent.length===0){
      tbodyB.innerHTML = `<tr><td class="muted" colspan="5">Nog geen boekingen.</td></tr>`;
    }else{
      tbodyB.innerHTML = recent.map(b => `
        <tr>
          <td>${b.klant_naam || b.klant || "—"}</td>
          <td>${b.hond_naam || b.hond || "—"}</td>
          <td>${b.les_naam || b.les || "—"}</td>
          <td>${fmtDateTime(b.datum || b.start || b.createdAt)}</td>
          <td>${b.status || "—"}</td>
        </tr>
      `).join("");
    }

  }catch(err){
    console.error("Dashboard laden mislukt:", err);
    // Toon nette melding in de tabellen
    const fail = (sel, cols)=>{ const tb=$(sel); if(tb) tb.innerHTML = `<tr><td class="muted" colspan="${cols}">Kon gegevens niet laden.</td></tr>`; };
    fail("#tbl-nextlessen tbody", 5);
    fail("#tbl-recentbook tbody", 5);
  }
})();
