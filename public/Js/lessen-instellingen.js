/* public/Js/lessen-instellingen.js — v0903a */
console.log("les-instellingen JS geladen v0903a");

/* Helpers */
const store = {
  get: (k, f = []) => { try { return JSON.parse(localStorage.getItem(k)) ?? f; } catch { return f; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};
const uid = () => Math.random().toString(36).slice(2, 10);

document.addEventListener("DOMContentLoaded", () => {
  setupLestype();
  setupThema();
  setupLocatie();
  setupTrainer();
});

/* ========== 1) LESTYPE ========== */
function setupLestype() {
  const KEY = "lessonTypes";
  const form = document.getElementById("form-type");
  const tbody = document.querySelector("#table-type tbody");
  document.getElementById("reset-type")?.addEventListener("click", () => form.reset());
  if (!form || !tbody) return;

  const render = () => {
    const rows = store.get(KEY);
    if (!rows.length) {
      tbody.innerHTML = `<tr class="placeholder"><td colspan="7" style="text-align:center;color:#777;">
        Nog geen <strong>lestypes</strong> toegevoegd. Vul het formulier hierboven in en klik <em>Opslaan</em>.
      </td></tr>`;
      return;
    }
    tbody.innerHTML = rows.map(r => `
      <tr>
        <td>${r.naam ?? ""}</td>
        <td>${r.aantal_lessen ?? ""}</td>
        <td>${r.geldigheidsduur ?? ""}</td>
        <td>${r.max_deelnemers ?? ""}</td>
        <td>${r.actief === "J" ? "Ja" : "Nee"}</td>
        <td>${r.online === "J" ? "Ja" : "Nee"}</td>
        <td class="t-actions">
          <button class="icon-btn edit" title="Bewerken" data-edit="${r.id}" aria-label="Bewerken"><span class="icon">✏️</span></button>
          <button class="icon-btn delete" title="Verwijderen" data-del="${r.id}" aria-label="Verwijderen"><span class="icon">🗑️</span></button>
        </td>
      </tr>
    `).join("");
  };
  render();

  form.addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());

    if (data.max_deelnemers && Number(data.max_deelnemers) < 1) {
      alert("Max deelnemers moet minstens 1 zijn."); return;
    }
    if (data.aantal_lessen && Number(data.aantal_lessen) < 1) {
      alert("Aantal lessen moet minstens 1 zijn."); return;
    }
    if (data.online === "J" && data.actief !== "J") {
      alert("Online zichtbaar kan alleen als Les actief = Ja."); return;
    }

    const list = store.get(KEY);
    if (!data.id) { data.id = uid(); list.push(data); }
    else {
      const i = list.findIndex(x => x.id === data.id);
      if (i !== -1) list[i] = data;
    }
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
      if (row.actief) [...form.actief].forEach(r => r.checked = (r.value === row.actief));
      if (row.online) [...form.online].forEach(r => r.checked = (r.value === row.online));
    }
    if (delId) { store.set(KEY, list.filter(x => x.id !== delId)); render(); }
  });
}

/* ========== 2) LES THEMA ========== */
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
        Nog geen <strong>les thema’s</strong>. Voeg er één toe via het formulier hierboven.
      </td></tr>`;
      return;
    }
    tbody.innerHTML = rows.map(r => `
      <tr>
        <td>${r.naam ?? ""}</td>
        <td>${r.beschrijving ?? ""}</td>
        <td class="t-actions">
          <button class="icon-btn edit" title="Bewerken" data-edit="${r.id}" aria-label="Bewerken"><span class="icon">✏️</span></button>
          <button class="icon-btn delete" title="Verwijderen" data-del="${r.id}" aria-label="Verwijderen"><span class="icon">🗑️</span></button>
        </td>
      </tr>
    `).join("");
  };
  render();

  form.addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const list = store.get(KEY);
    if (!data.id) { data.id = uid(); list.push(data); }
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

/* ========== 3) LESLOCATIE (Locatie/Adres/Plaats/Beschrijving + 📍) ========== */
function setupLocatie() {
  const KEY = "lessonLocations";
  const form = document.getElementById("form-loc");
  const tbody = document.querySelector("#table-loc tbody");
  document.getElementById("reset-loc")?.addEventListener("click", () => form.reset());
  if (!form || !tbody) return;

  // Migratie: eventuele oude 'naam' -> 'locatie'
  (function migrateOld() {
    const list = store.get(KEY);
    let changed = false;
    list.forEach(row => {
      if (!row.locatie && row.naam) { row.locatie = row.naam; delete row.naam; changed = true; }
    });
    if (changed) store.set(KEY, list);
  })();

  const render = () => {
    const rows = store.get(KEY);
    if (!rows.length) {
      tbody.innerHTML = `<tr class="placeholder"><td colspan="5" style="text-align:center;color:#777;">
        Nog geen <strong>leslocaties</strong>. Vul het formulier in en klik <em>Opslaan</em>.
        Gebruik het 📍-icoon in de lijst om het adres in Google Maps te bekijken.
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
          <button class="icon-btn edit" title="Bewerken" data-edit="${r.id}" aria-label="Bewerken"><span class="icon">✏️</span></button>
          <button class="icon-btn delete" title="Verwijderen" data-del="${r.id}" aria-label="Verwijderen"><span class="icon">🗑️</span></button>
          <button class="icon-btn view" title="Bekijk locatie" data-view="${r.id}" aria-label="Bekijk locatie"><span class="icon">📍</span></button>
        </td>
      </tr>
    `).join("");
  };
  render();

  form.addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const list = store.get(KEY);
    if (!data.id) { data.id = uid(); list.push(data); }
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
    const viewId = btn.getAttribute("data-view");

    if (editId) {
      const row = list.find(x => x.id === editId); if (!row) return;
      ["locatie","adres","plaats","beschrijving","id"].forEach(k => {
        if (form[k] !== undefined) form[k].value = row[k] ?? "";
      });
    }
    if (delId) { store.set(KEY, list.filter(x => x.id !== delId)); render(); }

    if (viewId) {
      const row = list.find(x => x.id === viewId); if (!row) return;
      const q = encodeURIComponent(`${row.adres || ""} ${row.plaats || ""}`.trim());
      if (!q) { alert("Geen adres/plaats beschikbaar."); return; }
      window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
    }
  });
}

/* ========== 4) LES TRAINERS ========== */
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
        Nog geen <strong>les trainers</strong>. Voeg er één toe via het formulier.
      </td></tr>`;
      return;
    }
    tbody.innerHTML = rows.map(r => `
      <tr>
        <td>${r.naam ?? ""}</td>
        <td>${r.functie ?? ""}</td>
        <td class="t-actions">
          <button class="icon-btn edit" title="Bewerken" data-edit="${r.id}" aria-label="Bewerken"><span class="icon">✏️</span></button>
          <button class="icon-btn delete" title="Verwijderen" data-del="${r.id}" aria-label="Verwijderen"><span class="icon">🗑️</span></button>
        </td>
      </tr>
    `).join("");
  };
  render();

  form.addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const list = store.get(KEY);
    if (!data.id) { data.id = uid(); list.push(data); }
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
