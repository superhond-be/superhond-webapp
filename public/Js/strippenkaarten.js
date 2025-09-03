/* strippenkaarten.js v0903s */
console.log("strippenkaarten.js geladen v0903s");

const $ = (s, r=document)=>r.querySelector(s);

async function j(url){
  const r = await fetch(url, { headers: { "cache-control":"no-cache" }});
  if(!r.ok) throw new Error(`${url} → ${r.status}`);
  return r.json();
}

function renderKaarten(list){
  const tbody = $("#tbl-kaarten tbody");
  if(!list?.length){
    tbody.innerHTML = `<tr><td colspan="5" class="muted">Geen strippenkaarten gevonden.</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(k => `
    <tr>
      <td>${k.naam || "—"}</td>
      <td>${k.aantal ?? "—"}</td>
      <td>${k.geldigheid ?? k.geldigheid_m ?? "—"}</td>
      <td>${k.opm || k.opmerking || "—"}</td>
      <td><button class="btn" data-id="${k.id || ""}" disabled>Bewerken</button></td>
    </tr>
  `).join("");
}

(async function init(){
  try{
    // Heb je nog geen endpoint? Maak er evt. één: /api/strippenkaarten
    let kaarten = [];
    try { kaarten = await j("/api/strippenkaarten"); }
    catch { console.warn("Geen /api/strippenkaarten endpoint (nog). Toon lege lijst."); }

    // Nieuw kaart-form (UI-side; koppel later aan backend)
    $("#kaart-new")?.addEventListener("submit", (e)=>{
      e.preventDefault();
      alert("Opslaan is nog niet gekoppeld. (Stub)");
      e.target.reset();
    });

    renderKaarten(kaarten);
  }catch(err){
    console.error("Strippenkaarten laden mislukt:", err);
    const tbody = $("#tbl-kaarten tbody");
    if(tbody) tbody.innerHTML = `<tr><td colspan="5" class="muted">Kon strippenkaarten niet laden.</td></tr>`;
  }
})();
