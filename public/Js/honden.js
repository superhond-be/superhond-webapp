/* honden.js v0903s */
console.log("honden.js geladen v0903s");

const $ = (s, r=document)=>r.querySelector(s);

async function j(url){
  const r = await fetch(url, { headers: { "cache-control":"no-cache" }});
  if(!r.ok) throw new Error(`${url} → ${r.status}`);
  return r.json();
}

function renderHonden(list){
  const tbody = $("#tbl-honden tbody");
  if(!list?.length){
    tbody.innerHTML = `<tr><td colspan="5" class="muted">Geen honden gevonden.</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(h => `
    <tr>
      <td>${h.hond_naam || h.naam || "—"}</td>
      <td>${h.ras || "—"}</td>
      <td>${h.klant_naam || h.klant || "—"}</td>
      <td>${h.geboortedatum || h.dob || "—"}</td>
      <td><button class="btn" data-id="${h.id || ""}" disabled>Bewerken</button></td>
    </tr>
  `).join("");
}

(async function init(){
  try{
    let honden = await j("/api/honden");

    // eenvoudige zoek + (optioneel) themafilter
    $("#honden-search")?.addEventListener("submit", (e)=>{
      e.preventDefault();
      const q = ($("#q")?.value || "").toLowerCase().trim();
      const thema = $("#filter-thema")?.value || "";
      let out = honden;
      if(q){
        out = out.filter(h =>
          (h.hond_naam||h.naam||"").toLowerCase().includes(q) ||
          (h.klant_naam||h.klant||"").toLowerCase().includes(q) ||
          (h.chip||"").toLowerCase().includes(q)
        );
      }
      if(thema){
        out = out.filter(h => (h.thema||"").toLowerCase() === thema.toLowerCase());
      }
      renderHonden(out);
    });

    renderHonden(honden);
  }catch(err){
    console.error("Honden laden mislukt:", err);
    const tbody = $("#tbl-honden tbody");
    if(tbody) tbody.innerHTML = `<tr><td colspan="5" class="muted">Kon honden niet laden.</td></tr>`;
  }
})();
