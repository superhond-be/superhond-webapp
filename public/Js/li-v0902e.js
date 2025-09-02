// v0902e — test JS voor Les instellingen (los van oude bestanden)
alert("JS geladen: v0902e"); // duidelijk signaal dat dit bestand actief is
console.log("li-v0902e.js actief");

const store = {
  get: (k, f=[]) => { try { return JSON.parse(localStorage.getItem(k)) ?? f; } catch { return f; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};
const uid = () => Math.random().toString(36).slice(2,10);

document.addEventListener("DOMContentLoaded", () => {
  setupType();
  setupThema();
  setupLoc();
  setupTrainer();
});

/* --- Lestype --- */
function setupType(){
  const KEY="lessonTypes";
  const form=document.getElementById("form-type");
  const tbody=document.querySelector("#table-type tbody");
  document.getElementById("reset-type")?.addEventListener("click", ()=>form.reset());
  if(!form||!tbody) return;

  const render=()=>{
    const rows=store.get(KEY);
    if(!rows.length){
      tbody.innerHTML = `<tr class="placeholder"><td colspan="7" style="text-align:center;color:#777;">
        Nog geen <strong>lestypes</strong>. Vul het formulier in en klik <em>Opslaan</em>.
      </td></tr>`;
      return;
    }
    tbody.innerHTML = rows.map(r=>`
      <tr>
        <td>${r.naam??""}</td>
        <td>${r.aantal_lessen??""}</td>
        <td>${r.geldigheidsduur??""}</td>
        <td>${r.max_deelnemers??""}</td>
        <td>${r.actief==="J"?"Ja":"Nee"}</td>
        <td>${r.online==="J"?"Ja":"Nee"}</td>
        <td class="t-actions">
          <button class="icon-btn edit" data-edit="${r.id}" title="Bewerken">✏️</button>
          <button class="icon-btn delete" data-del="${r.id}" title="Verwijderen">🗑️</button>
        </td>
      </tr>`).join("");
  }; render();

  form.addEventListener("submit",e=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const list = store.get(KEY);
    if(!data.id){ data.id=uid(); list.push(data); }
    else { const i=list.findIndex(x=>x.id===data.id); if(i!==-1) list[i]=data; }
    store.set(KEY,list); form.reset(); render();
  });

  tbody.addEventListener("click",e=>{
    const btn=e.target.closest("button"); if(!btn) return;
    const list=store.get(KEY);
    const editId=btn.dataset.edit, delId=btn.dataset.del;
    if(editId){ const row=list.find(x=>x.id===editId); if(!row) return;
      Object.entries(row).forEach(([k,v])=>{ if(form[k]) form[k].value=v; });
      if(row.actief) [...form.actief].forEach(r=>r.checked=r.value===row.actief);
      if(row.online) [...form.online].forEach(r=>r.checked=r.value===row.online);
    }
    if(delId){ store.set(KEY,list.filter(x=>x.id!==delId)); render(); }
  });
}

/* --- Thema --- */
function setupThema(){
  const KEY="lessonThemes";
  const form=document.getElementById("form-thema");
  const tbody=document.querySelector("#table-thema tbody");
  document.getElementById("reset-thema")?.addEventListener("click", ()=>form.reset());
  if(!form||!tbody) return;

  const render=()=>{
    const rows=store.get(KEY);
    if(!rows.length){
      tbody.innerHTML=`<tr class="placeholder"><td colspan="3" style="text-align:center;color:#777;">Nog geen <strong>les thema’s</strong>.</td></tr>`;
      return;
    }
    tbody.innerHTML=rows.map(r=>`
      <tr>
        <td>${r.naam??""}</td>
        <td>${r.beschrijving??""}</td>
        <td class="t-actions">
          <button class="icon-btn edit" data-edit="${r.id}" title="Bewerken">✏️</button>
          <button class="icon-btn delete" data-del="${r.id}" title="Verwijderen">🗑️</button>
        </td>
      </tr>`).join("");
  }; render();

  form.addEventListener("submit",e=>{
    e.preventDefault();
    const data=Object.fromEntries(new FormData(form).entries());
    const list=store.get(KEY);
    if(!data.id){ data.id=uid(); list.push(data); }
    else { const i=list.findIndex(x=>x.id===data.id); if(i!==-1) list[i]=data; }
    store.set(KEY,list); form.reset(); render();
  });

  tbody.addEventListener("click",e=>{
    const btn=e.target.closest("button"); if(!btn) return;
    const list=store.get(KEY); const editId=btn.dataset.edit, delId=btn.dataset.del;
    if(editId){ const row=list.find(x=>x.id===editId); if(!row) return;
      Object.entries(row).forEach(([k,v])=>{ if(form[k]) form[k].value=v; });
    }
    if(delId){ store.set(KEY,list.filter(x=>x.id!==delId)); render(); }
  });
}

/* --- Locatie --- */
function setupLoc(){
  const KEY="lessonLocations";
  const form=document.getElementById("form-loc");
  const tbody=document.querySelector("#table-loc tbody");
  document.getElementById("reset-loc")?.addEventListener("click", ()=>form.reset());
  if(!form||!tbody) return;

  const render=()=>{
    const rows=store.get(KEY);
    if(!rows.length){
      tbody.innerHTML=`<tr class="placeholder"><td colspan="5" style="text-align:center;color:#777;">Nog geen <strong>leslocaties</strong>.</td></tr>`;
      return;
    }
    tbody.innerHTML=rows.map(r=>`
      <tr>
        <td>${r.locatie??""}</td>
        <td>${r.adres??""}</td>
        <td>${r.plaats??""}</td>
        <td>${r.beschrijving??""}</td>
        <td class="t-actions">
          <button class="icon-btn edit" data-edit="${r.id}" title="Bewerken">✏️</button>
          <button class="icon-btn delete" data-del="${r.id}" title="Verwijderen">🗑️</button>
          <button class="icon-btn view"  data-view="${r.id}" title="Bekijk locatie">📍</button>
        </td>
      </tr>`).join("");
  }; render();

  form.addEventListener("submit",e=>{
    e.preventDefault();
    const data=Object.fromEntries(new FormData(form).entries());
    const list=store.get(KEY);
    if(!data.id){ data.id=uid(); list.push(data); }
    else { const i=list.findIndex(x=>x.id===data.id); if(i!==-1) list[i]=data; }
    store.set(KEY,list); form.reset(); render();
  });

  tbody.addEventListener("click",e=>{
    const btn=e.target.closest("button"); if(!btn) return;
    const list=store.get(KEY);
    const editId=btn.dataset.edit, delId=btn.dataset.del, viewId=btn.dataset.view;

    if(editId){
      const row=list.find(x=>x.id===editId); if(!row) return;
      ["locatie","adres","plaats","beschrijving","id"].forEach(k=>{ if(form[k]!==undefined) form[k].value=row[k]??""; });
    }
    if(delId){ store.set(KEY,list.filter(x=>x.id!==delId)); render(); }
    if(viewId){
      const row=list.find(x=>x.id===viewId); if(!row) return;
      const q=encodeURIComponent(`${row.adres||""} ${row.plaats||""}`.trim());
      if(!q){ alert("Geen adres/plaats beschikbaar."); return; }
      window.open(`https://www.google.com/maps/search/?api=1&query=${q}`,"_blank");
    }
  });
}

/* --- Trainers --- */
function setupTrainer(){
  const KEY="lessonTrainers";
  const form=document.getElementById("form-trainer");
  const tbody=document.querySelector("#table-trainer tbody");
  document.getElementById("reset-trainer")?.addEventListener("click", ()=>form.reset());
  if(!form||!tbody) return;

  const render=()=>{
    const rows=store.get(KEY);
    if(!rows.length){
      tbody.innerHTML=`<tr class="placeholder"><td colspan="3" style="text-align:center;color:#777;">Nog geen <strong>les trainers</strong>.</td></tr>`;
      return;
    }
    tbody.innerHTML=rows.map(r=>`
      <tr>
        <td>${r.naam??""}</td>
        <td>${r.functie??""}</td>
        <td class="t-actions">
          <button class="icon-btn edit" data-edit="${r.id}" title="Bewerken">✏️</button>
          <button class="icon-btn delete" data-del="${r.id}" title="Verwijderen">🗑️</button>
        </td>
      </tr>`).join("");
  }; render();

  form.addEventListener("submit",e=>{
    e.preventDefault();
    const data=Object.fromEntries(new FormData(form).entries());
    const list=store.get(KEY);
    if(!data.id){ data.id=uid(); list.push(data); }
    else { const i=list.findIndex(x=>x.id===data.id); if(i!==-1) list[i]=data; }
    store.set(KEY,list); form.reset(); render();
  });

  tbody.addEventListener("click",e=>{
    const btn=e.target.closest("button"); if(!btn) return;
    const list=store.get(KEY); const editId=btn.dataset.edit, delId=btn.dataset.del;
    if(editId){ const row=list.find(x=>x.id===editId); if(!row) return;
      Object.entries(row).forEach(([k,v])=>{ if(form[k]) form[k].value=v; });
    }
    if(delId){ store.set(KEY,list.filter(x=>x.id!==delId)); render(); }
  });
}
