/* boekingen.js v0903s */
console.log("boekingen.js geladen v0903s");

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

function renderBoekingen(list){
  const tbody = $("#tbl-book tbody");
  if(!list?.length){
    tbody.innerHTML = `<tr><td colspan="6" class="muted">Geen boekingen gevonden.</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(b => `
    <tr>
      <td>${dt(b.datum || b.start || b.createdAt)}</td>
      <td>${b.klant_naam || b.klant || "—"}</td>
      <td>${b.hond_naam || b.hond || "—"}</td>
      <td>${b.les_naam || b.les || "—"}</td>
      <td>${b.status || "—"}</td>
      <td><button class="btn" data-id="${b.id || ""}" disabled>Bewerken</button></td>
    </tr>
  `).join("");
}

(async function init(){
  try{
    let boekingen = await j("/api/boekingen");

    // zoek/filter
    $("#book-search")?.addEventListener("submit",(e)=>{
      e.preventDefault();
      const q = ($("#q")?.value||"").toLowerCase().trim();
      const st = $("#filter-status")?.value || "";
      let out = boekingen;

      if(q){
        out = out.filter(b =>
          (b.klant_naam||b.klant||"").toLowerCase().includes(q) ||
          (b.hond_naam||b.hond||"").toLowerCase().includes(q) ||
          (b.les_naam||b.les||"").toLowerCase().includes(q)
        );
      }
      if(st){
        out = out.filter(b => (b.status||"").toLowerCase() === st.toLowerCase());
      }
      renderBoekingen(out);
    });

    renderBoekingen(boekingen);
  }catch(err){
    console.error("Boekingen laden mislukt:", err);
    const tbody = $("#tbl-book tbody");
    if(tbody) tbody.innerHTML = `<tr><td colspan="6" class="muted">Kon boekingen niet laden.</td></tr>`;
  }
})();
