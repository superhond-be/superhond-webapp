/* public/Js/lessen-instellingen.js — v0903j */
console.log("les-instellingen JS geladen v0903j");

/* storage helpers */
const store = {
  get: (k, f = []) => { try { return JSON.parse(localStorage.getItem(k)) ?? f; } catch { return f; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};
const _uid = () => Math.random().toString(36).slice(2,10);

document.addEventListener("DOMContentLoaded", () => {
  setupLestype();
  setupThema();
  setupLocatie();
  setupTrainer();
  setupEmailTemplates();
  setupEmailRecipients();
  setupEmailSettings();
  setupEmailSubtabs();
  setupEmailAutomation();
});

/* ========== 1) LESTYPE ========== */
function setupLestype(){
  const KEY="lessonTypes";
  const form=document.getElementById("form-type");
  const tbody=document.querySelector("#table-type tbody");
  document.getElementById("reset-type")?.addEventListener("click",()=>form.reset());
  if(!form||!tbody) return;

  // migreer oude velden (actief/online) weg
  (function migrateOld(){
    const list=store.get(KEY); let c=false;
    list.forEach(r=>{ if("actief" in r){delete r.actief;c=true;} if("online" in r){delete r.online;c=true;} });
    if(c) store.set(KEY,list);
  })();

  const render=()=>{
    const rows=store.get(KEY);
    if(!rows.length){
      tbody.innerHTML=`<tr class="placeholder"><td colspan="6" style="text-align:center;color:#777;">Nog geen <strong>lestypes</strong>.</td></tr>`;
      return;
    }
    tbody.innerHTML=rows.map(r=>`
      <tr>
        <td>${r.naam??""}</td>
        <td>${r.aantal_lessen??""}</td>
        <td>${r.lesduur_min??""}</td>
        <td>${r.geldigheidsduur??""}</td>
        <td>${r.max_deelnemers??""}</td>
        <td class="t-actions">
          <button class="icon-btn edit" data-edit="${r.id}" title="Bewerken">✏️</button>
          <button class="icon-btn delete" data-del="${r.id}" title="Verwijderen">🗑️</button>
        </td>
      </tr>`).join("");
  };
  render();

  form.addEventListener("submit",e=>{
    e.preventDefault();
    const data=Object.fromEntries(new FormData(form).entries());
    if(data.max_deelnemers && Number(data.max_deelnemers)<1) return alert("Max deelnemers moet minstens 1 zijn.");
    if(data.aantal_lessen && Number(data.aantal_lessen)<1) return alert("Aantal lessen moet minstens 1 zijn.");
    if(data.lesduur_min && Number(data.lesduur_min)<1) return alert("Lesduur moet minstens 1 minuut zijn.");
    const list=store.get(KEY);
    if(!data.id){ data.id=_uid(); list.push(data); }
    else { const i=list.findIndex(x=>x.id===data.id); if(i!==-1) list[i]=data; }
    store.set(KEY,list); form.reset(); render();
  });

  tbody.addEventListener("click",e=>{
    const btn=e.target.closest("button"); if(!btn) return;
    const list=store.get(KEY);
    if(btn.dataset.edit){
      const row=list.find(x=>x.id===btn.dataset.edit); if(!row) return;
      Object.entries(row).forEach(([k,v])=>{ if(form[k]) form[k].value=v; });
    }
    if(btn.dataset.del){
      store.set(KEY,list.filter(x=>x.id!==btn.dataset.del)); render();
    }
  });
}

/* ========== 2) LES THEMA ========== */
function setupThema(){
  const KEY="lessonThemes";
  const form=document.getElementById("form-thema");
  const tbody=document.querySelector("#table-thema tbody");
  document.getElementById("reset-thema")?.addEventListener("click",()=>form.reset());
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
  };
  render();

  form.addEventListener("submit",e=>{
    e.preventDefault();
    const data=Object.fromEntries(new FormData(form).entries());
    const list=store.get(KEY);
    if(!data.id){ data.id=_uid(); list.push(data); }
    else { const i=list.findIndex(x=>x.id===data.id); if(i!==-1) list[i]=data; }
    store.set(KEY,list); form.reset(); render();
  });

  tbody.addEventListener("click",e=>{
    const btn=e.target.closest("button"); if(!btn) return;
    const list=store.get(KEY);
    if(btn.dataset.edit){
      const row=list.find(x=>x.id===btn.dataset.edit); if(!row) return;
      Object.entries(row).forEach(([k,v])=>{ if(form[k]) form[k].value=v; });
    }
    if(btn.dataset.del){
      store.set(KEY,list.filter(x=>x.id!==btn.dataset.del)); render();
    }
  });
}

/* ========== 3) LESLOCATIE ========== */
function setupLocatie(){
  const KEY="lessonLocations";
  const form=document.getElementById("form-loc");
  const tbody=document.querySelector("#table-loc tbody");
  document.getElementById("reset-loc")?.addEventListener("click",()=>form.reset());
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
  };
  render();

  form.addEventListener("submit",e=>{
    e.preventDefault();
    const data=Object.fromEntries(new FormData(form).entries());
    const list=store.get(KEY);
    if(!data.id){ data.id=_uid(); list.push(data); }
    else { const i=list.findIndex(x=>x.id===data.id); if(i!==-1) list[i]=data; }
    store.set(KEY,list); form.reset(); render();
  });

  tbody.addEventListener("click",e=>{
    const btn=e.target.closest("button"); if(!btn) return;
    const list=store.get(KEY);
    if(btn.dataset.edit){
      const row=list.find(x=>x.id===btn.dataset.edit); if(!row) return;
      ["locatie","adres","plaats","beschrijving","id"].forEach(k=>{ if(form[k]!==undefined) form[k].value=row[k]??""; });
    }
    if(btn.dataset.del){
      store.set(KEY,list.filter(x=>x.id!==btn.dataset.del)); render();
    }
    if(btn.dataset.view){
      const row=list.find(x=>x.id===btn.dataset.view); if(!row) return;
      const q=encodeURIComponent(`${row.adres||""} ${row.plaats||""}`.trim());
      if(!q) return alert("Geen adres/plaats beschikbaar.");
      window.open(`https://www.google.com/maps/search/?api=1&query=${q}`,"_blank");
    }
  });
}

/* ========== 4) LES TRAINERS ========== */
function setupTrainer(){
  const KEY="lessonTrainers";
  const form=document.getElementById("form-trainer");
  const tbody=document.querySelector("#table-trainer tbody");
  document.getElementById("reset-trainer")?.addEventListener("click",()=>form.reset());
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
  };
  render();

  form.addEventListener("submit",e=>{
    e.preventDefault();
    const data=Object.fromEntries(new FormData(form).entries());
    const list=store.get(KEY);
    if(!data.id){ data.id=_uid(); list.push(data); }
    else { const i=list.findIndex(x=>x.id===data.id); if(i!==-1) list[i]=data; }
    store.set(KEY,list); form.reset(); render();
  });

  tbody.addEventListener("click",e=>{
    const btn=e.target.closest("button"); if(!btn) return;
    const list=store.get(KEY);
    if(btn.dataset.edit){
      const row=list.find(x=>x.id===btn.dataset.edit); if(!row) return;
      Object.entries(row).forEach(([k,v])=>{ if(form[k]) form[k].value=v; });
    }
    if(btn.dataset.del){
      store.set(KEY,list.filter(x=>x.id!==btn.dataset.del)); render();
    }
  });
}

/* ========== 5a) EMAIL — Templates ========== */
/* (ongewijzigd t.o.v. v0903i – bevat demos incl. class_reminder) */
/* … laat je huidige v0903i blok hier staan … */

/* ========== 5b/5c/5d/5e EMAIL ========== */
/* (laat de bestaande v0903i functies voor ontvangers, instellingen, subtabs en automation staan) */
