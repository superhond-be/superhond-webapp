/* public/Js/lessen-instellingen.js — v0903i */
console.log("les-instellingen JS geladen v0903i");

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
      tbody.innerHTML=`<tr class="placeholder"><td colspan="5" style="text-align:center;color:#777;">Nog geen <strong>lestypes</strong>.</td></tr>`;
      return;
    }
    tbody.innerHTML=rows.map(r=>`
      <tr>
        <td>${r.naam??""}</td>
        <td>${r.aantal_lessen??""}</td>
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
function setupEmailTemplates(){
  const KEY="emailTemplates";
  const groupsWrap=document.getElementById("email-groups");
  if(!groupsWrap) return;

  const inputSearch=document.getElementById("email-search");
  const selectFilter=document.getElementById("email-filter");
  const btnNew=document.getElementById("email-new");
  const btnExport=document.getElementById("email-export");
  const inputImport=document.getElementById("email-import-input");
  const modalEmail=document.getElementById("modal-email");
  const modalPreview=document.getElementById("modal-preview");
  const form=document.getElementById("form-email");
  const btnPreview=document.getElementById("email-preview");
  const previewData=document.getElementById("preview-data");
  const previewRender=document.getElementById("preview-render");

  const read=()=>store.get(KEY);
  const write=v=>store.set(KEY,v);
  const uid=()=>_uid();
  const categories=["Boeking","Administratie","Klant","Training","Overig"];
  const openModal=el=>el.classList.add("open");
  const closeModal=el=>el.classList.remove("open");
  document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>closeModal(document.getElementById(b.dataset.close))));
  [modalEmail,modalPreview].forEach(m=>m?.addEventListener("click",e=>{ if(e.target===m) closeModal(m); }));

  // demo seed incl. dog_birthday & class_reminder
  if(read().length===0){
    write([
      { id: uid(), naam:"Nieuwe booking", categorie:"Boeking",  taal:"nl",
        beschrijving:"Bevestiging nieuwe boeking", trigger:"booking_created",
        onderwerp:"Bevestiging: {{les_naam}} op {{datum}}",
        inhoud:"<p>Beste {{klant_naam}},</p><p>Je boeking voor <b>{{les_naam}}</b> op {{datum}} is geregistreerd.</p><p>Groeten,<br>Team Superhond</p>"
      },
      { id: uid(), naam:"Betalingsherinnering", categorie:"Administratie", taal:"nl",
        beschrijving:"Herinnering bij openstaande betaling", trigger:"payment_reminder",
        onderwerp:"Betalingsherinnering factuur {{factuur_nummer}}",
        inhoud:"<p>Beste {{klant_naam}},</p><p>We hebben nog geen betaling ontvangen voor factuur {{factuur_nummer}}.</p>"
      },
      { id: uid(), naam:"Verjaardag hond", categorie:"Klant", taal:"nl",
        beschrijving:"Proficiat met de verjaardag van de hond", trigger:"dog_birthday",
        onderwerp:"🎉 Proficiat met {{hond_naam}}’s verjaardag!",
        inhoud:"<p>Beste {{klant_naam}},</p><p>{{hond_naam}} is jarig op {{geboortedatum}} — van harte proficiat! 🎂</p><p>Een extra knuffel van het Superhond-team 🐾</p>"
      },
      { id: uid(), naam:"Lesherinnering (morgen)", categorie:"Training", taal:"nl",
        beschrijving:"Herinnering voor de les (1-3 dagen op voorhand)", trigger:"class_reminder",
        onderwerp:"Herinnering: {{les_naam}} op {{datum}} om {{starttijd}}",
        inhoud:"<p>Beste {{klant_naam}},</p><p>Dit is een herinnering voor <b>{{les_naam}}</b> op {{datum}} om {{starttijd}} in {{locatie}}.</p><p>Tot dan!<br>Team Superhond</p>"
      }
    ]);
  }

  const escapeHtml=s=>(s||"").replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const renderTemplate=(src,data)=>(src||"").replace(/\{\{\s*([\w.]+)\s*\}\}/g,(_,k)=> (k in data)? String(data[k]) : "");

  function render(){
    const q=(inputSearch?.value||"").toLowerCase();
    const cat=(selectFilter?.value||"");
    const list=read().filter(t=>{
      const matchQ=!q||[t.naam,t.onderwerp,t.beschrijving].some(v=>(v||"").toLowerCase().includes(q));
      const matchC=!cat||t.categorie===cat;
      return matchQ&&matchC;
    });
    if(!list.length){ groupsWrap.innerHTML=`<p style="color:#777">Geen templates gevonden.</p>`; return; }
    const byCat={}; list.forEach(t=>{ const c=t.categorie||"Overig"; (byCat[c] ||= []).push(t); });
    groupsWrap.innerHTML=Object.keys(byCat).sort((a,b)=>categories.indexOf(a)-categories.indexOf(b))
      .map(catName=>{
        const cards=byCat[catName].sort((a,b)=>a.naam.localeCompare(b.naam)).map(t=>`
          <div class="card-mini">
            <h4>${escapeHtml(t.naam)}</h4>
            <p>${escapeHtml(t.beschrijving||"")}</p>
            <div class="row-actions">
              <button class="icon-btn" data-act="edit" data-id="${t.id}" title="Bewerken">✏️</button>
              <button class="icon-btn" data-act="dup"  data-id="${t.id}" title="Dupliceren">📄</button>
              <button class="icon-btn" data-act="prev" data-id="${t.id}" title="Voorbeeld">👁️</button>
              <button class="icon-btn delete" data-act="del"  data-id="${t.id}" title="Verwijderen">🗑️</button>
            </div>
          </div>`).join("");
        return `<h3 style="margin:18px 0 8px">${catName} templates</h3><div class="cards">${cards}</div>`;
      }).join("");
  }
  render();

  btnNew?.addEventListener("click",()=>{ form.reset(); form.id.value=""; form.categorie.value="Boeking"; form.taal.value="nl"; document.getElementById("modal-email-title").textContent="Nieuw e-mailsjabloon"; openModal(modalEmail); });

  form?.addEventListener("submit",e=>{
    e.preventDefault();
    const data=Object.fromEntries(new FormData(form).entries());
    if(!data.naam || !data.onderwerp || !data.inhoud){ alert("Naam, onderwerp en inhoud zijn verplicht."); return; }
    const list=read();
    if(!data.id){ data.id=_uid(); list.push(data); }
    else { const i=list.findIndex(x=>x.id===data.id); if(i!==-1) list[i]=data; }
    write(list); closeModal(modalEmail); render();
  });

  btnPreview?.addEventListener("click",()=>{
    try{
      const data=Object.fromEntries(new FormData(form).entries());
      const sample=previewData.value.trim()?JSON.parse(previewData.value):{};
      const html=renderTemplate(data.inhoud,sample);
      const subj=renderTemplate(data.onderwerp,sample);
      previewRender.innerHTML=`<div style="font-weight:600;margin-bottom:8px">Onderwerp:</div>${escapeHtml(subj)}<hr>${html}`;
      openModal(modalPreview);
    }catch{ alert("Ongeldige JSON in voorbeeld-waarden."); }
  });

  groupsWrap.addEventListener("click",e=>{
    const btn=e.target.closest("button[data-act]"); if(!btn) return;
    const id=btn.dataset.id; const list=read(); const row=list.find(x=>x.id===id); if(!row) return;
    if(btn.dataset.act==="edit"){ form.reset(); Object.entries(row).forEach(([k,v])=>{ if(form[k]!==undefined) form[k].value=v; }); document.getElementById("modal-email-title").textContent="Template bewerken"; openModal(modalEmail); }
    if(btn.dataset.act==="dup"){ const copy={...row,id:_uid(),naam:row.naam+" (kopie)"}; write([...list,copy]); render(); }
    if(btn.dataset.act==="prev"){
      previewData.value = previewData.value.trim() || '{"klant_naam":"Eva","hond_naam":"Bowie","datum":"ma 7 okt"}';
      const s=JSON.parse(previewData.value||"{}");
      const html=renderTemplate(row.inhoud,s);
      const subj=renderTemplate(row.onderwerp,s);
      previewRender.innerHTML=`<div style="font-weight:600;margin-bottom:8px">Onderwerp:</div>${escapeHtml(subj)}<hr>${html}`;
      openModal(modalPreview);
    }
    if(btn.dataset.act==="del"){ if(confirm(`Template “${row.naam}” verwijderen?`)){ write(list.filter(x=>x.id!==id)); render(); } }
  });

  btnExport?.addEventListener("click",()=>{
    const blob=new Blob([JSON.stringify(read(),null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download="email-templates.json"; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  });

  inputImport?.addEventListener("change",async e=>{
    const f=e.target.files?.[0]; if(!f) return;
    try{
      const text=await f.text(); const json=JSON.parse(text);
      if(!Array.isArray(json)) throw new Error("JSON moet een array zijn");
      const cur=read();
      json.forEach(t=>{ if(!t.id) t.id=_uid(); const i=cur.findIndex(x=>x.naam===t.naam && x.categorie===t.categorie); if(i===-1) cur.push(t); else cur[i]=t; });
      write(cur); render(); alert("Templates geïmporteerd.");
    }catch(err){ alert("Import mislukt: "+err.message); }
    finally{ e.target.value=""; }
  });
}

/* ========== 5b) EMAIL — Ontvangers ========== */
function setupEmailRecipients(){
  const KEY="emailRecipients";
  const form=document.getElementById("form-recipient");
  const tbody=document.querySelector("#table-recipients tbody");
  const btnNew=document.getElementById("recipient-new");
  const btnExport=document.getElementById("recipient-export");
  const inputImport=document.getElementById("recipient-import");
  if(!form||!tbody) return;

  const read=()=>store.get(KEY);
  const write=v=>store.set(KEY,v);

  const render=()=>{
    const rows=read();
    if(!rows.length){
      tbody.innerHTML=`<tr class="placeholder"><td colspan="5" style="text-align:center;color:#777;">Nog geen ontvangers.</td></tr>`;
      return;
    }
    tbody.innerHTML=rows.map(r=>`
      <tr>
        <td>${r.naam??""}</td>
        <td>${r.email??""}</td>
        <td>${r.rol??""}</td>
        <td>${r.actief?"Ja":"Nee"}</td>
        <td class="t-actions">
          <button class="icon-btn edit" data-edit="${r.id}" title="Bewerken">✏️</button>
          <button class="icon-btn delete" data-del="${r.id}" title="Verwijderen">🗑️</button>
        </td>
      </tr>`).join("");
  };
  render();

  btnNew?.addEventListener("click",()=>form.reset());

  form.addEventListener("submit",e=>{
    e.preventDefault();
    const fd=new FormData(form); const data=Object.fromEntries(fd.entries());
    data.actief = form.actief.checked;
    if(!data.email) return alert("E-mail is verplicht.");
    const list=read();
    if(!data.id){ data.id=_uid(); list.push(data); }
    else { const i=list.findIndex(x=>x.id===data.id); if(i!==-1) list[i]=data; }
    write(list); form.reset(); render();
  });

  tbody.addEventListener("click",e=>{
    const btn=e.target.closest("button"); if(!btn) return;
    const list=read();
    if(btn.dataset.edit){
      const row=list.find(x=>x.id===btn.dataset.edit); if(!row) return;
      form.reset();
      Object.entries(row).forEach(([k,v])=>{
        if(k==="actief") form.actief.checked=!!v;
        else if(form[k]) form[k].value=v;
      });
    }
    if(btn.dataset.del){
      write(list.filter(x=>x.id!==btn.dataset.del)); render();
    }
  });

  btnExport?.addEventListener("click",()=>{
    const blob=new Blob([JSON.stringify(read(),null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download="email-recipients.json";
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  });

  inputImport?.addEventListener("change",async e=>{
    const f=e.target.files?.[0]; if(!f) return;
    try{
      const txt=await f.text(); const arr=JSON.parse(txt);
      if(!Array.isArray(arr)) throw new Error("JSON moet een array zijn");
      const cur=read();
      arr.forEach(r=>{ if(!r.id) r.id=_uid(); const i=cur.findIndex(x=>x.email===r.email); if(i===-1) cur.push(r); else cur[i]=r; });
      write(cur); render(); alert("Ontvangers geïmporteerd.");
    }catch(err){ alert("Import mislukt: "+err.message); }
    finally{ e.target.value=""; }
  });
}

/* ========== 5c) EMAIL — Instellingen ========== */
function setupEmailSettings(){
  const KEY="emailSettings";
  const form=document.getElementById("form-email-settings");
  const btnReset=document.getElementById("email-settings-reset");
  const btnExport=document.getElementById("email-settings-export");
  const inputImport=document.getElementById("email-settings-import");
  if(!form) return;

  const read=()=>store.get(KEY,{});
  const write=v=>store.set(KEY,v);

  function load(){
    const s=read();
    ["fromName","fromEmail","replyTo","bcc","signature"].forEach(k=>{ if(form[k]) form[k].value=s[k]??""; });
  }
  load();

  form.addEventListener("submit",e=>{
    e.preventDefault();
    const data=Object.fromEntries(new FormData(form).entries());
    write(data);
    alert("E-mailinstellingen opgeslagen.");
  });

  btnReset?.addEventListener("click",()=>{ write({}); load(); });

  btnExport?.addEventListener("click",()=>{
    const blob=new Blob([JSON.stringify(read(),null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download="email-settings.json";
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  });

  inputImport?.addEventListener("change",async e=>{
    const f=e.target.files?.[0]; if(!f) return;
    try{
      const txt=await f.text(); const obj=JSON.parse(txt);
      if(typeof obj!=="object"||Array.isArray(obj)) throw new Error("JSON moet een object zijn");
      write(obj); load(); alert("Instellingen geïmporteerd.");
    }catch(err){ alert("Import mislukt: "+err.message); }
    finally{ e.target.value=""; }
  });
}

/* ========== 5d) EMAIL — Subtabs wisselen ========== */
function setupEmailSubtabs(){
  const links=[...document.querySelectorAll('[data-email-tab]')];
  const sections=[...document.querySelectorAll('.email-tab')];
  if(!links.length) return;
  links.forEach(a=>{
    a.addEventListener("click",e=>{
      e.preventDefault();
      links.forEach(x=>x.classList.remove("active"));
      a.classList.add("active");
      const key=a.dataset.emailTab; // templates | recipients | settings | automation
      sections.forEach(s=>{
        const on = s.id === `email-tab-${key}`;
        s.style.display = on ? "" : "none";
        s.classList.toggle("active", on);
      });
    });
  });
}

/* ========== 5e) EMAIL — Automatisch (verjaardag + lesherinnering) ========== */
function setupEmailAutomation(){
  /* --- Verjaardag hond --- */
  const tblBody = document.querySelector("#table-auto-bday tbody");
  const selWhen = document.getElementById("auto-bday-when");
  const btnScan = document.getElementById("auto-bday-scan");
  const taJSON  = document.getElementById("auto-dogs-json");
  const btnUsePasted  = document.getElementById("auto-use-pasted");
  const btnUseStorage = document.getElementById("auto-use-storage");
  if (!tblBody || !btnScan) return;

  let dogsCache = [];

  const parseDate = s => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s||"").trim());
    if (!m) return null;
    const d = new Date(Number(m[1]), Number(m[2])-1, Number(m[3]));
    return isNaN(d) ? null : d;
  };

  function loadFromStorage(){
    let arr = JSON.parse(localStorage.getItem("dogs")||"null")
           || JSON.parse(localStorage.getItem("honden")||"null")
           || [];
    dogsCache = arr.map(x => ({
      hond_naam: x.hond_naam || x.naam || x.dog_name || "",
      geboortedatum: x.geboortedatum || x.birthdate || x.geboorte || "",
      klant_naam: x.klant_naam || x.owner_name || x.klant || "",
      email: x.email || x.owner_email || x.klant_email || ""
    })).filter(x => x.hond_naam && x.geboortedatum && x.email);
  }
  function loadFromTextarea(){
    try{ const arr = JSON.parse(taJSON.value||"[]"); dogsCache = Array.isArray(arr)?arr:[]; }
    catch{ alert("Ongeldige JSON in het invoerveld."); }
  }

  btnUseStorage?.addEventListener("click", (e)=>{ e.preventDefault(); loadFromStorage(); alert(`Ingelezen honden: ${dogsCache.length}`); });
  btnUsePasted ?.addEventListener("click", (e)=>{ e.preventDefault(); loadFromTextarea(); alert(`Ingelezen honden (ingeplakt): ${dogsCache.length}`); });

  function findBirthdays(daysAhead){
    const today = new Date();
    const within7 = Number(daysAhead) === 7;
    return dogsCache.filter(d => {
      const bd = parseDate(d.geboortedatum); if (!bd) return false;
      if (within7){
        for (let k=0;k<7;k++){
          const t = new Date(today); t.setDate(today.getDate()+k);
          if (t.getMonth()===bd.getMonth() && t.getDate()===bd.getDate()) return true;
        }
        return false;
      }else{
        const target = new Date(today); target.setDate(today.getDate()+Number(daysAhead||0));
        return (bd.getMonth()===target.getMonth() && bd.getDate()===target.getDate());
      }
    });
  }

  function getBirthdayTemplate(){
    const list = store.get("emailTemplates");
    return list.find(t => t.trigger === "dog_birthday");
  }
  function renderTemplate(src, data){
    return (src||"").replace(/\{\{\s*([\w.]+)\s*\}\}/g,(_,k)=> (k in data)? String(data[k]) : "");
  }

  function renderRows(items){
    if (!items.length){
      tblBody.innerHTML = `<tr class="placeholder"><td colspan="5" style="text-align:center;color:#777;">Geen verjaardagen gevonden.</td></tr>`;
      return;
    }
    const tpl = getBirthdayTemplate();
    tblBody.innerHTML = items.map(d => {
      const datumTekst = parseDate(d.geboortedatum) ? d.geboortedatum : "";
      let mailBtn = `<span style="color:#999">Geen template met trigger <code>dog_birthday</code></span>`;
      if (tpl){
        const subj = encodeURIComponent(renderTemplate(tpl.onderwerp, {
          klant_naam: d.klant_naam, hond_naam: d.hond_naam, geboortedatum: datumTekst
        }));
        const body = encodeURIComponent(
          renderTemplate(tpl.inhoud, {
            klant_naam: d.klant_naam, hond_naam: d.hond_naam, geboortedatum: datumTekst
          }).replace(/<br\s*\/?>/gi,"\n").replace(/<[^>]+>/g,"")
        );
        mailBtn = `<a class="btn" href="mailto:${encodeURIComponent(d.email)}?subject=${subj}&body=${body}">Maak e-mail</a>`;
      }
      return `<tr>
        <td>${d.hond_naam||""}</td>
        <td>${datumTekst}</td>
        <td>${d.klant_naam||""}</td>
        <td>${d.email||""}</td>
        <td>${mailBtn}</td>
      </tr>`;
    }).join("");
  }

  btnScan.addEventListener("click", (e)=>{
    e.preventDefault();
    if (!dogsCache.length) loadFromStorage(); // probeer automatisch
    const items = findBirthdays(selWhen.value);
    renderRows(items);
  });

  /* --- Lesherinnering --- */
  const tblClassBody = document.querySelector("#table-auto-class tbody");
  const selClassWhen = document.getElementById("auto-class-when");
  const btnClassScan = document.getElementById("auto-class-scan");
  const taClasses    = document.getElementById("auto-classes-json");
  const btnClassesUsePasted  = document.getElementById("auto-classes-use-pasted");
  const btnClassesUseStorage = document.getElementById("auto-classes-use-storage");

  let classCache = [];

  function loadClassesFromStorage(){
    let arr = JSON.parse(localStorage.getItem("classBookings")||"null")
           || JSON.parse(localStorage.getItem("lessenBookings")||"null")
           || [];
    classCache = arr.map(x=>({
      klant_naam: x.klant_naam || x.klant || x.owner_name || "",
      email     : x.email || x.klant_email || "",
      les_naam  : x.les_naam || x.lesson || x.name || "",
      datum     : x.datum || x.date || "",
      starttijd : x.starttijd || x.time || "",
      locatie   : x.locatie || x.location || ""
    })).filter(x => x.email && x.klant_naam && x.les_naam && x.datum);
  }
  function loadClassesFromTextarea(){
    try{
      const arr = JSON.parse(taClasses.value||"[]");
      classCache = Array.isArray(arr) ? arr : [];
    }catch{ alert("Ongeldige JSON bij lesboekingen."); }
  }
  function findClassesDaysAhead(daysAhead){
    const today = new Date();
    const target = new Date(today);
    target.setDate(today.getDate() + Number(daysAhead||1));
    const tm = target.getFullYear()+'-'+String(target.getMonth()+1).padStart(2,'0')+'-'+String(target.getDate()).padStart(2,'0');
    return classCache.filter(x => String(x.datum).startsWith(tm));
  }
  function getClassReminderTemplate(){
    const list = store.get("emailTemplates");
    return list.find(t => t.trigger === "class_reminder");
  }
  function renderClassRows(items){
    if(!tblClassBody) return;
    if(!items.length){
      tblClassBody.innerHTML = `<tr class="placeholder"><td colspan="7" style="text-align:center;color:#777;">Geen lessen gevonden.</td></tr>`;
      return;
    }
    const tpl = getClassReminderTemplate();
    tblClassBody.innerHTML = items.map(it=>{
      let mailBtn = `<span style="color:#999">Geen template met trigger <code>class_reminder</code></span>`;
      if(tpl){
        const subj = encodeURIComponent((tpl.onderwerp||"")
          .replace(/\{\{\s*klant_naam\s*\}\}/g,it.klant_naam||"")
          .replace(/\{\{\s*les_naam\s*\}\}/g,it.les_naam||"")
          .replace(/\{\{\s*datum\s*\}\}/g,it.datum||"")
          .replace(/\{\{\s*starttijd\s*\}\}/g,it.starttijd||"")
          .replace(/\{\{\s*locatie\s*\}\}/g,it.locatie||"")
        );
        const bodyHtml = (tpl.inhoud||"")
          .replace(/\{\{\s*klant_naam\s*\}\}/g,it.klant_naam||"")
          .replace(/\{\{\s*les_naam\s*\}\}/g,it.les_naam||"")
          .replace(/\{\{\s*datum\s*\}\}/g,it.datum||"")
          .replace(/\{\{\s*starttijd\s*\}\}/g,it.starttijd||"")
          .replace(/\{\{\s*locatie\s*\}\}/g,it.locatie||"");
        const bodyTxt = bodyHtml.replace(/<br\s*\/?>/gi,"\n").replace(/<[^>]+>/g,"");
        mailBtn = `<a class="btn" href="mailto:${encodeURIComponent(it.email)}?subject=${subj}&body=${encodeURIComponent(bodyTxt)}">Maak e-mail</a>`;
      }
      return `<tr>
        <td>${it.klant_naam||""}</td>
        <td>${it.email||""}</td>
        <td>${it.les_naam||""}</td>
        <td>${it.datum||""}</td>
        <td>${it.starttijd||""}</td>
        <td>${it.locatie||""}</td>
        <td>${mailBtn}</td>
      </tr>`;
    }).join("");
  }

  btnClassesUseStorage?.addEventListener("click",(e)=>{ e.preventDefault(); loadClassesFromStorage(); alert(`Ingelezen boekingen: ${classCache.length}`); });
  btnClassesUsePasted ?.addEventListener("click",(e)=>{ e.preventDefault(); loadClassesFromTextarea(); alert(`Ingelezen boekingen (ingeplakt): ${classCache.length}`); });
  btnClassScan?.addEventListener("click",(e)=>{
    e.preventDefault();
    if(!classCache.length) loadClassesFromStorage(); // probeer opslag als cache leeg
    const items = findClassesDaysAhead(selClassWhen.value);
    renderClassRows(items);
  });
}
