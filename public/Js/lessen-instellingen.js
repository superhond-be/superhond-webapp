/* public/Js/lessen-instellingen.js — v0903f */
console.log("les-instellingen JS geladen v0903f");

/* Helpers */
const store = {
  get: (k, f = []) => { try { return JSON.parse(localStorage.getItem(k)) ?? f; } catch { return f; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};
const _uid = () => Math.random().toString(36).slice(2, 10);

document.addEventListener("DOMContentLoaded", () => {
  setupLestype();
  setupThema();
  setupLocatie();
  setupTrainer();
  setupEmailTemplates(); // nieuw
});

/* ===== 1) LESTYPE (zonder Actief/Online) ===== */
function setupLestype() {
  const KEY = "lessonTypes";
  const form = document.getElementById("form-type");
  const tbody = document.querySelector("#table-type tbody");
  document.getElementById("reset-type")?.addEventListener("click", () => form.reset());
  if (!form || !tbody) return;

  // migreer oude velden weg
  (function migrateOld(){
    const list = store.get(KEY); let changed=false;
    list.forEach(r => { if ("actief" in r) { delete r.actief; changed=true; } if ("online" in r) { delete r.online; changed=true; }});
    if (changed) store.set(KEY, list);
  })();

  const render = () => {
    const rows = store.get(KEY);
    if (!rows.length) {
      tbody.innerHTML = `<tr class="placeholder"><td colspan="5" style="text-align:center;color:#777;">
        Nog geen <strong>lestypes</strong>. Vul het formulier in en klik <em>Opslaan</em>.
      </td></tr>`;
      return;
    }
    tbody.innerHTML = rows.map(r => `
      <tr>
        <td>${r.naam ?? ""}</td>
        <td>${r.aantal_lessen ?? ""}</td>
        <td>${r.geldigheidsduur ?? ""}</td>
        <td>${r.max_deelnemers ?? ""}</td>
        <td class="t-actions">
          <button class="icon-btn edit" title="Bewerken" data-edit="${r.id}" aria-label="Bewerken">✏️</button>
          <button class="icon-btn delete" title="Verwijderen" data-del="${r.id}" aria-label="Verwijderen">🗑️</button>
        </td>
      </tr>
    `).join("");
  };
  render();

  form.addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (data.max_deelnemers && Number(data.max_deelnemers) < 1) return alert("Max deelnemers moet minstens 1 zijn.");
    if (data.aantal_lessen && Number(data.aantal_lessen) < 1) return alert("Aantal lessen moet minstens 1 zijn.");

    const list = store.get(KEY);
    if (!data.id) { data.id = _uid(); list.push(data); }
    else { const i = list.findIndex(x => x.id === data.id); if (i !== -1) list[i] = data; }
    store.set(KEY, list);
    form.reset();
    render();
  });

  tbody.addEventListener("click", e => {
    const btn = e.target.closest("button"); if (!btn) return;
    const list = store.get(KEY);
    const editId = btn.getAttribute("data-edit");
    const delId  = btn.getAttribute("data-del");

    if (editId) {
      const row = list.find(x => x.id === editId); if (!row) return;
      Object.entries(row).forEach(([k,v]) => { if (form[k]) form[k].value = v; });
    }
    if (delId) { store.set(KEY, list.filter(x => x.id !== delId)); render(); }
  });
}

/* ===== 2) LES THEMA ===== */
function setupThema() {
  const KEY = "lessonThemes";
  const form = document.getElementById("form-thema");
  const tbody = document.querySelector("#table-thema tbody");
  document.getElementById("reset-thema")?.addEventListener("click", () => form.reset());
  if (!form || !tbody) return;

  const render = () => {
    const rows = store.get(KEY);
    if (!rows.length) {
      tbody.innerHTML = `<tr class="placeholder"><td colspan="3" style="text-align:center;color:#777;">
        Nog geen <strong>les thema’s</strong>.
      </td></tr>`;
      return;
    }
    tbody.innerHTML = rows.map(r => `
      <tr>
        <td>${r.naam ?? ""}</td>
        <td>${r.beschrijving ?? ""}</td>
        <td class="t-actions">
          <button class="icon-btn edit" data-edit="${r.id}" title="Bewerken">✏️</button>
          <button class="icon-btn delete" data-del="${r.id}" title="Verwijderen">🗑️</button>
        </td>
      </tr>
    `).join("");
  };
  render();

  form.addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const list = store.get(KEY);
    if (!data.id) { data.id = _uid(); list.push(data); }
    else { const i = list.findIndex(x => x.id === data.id); if (i !== -1) list[i] = data; }
    store.set(KEY, list); form.reset(); render();
  });

  tbody.addEventListener("click", e => {
    const btn = e.target.closest("button"); if (!btn) return;
    const list = store.get(KEY);
    const editId = btn.dataset.edit;
    const delId  = btn.dataset.del;

    if (editId) {
      const row = list.find(x => x.id === editId); if (!row) return;
      Object.entries(row).forEach(([k,v]) => { if (form[k]) form[k].value = v; });
    }
    if (delId) { store.set(KEY, list.filter(x => x.id !== delId)); render(); }
  });
}

/* ===== 3) LESLOCATIE ===== */
function setupLocatie() {
  const KEY = "lessonLocations";
  const form = document.getElementById("form-loc");
  const tbody = document.querySelector("#table-loc tbody");
  document.getElementById("reset-loc")?.addEventListener("click", () => form.reset());
  if (!form || !tbody) return;

  const render = () => {
    const rows = store.get(KEY);
    if (!rows.length) {
      tbody.innerHTML = `<tr class="placeholder"><td colspan="5" style="text-align:center;color:#777;">
        Nog geen <strong>leslocaties</strong>.
      </td></tr>`;
      return;
    }
    tbody.innerHTML = rows.map(r => `
      <tr>
        <td>${r.locatie ?? ""}</td>
        <td>${r.adres ?? ""}</td>
        <td>${r.plaats ?? ""}</td>
        <td>${r.beschrijving ?? ""}</td>
        <td class="t-actions">
          <button class="icon-btn edit" data-edit="${r.id}" title="Bewerken">✏️</button>
          <button class="icon-btn delete" data-del="${r.id}" title="Verwijderen">🗑️</button>
          <button class="icon-btn view"  data-view="${r.id}" title="Bekijk locatie">📍</button>
        </td>
      </tr>
    `).join("");
  };
  render();

  form.addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const list = store.get(KEY);
    if (!data.id) { data.id = _uid(); list.push(data); }
    else { const i = list.findIndex(x => x.id === data.id); if (i !== -1) list[i] = data; }
    store.set(KEY, list); form.reset(); render();
  });

  tbody.addEventListener("click", e => {
    const btn = e.target.closest("button"); if (!btn) return;
    const list = store.get(KEY);
    const editId = btn.dataset.edit, delId = btn.dataset.del, viewId = btn.dataset.view;

    if (editId) {
      const row = list.find(x => x.id === editId); if (!row) return;
      ["locatie","adres","plaats","beschrijving","id"].forEach(k => { if (form[k] !== undefined) form[k].value = row[k] ?? ""; });
    }
    if (delId) { store.set(KEY, list.filter(x => x.id !== delId)); render(); }
    if (viewId) {
      const row = list.find(x => x.id === viewId); if (!row) return;
      const q = encodeURIComponent(`${row.adres||""} ${row.plaats||""}`.trim());
      if (!q) { alert("Geen adres/plaats beschikbaar."); return; }
      window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
    }
  });
}

/* ===== 4) LES TRAINERS ===== */
function setupTrainer() {
  const KEY = "lessonTrainers";
  const form = document.getElementById("form-trainer");
  const tbody = document.querySelector("#table-trainer tbody");
  document.getElementById("reset-trainer")?.addEventListener("click", () => form.reset());
  if (!form || !tbody) return;

  const render = () => {
    const rows = store.get(KEY);
    if (!rows.length) {
      tbody.innerHTML = `<tr class="placeholder"><td colspan="3" style="text-align:center;color:#777;">
        Nog geen <strong>les trainers</strong>.
      </td></tr>`;
      return;
    }
    tbody.innerHTML = rows.map(r => `
      <tr>
        <td>${r.naam ?? ""}</td>
        <td>${r.functie ?? ""}</td>
        <td class="t-actions">
          <button class="icon-btn edit" data-edit="${r.id}" title="Bewerken">✏️</button>
          <button class="icon-btn delete" data-del="${r.id}" title="Verwijderen">🗑️</button>
        </td>
      </tr>
    `).join("");
  };
  render();

  form.addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const list = store.get(KEY);
    if (!data.id) { data.id = _uid(); list.push(data); }
    else { const i = list.findIndex(x => x.id === data.id); if (i !== -1) list[i] = data; }
    store.set(KEY, list); form.reset(); render();
  });

  tbody.addEventListener("click", e => {
    const btn = e.target.closest("button"); if (!btn) return;
    const list = store.get(KEY);
    const editId = btn.dataset.edit, delId = btn.dataset.del;

    if (editId) {
      const row = list.find(x => x.id === editId); if (!row) return;
      Object.entries(row).forEach(([k,v]) => { if (form[k]) form[k].value = v; });
    }
    if (delId) { store.set(KEY, list.filter(x => x.id !== delId)); render(); }
  });
}

/* ===== 5) E-MAILTEMPLATES ===== */
function setupEmailTemplates() {
  const KEY = "emailTemplates";

  // DOM
  const groupsWrap   = document.getElementById("email-groups");
  const inputSearch  = document.getElementById("email-search");
  const selectFilter = document.getElementById("email-filter");
  const btnNew       = document.getElementById("email-new");
  const btnExport    = document.getElementById("email-export");
  const inputImport  = document.getElementById("email-import-input");

  // Modals & form
  const modalEmail     = document.getElementById("modal-email");
  const modalPreview   = document.getElementById("modal-preview");
  const modalEmailTitle= document.getElementById("modal-email-title");
  const form           = document.getElementById("form-email");
  const btnPreview     = document.getElementById("email-preview");
  const previewData    = document.getElementById("preview-data");
  const previewRender  = document.getElementById("preview-render");

  if (!groupsWrap) return;

  // Helpers
  const read  = () => store.get(KEY);
  const write = v  => store.set(KEY, v);
  const uid   = () => _uid();
  const categories = ["Boeking","Administratie","Klant","Training","Overig"];

  // Seed demo
  if (read().length === 0) {
    write([
      { id: uid(), naam:"Nieuwe booking", categorie:"Boeking",  taal:"nl",
        beschrijving:"Bevestiging nieuwe boeking",
        onderwerp:"Bevestiging: {{les_naam}} op {{datum}}",
        inhoud:"<p>Beste {{klant_naam}},</p><p>Je boeking voor <b>{{les_naam}}</b> op {{datum}} is geregistreerd.</p><p>Groeten,<br>Team Superhond</p>"
      },
      { id: uid(), naam:"Betalingsherinnering", categorie:"Administratie", taal:"nl",
        beschrijving:"Herinnering bij openstaande betaling",
        onderwerp:"Betalingsherinnering factuur {{factuur_nummer}}",
        inhoud:"<p>Beste {{klant_naam}},</p><p>We hebben nog geen betaling ontvangen voor factuur {{factuur_nummer}}.</p>"
      }
    ]);
  }

  // Modals open/close
  const openModal = el => el.classList.add("open");
  const closeModal = el => el.classList.remove("open");
  document.querySelectorAll("[data-close]").forEach(btn=>{
    btn.addEventListener("click", ()=> closeModal(document.getElementById(btn.dataset.close)));
  });
  [modalEmail, modalPreview].forEach(m=>{
    m?.addEventListener("click", e=>{ if (e.target === m) closeModal(m); });
  });

  // Escape helper
  const escapeHtml = s => (s||"").replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));

  // Render groepen & kaarten
  function render() {
    const q = (inputSearch?.value || "").toLowerCase();
    const cat = selectFilter?.value || "";

    const list = read().filter(t => {
      const matchQ = !q || [t.naam,t.onderwerp,t.beschrijving].some(v => (v||"").toLowerCase().includes(q));
      const matchC = !cat || t.categorie === cat;
      return matchQ && matchC;
    });

    if (list.length === 0) {
      groupsWrap.innerHTML = `<p style="color:#777">Geen templates gevonden.</p>`;
      return;
    }

    const byCat = {};
    list.forEach(t => { const c = t.categorie || "Overig"; (byCat[c] ||= []).push(t); });

    groupsWrap.innerHTML = Object.keys(byCat).sort((a,b)=>categories.indexOf(a)-categories.indexOf(b))
      .map(catName => {
        const cards = byCat[catName].sort((a,b)=>a.naam.localeCompare(b.naam)).map(t => `
          <div class="card-mini">
            <h4>${escapeHtml(t.naam)}</h4>
            <p>${escapeHtml(t.beschrijving || "")}</p>
            <div class="row-actions">
              <button class="icon-btn" data-act="edit" data-id="${t.id}" title="Bewerken">✏️</button>
              <button class="icon-btn" data-act="dup"  data-id="${t.id}" title="Dupliceren">📄</button>
              <button class="icon-btn" data-act="prev" data-id="${t.id}" title="Voorbeeld">👁️</button>
              <button class="icon-btn delete" data-act="del"  data-id="${t.id}" title="Verwijderen">🗑️</button>
            </div>
          </div>
        `).join("");

        return `
          <h3 style="margin:18px 0 8px">${catName} templates</h3>
          <div class="cards">${cards}</div>
        `;
      }).join("");
  }

  // Nieuw
  btnNew?.addEventListener("click", ()=>{
    form.reset();
    form.id.value = "";
    form.categorie.value = "Boeking";
    form.taal.value = "nl";
    document.getElementById("modal-email-title").textContent = "Nieuw e-mailsjabloon";
    openModal(modalEmail);
  });

  // Opslaan
  form?.addEventListener("submit", e=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if(!data.naam || !data.onderwerp || !data.inhoud){ alert("Naam, onderwerp en inhoud zijn verplicht."); return; }
    const list = read();
    if(!data.id){ data.id = uid(); list.push(data); }
    else{
      const i = list.findIndex(x=>x.id===data.id);
      if(i!==-1) list[i] = data;
    }
    write(list);
    closeModal(modalEmail);
    render();
  });

  // Voorbeeld modal
  btnPreview?.addEventListener("click", ()=>{
    try {
      const data = Object.fromEntries(new FormData(form).entries());
      const sample = previewData.value.trim() ? JSON.parse(previewData.value) : {};
      const html = renderTemplate(data.inhoud, sample);
      const subj = renderTemplate(data.onderwerp, sample);
      previewRender.innerHTML = `<div style="font-weight:600;margin-bottom:8px">Onderwerp:</div>${escapeHtml(subj)}<hr>${html}`;
      openModal(modalPreview);
    } catch(err){
      alert("Ongeldige JSON in voorbeeld-waarden.");
    }
  });

  // Kaart-acties
  groupsWrap.addEventListener("click", e=>{
    const btn = e.target.closest("button[data-act]"); if(!btn) return;
    const id = btn.dataset.id;
    const list = read();
    const row = list.find(x=>x.id===id); if(!row) return;

    if(btn.dataset.act==="edit"){
      form.reset();
      Object.entries(row).forEach(([k,v])=>{ if(form[k]!==undefined) form[k].value=v; });
      document.getElementById("modal-email-title").textContent = "Template bewerken";
      openModal(modalEmail);
    }
    if(btn.dataset.act==="dup"){
      const copy = {...row, id: uid(), naam: row.naam + " (kopie)"};
      write([...list, copy]); render();
    }
    if(btn.dataset.act==="prev"){
      previewData.value = previewData.value.trim() || '{"klant_naam":"Eva","hond_naam":"Bowie","datum":"ma 7 okt"}';
      const sample = JSON.parse(previewData.value || "{}");
      const html = renderTemplate(row.inhoud, sample);
      const subj = renderTemplate(row.onderwerp, sample);
      previewRender.innerHTML = `<div style="font-weight:600;margin-bottom:8px">Onderwerp:</div>${escapeHtml(subj)}<hr>${html}`;
      openModal(modalPreview);
    }
    if(btn.dataset.act==="del"){
      if(confirm(`Template “${row.naam}” verwijderen?`)){
        write(list.filter(x=>x.id!==id)); render();
      }
    }
  });

  // Export
  btnExport?.addEventListener("click", ()=>{
    const blob = new Blob([JSON.stringify(read(), null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "email-templates.json";
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  });

  // Import
  inputImport?.addEventListener("change", async (e)=>{
    const file = e.target.files?.[0]; if(!file) return;
    try{
      const text = await file.text();
      const json = JSON.parse(text);
      if(!Array.isArray(json)) throw new Error("JSON moet een array zijn");
      const current = read();
      json.forEach(t=>{
        if(!t.id) t.id = uid();
        const i = current.findIndex(x=>x.naam===t.naam && x.categorie===t.categorie);
        if(i===-1) current.push(t); else current[i]=t;
      });
      write(current);
      render();
      alert("Templates geïmporteerd.");
    }catch(err){
      alert("Import mislukt: " + err.message);
    }finally{
      e.target.value = "";
    }
  });

  // Zoek & filter
  inputSearch?.addEventListener("input", render);
  selectFilter?.addEventListener("change", render);

  // Template-merge ({{placeholder}})
  function renderTemplate(src, data){
    return (src||"").replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_,k)=>{
      return (k in data) ? String(data[k]) : "";
    });
  }

  // Init
  render();
}
