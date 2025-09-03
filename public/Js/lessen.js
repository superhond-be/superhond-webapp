/* lessen.js v0903s */
console.log("lessen.js geladen v0903s");

const $ = (s, r=document)=>r.querySelector(s);

async function j(url){
  const r = await fetch(url, { headers: { "cache-control":"no-cache" }});
  if(!r.ok) throw new Error(`${url} → ${r.status}`);
  return r.json();
}

function dt(iso){
  const d = new Date(iso);
  if (isNaN(d)) return iso || "—";
  const pad = n=>String(n).padStart(2,"0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function renderLessen(list){
  const tbody = $("#tbl-lessen tbody");
  if(!list?.length){
    tbody.innerHTML = `<tr><td colspan="7" class="muted">Geen lessen gevonden.</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(l => `
    <tr>
      <td>${l.naam || l.type || "—"}</td>
      <td>${l.trainer || l.trainer_naam || "—"}</td>
      <td>${l.locatie || l.locatie_naam || "—"}</td>
      <td>${dt(l.start || l.datumStart || l.datum)}</td>
      <td>${l.capaciteit ?? l.max_deelnemers ?? "—"}</td>
      <td>${l.bezet ?? 0}</td>
      <td><button class="btn" data-id="${l.id || ""}" disabled>Bewerken</button></td>
    </tr>
  `).join("");
}

(async function init(){
  try{
    let lessen = await j("/api/lessen");
    renderLessen(lessen);

    // nieuw plannen (dummy: alleen UI reset; hook later aan backend)
    $("#les-new")?.addEventListener("submit", (e)=>{
      e.preventDefault();
      alert("Opslaan is nog niet gekoppeld. (Stub)");
      e.target.reset();
    });
  }catch(err){
    console.error("Lessen laden mislukt:", err);
    const tbody = $("#tbl-lessen tbody");
    if(tbody) tbody.innerHTML = `<tr><td colspan="7" class="muted">Kon lessen niet laden.</td></tr>`;
  }
})();
