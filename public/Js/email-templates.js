/* email-templates.js v0903u */
console.log("email-templates.js geladen v0903u");

// ===== helpers
const $ = (s, r=document)=>r.querySelector(s);
function lsGet(key, fallback){ try{ const v=localStorage.getItem(key); return v? JSON.parse(v): fallback; } catch{ return fallback; } }
function lsSet(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); } catch{} }
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function download(name, content, mime="application/json"){
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], {type:mime}));
  a.download = name; document.body.appendChild(a); a.click(); a.remove();
}

// ===== storage
const LS_KEY = "superhond.emailTemplates";
let EMAILS = lsGet(LS_KEY, null);

// seed demo als leeg
if (!Array.isArray(EMAILS) || EMAILS.length === 0) {
  EMAILS = [
    {
      id: uid(),
      naam: "Verjaardag hond",
      categorie: "Klant templates",
      onderwerp: "Proficiat met de verjaardag van {{hond_naam}}!",
      inhoud: "<p>Beste {{klant_naam}},<br>Vandaag viert {{hond_naam}} zijn verjaardag 🎉! Een pootje van ons team.</p>"
    },
    {
      id: uid(),
      naam: "Les herinnering",
      categorie: "Lessen",
      onderwerp: "Herinnering: les op {{les_datum}} om {{les_tijd}}",
      inhoud: "<p>Beste {{klant_naam}},<br>Dit is een herinnering voor de les <b>{{les_naam}}</b> op {{les_datum}} om {{les_tijd}} te {{les_locatie}}.</p>"
    },
    {
      id: uid(),
      naam: "Betalingsherinnering",
      categorie: "Administratie",
      onderwerp: "Uw betaling is nog niet ontvangen",
      inhoud: "<p>Beste {{klant_naam}},<br>Volgens onze gegevens staat er nog een openstaand saldo voor {{product_naam}}.</p>"
    }
  ];
  lsSet(LS_KEY, EMAILS);
}

// ===== render
function renderTable(){
  const tbody = $("#tbl-emails tbody");
  if(!tbody) return;
  if(!EMAILS.length){
    tbody.innerHTML = `<tr><td colspan="4" class="muted">Nog geen e-mails toegevoegd.</td></tr>`;
    return;
  }
  tbody.innerHTML = EMAILS.map(t => `
    <tr data-id="${t.id}">
      <td>${t.naam || "—"}</td>
      <td>${t.categorie || "—"}</td>
      <td>${t.onderwerp || "—"}</td>
      <td>
        <button class="btn-icon" data-act="edit" title="Bewerken">
          <svg><use href="#i-edit"/></svg>
        </button>
        <button class="btn-icon" data-act="delete" title="Verwijderen">
          <svg><use href="#i-trash"/></svg>
        </button>
        <button class="btn-icon" data-act="preview" title="Voorbeeld">
          <svg><use href="#i-eye"/></svg>
        </button>
      </td>
    </tr>
  `).join("");
}

// ===== dialog helpers
function openDialog(mode, row){
  const dlg = $("#dlg-email"); if(!dlg) return;
  $("#dlg-title").textContent = mode === "new" ? "Nieuwe template" : "Template bewerken";
  $("#em-id").value = row?.id || "";
  $("#em-naam").value = row?.naam || "";
  $("#em-cat").value = row?.categorie || "";
  $("#em-onderwerp").value = row?.onderwerp || "";
  $("#em-inhoud").value = row?.inhoud || "";
  dlg.showModal();
}
function closeDialog(){ $("#dlg-email")?.close(); }

// ===== events
$("#btn-email-new")?.addEventListener("click", ()=> openDialog("new"));

$("#form-email")?.addEventListener("submit", (e)=>{
  e.preventDefault();
  const id = $("#em-id").value.trim();
  const row = {
    naam: $("#em-naam").value.trim(),
    categorie: $("#em-cat").value.trim(),
    onderwerp: $("#em-onderwerp").value.trim(),
    inhoud: $("#em-inhoud").value
  };
  if(!row.naam || !row.onderwerp){
    alert("Naam en onderwerp zijn verplicht.");
    return;
  }
  if(id){
    const i = EMAILS.findIndex(x=>x.id===id);
    if(i!==-1) EMAILS[i] = { ...EMAILS[i], ...row, id };
  }else{
    EMAILS.push({ id: uid(), ...row });
  }
  lsSet(LS_KEY, EMAILS);
  renderTable();
  closeDialog();
});

$("#tbl-emails")?.addEventListener("click", (e)=>{
  const btn = e.target.closest("button"); if(!btn) return;
  const tr = e.target.closest("tr"); const id = tr?.dataset.id;
  if(!id) return;
  const row = EMAILS.find(x=>x.id===id);
  const act = btn.dataset.act;

  if(act==="edit"){
    openDialog("edit", row);
  }
  if(act==="delete"){
    if(confirm(`Template "${row?.naam||""}" verwijderen?`)){
      EMAILS = EMAILS.filter(x=>x.id!==id);
      lsSet(LS_KEY, EMAILS);
      renderTable();
    }
  }
  if(act==="preview"){
    const w = window.open("", "_blank");
    const html = `
      <!doctype html><meta charset="utf-8">
      <title>Voorbeeld – ${row?.naam||""}</title>
      <div style="font-family:Arial,Helvetica,sans-serif;padding:16px;max-width:700px;margin:auto">
        <h2>${row?.onderwerp||""}</h2>
        <div>${row?.inhoud||""}</div>
        <hr><small style="color:#777">Voorbeeldweergave – placeholders zoals {{klant_naam}} worden bij verzending vervangen.</small>
      </div>`;
    w.document.write(html);
    w.document.close();
  }
});

// Export / Import
$("#btn-email-export")?.addEventListener("click", ()=>{
  download("email-templates-export.json", JSON.stringify(EMAILS, null, 2));
});
$("#btn-email-import")?.addEventListener("click", ()=>{
  $("#email-import-file")?.click();
});
$("#email-import-file")?.addEventListener("change", async (e)=>{
  const f = e.target.files[0]; if(!f) return;
  try{
    const txt = await f.text();
    const arr = JSON.parse(txt);
    if(!Array.isArray(arr)) throw new Error("Bestand heeft geen lijst");
    // simpele merge: voeg toe met nieuwe id’s
    arr.forEach(t => EMAILS.push({ id: uid(), ...t, id_old: t.id }));
    lsSet(LS_KEY, EMAILS);
    renderTable();
    alert("Import voltooid.");
  }catch(err){
    alert("Import mislukt: " + err.message);
  }finally{
    e.target.value = "";
  }
});

// init
renderTable();
