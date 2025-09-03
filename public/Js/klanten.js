/* klanten.js v0903s */
console.log("klanten.js geladen v0903s");

const $ = (s, r=document)=>r.querySelector(s);

async function j(url){
  const r = await fetch(url, { headers: { "cache-control":"no-cache" }});
  if(!r.ok) throw new Error(`${url} → ${r.status}`);
  return r.json();
}

function renderKlanten(list){
  const tbody = $("#tbl-klanten tbody");
  if(!list?.length){
    tbody.innerHTML = `<tr><td colspan="5" class="muted">Geen klanten gevonden.</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(k => `
    <tr>
      <td>${k.naam ?? "—"}</td>
      <td>${k.email ?? "—"}</td>
      <td>${k.tel ?? "—"}</td>
      <td>${Array.isArray(k.honden)? k.honden.length : (k.honden_aantal ?? "—")}</td>
      <td><button class="btn" data-id="${k.id || ""}" disabled>Bewerken</button></td>
    </tr>
  `).join("");
}

(async function init(){
  try{
    let klanten = await j("/api/klanten");

    // zoeken
    $("#klanten-search")?.addEventListener("submit", (e)=>{
      e.preventDefault();
      const q = ($("#q")?.value || "").toLowerCase().trim();
      const f = !q ? klanten : klanten.filter(k =>
        (k.naam||"").toLowerCase().includes(q) ||
        (k.email||"").toLowerCase().includes(q) ||
        (k.tel||"").toLowerCase().includes(q)
      );
      renderKlanten(f);
    });

    renderKlanten(klanten);
  }catch(err){
    console.error("Klanten laden mislukt:", err);
    const tbody = $("#tbl-klanten tbody");
    if(tbody) tbody.innerHTML = `<tr><td colspan="5" class="muted">Kon klanten niet laden.</td></tr>`;
  }
})();
