/* public/js/les-instellingen.js
   - Lestype: formulier + tabel (geen startdatum)
   - Les thema: formulier + tabel
   - Leslocatie: formulier + tabel (kolommen: Locatie, Adres, Postbus/Plaats, Beschrijving) + 📍 Bekijk locatie
   - Les trainers: formulier + tabel
   - Opslag: localStorage
*/

/* ===== Helpers ===== */
const store = {
  get: (k, f = []) => {
    try { return JSON.parse(localStorage.getItem(k)) ?? f; }
    catch { return f; }
  },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};
const uid = () => Math.random().toString(36).slice(2, 10);

/* ===== Init ===== */
document.addEventListener("DOMContentLoaded", () => {
  setupLestype();
  setupThema();
  setupLocatie();
  setupTrainer();
});

/* =======================================================================
   1) LESTYPE — formulier + tabel (zonder startdatum)
   ======================================================================= */
function setupLestype() {
  const KEY = "lessonTypes";
  const form = document.getElementById("form-type");
  const tbody = document.querySelector("#table-type tbody");
  const resetBtn = document.getElementById("reset-type");

  if (!form || !tbody) return;

  resetBtn?.addEventListener("click", () => form.reset());

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

    // Validaties
    if (data.max_deelnemers && Number(data.max_deelnemers) < 1) {
      showNotification?.("Max deelnemers moet minstens 1 zijn.", "error"); return;
    }
    if (data.aantal_lessen && Number(data.aantal_lessen) < 1) {
      showNotification?.("Aantal lessen moet minstens 1 zijn.", "error"); return;
    }
    if (data.online === "J" && data.actief !== "J") {
      showNotification?.("Online zichtbaar kan alleen als Les actief = Ja.", "error"); return;
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
    showNotification?.("Lestype opgeslagen", "success");
  });

  tbody.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const list = store.get(KEY);
    const editId = btn.getAttribute("data-edit");
    const delId  = btn.getAttribute("data-del");

    if (editId) {
      const row = list.find(x => x.id === editId);
      if (!row) return;
      Object.entries(row).forEach(([k,v]) => { if (form[k]) form[k].value = v; });
      // radio's apart zetten:
      if (row.actief) [...form.actief].forEach(r => r.checked = (r.value === row.actief));
      if (row.online) [...form.online].forEach(r => r.checked = (r.value === row.online));
      showNotification?.("Lestype geladen voor bewerking", "info");
    }
    if (delId) {
      store.set(KEY, list.filter(x => x.id !== delId));
      render();
      showNotification?.("Lestype verwijderd", "success");
    }
  });
}

/* =======================================================================
   2) LES THEMA — formulier + tabel
   ======================================================================= */
function setupThema() {
  const KEY = "lessonThemes";
  const form = document.getElementById("form-thema");
  const tbody = document.querySelector("#table-thema tbody");
  const resetBtn = document.getElementById("reset-thema");
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

  resetBtn?.addEventListener("click", () => form.reset());

  form.addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const list = store.get(KEY);
    if (!data.id) { data.id = uid(); list.push(data); }
    else {
      const i = list.findIndex(x => x.id === data.id);
      if (i !== -1) list[i] = data;
    }
    store.set(KEY, list);
    form.reset();
    render();
    showNotification?.("Les thema opgeslagen", "success");
  });

  tbody.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const list = store.get(KEY);
    const editId = btn.getAttribute("data-edit");
    const delId  = btn.getAttribute("data-del");

    if (editId) {
      const row = list.find(x => x.id === editId);
      if (!row) return;
      Object.entries(row).forEach(([k,v]) => { if (form[k]) form[k].value = v; });
      showNotification?.("Les thema geladen voor bewerking", "info");
    }
    if (delId) {
      store.set(KEY, list.filter(x => x.id !== delId));
      render();
      showNotification?.("Les thema verwijderd", "success");
    }
  });
}

/* =======================================================================
   3) LESLOCATIE — formulier + tabel + 📍 Bekijk locatie
      (kolommen: Locatie, Adres, Postbus/Plaats, Beschrijving)
   ======================================================================= */
function setupLocatie() {
  const KEY = "lessonLocations";
  const form = document.getElementById("form-loc");
  const tbody = document.querySelector("#table-loc tbody");
  const resetBtn = document.getElementById("reset-loc");
  if (!form || !tbody) return;

  // Migratie: oude data met 'naam' => 'locatie'
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

  resetBtn?.addEventListener("click", () => form.reset());

  form.addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const list = store.get(KEY);
    if (!data.id) { data.id = uid(); list.push(data); }
    else {
      const i = list.findIndex(x => x.id === data.id);
      if (i !== -1) list[i] = data;
    }
    store.set(KEY, list);
    form.reset();
    render();
    showNotification?.("Leslocatie opgeslagen", "success");
  });

  tbody.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const list = store.get(KEY);
    const editId = btn.getAttribute("data-edit");
    const delId  = btn.getAttribute("data-del");
    const viewId = btn.getAttribute("data-view");

    if (editId) {
      const row = list.find(x => x.id === editId);
      if (!row) return;
      ["locatie","adres","plaats","beschrijving","id"].forEach(k => {
        if (form[k] !== undefined) form[k].value = row[k] ?? "";
      });
      showNotification?.("Leslocatie geladen voor bewerking", "info");
    }

    if (delId) {
      store.set(KEY, list.filter(x => x.id !== delId));
      render();
      showNotification?.("Leslocatie verwijderd", "success");
    }

    if (viewId) {
      const row = list.find(x => x.id === viewId);
      if (!row) return;
      const adres = row.adres || "";
      const plaats = row.plaats || "";
      const q = encodeURIComponent(`${adres} ${plaats}`.trim());
      if (!q) {
        showNotification?.("Geen adres/plaats beschikbaar om te bekijken.", "error");
        return;
      }
      window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
    }
  });
}

/* =======================================================================
   4) LES TRAINERS — formulier + tabel
   ======================================================================= */
function setupTrainer() {
  const KEY = "lessonTrainers";
  const form = document.getElementById("form-trainer");
  const tbody = document.querySelector("#table-trainer tbody");
  const resetBtn = document.getElementById("reset-trainer");
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

  resetBtn?.addEventListener("click", () => form.reset());

  form.addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const list = store.get(KEY);
    if (!data.id) { data.id = uid(); list.push(data); }
    else {
      const i = list.findIndex(x => x.id === data.id);
      if (i !== -1) list[i] = data;
    }
    store.set(KEY, list);
    form.reset();
    render();
    showNotification?.("Les trainer opgeslagen", "success");
  });

  tbody.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const list = store.get(KEY);
    const editId = btn.getAttribute("data-edit");
    const delId  = btn.getAttribute("data-del");

    if (editId) {
      const row = list.find(x => x.id === editId);
      if (!row) return;
      Object.entries(row).forEach(([k,v]) => { if (form[k]) form[k].value = v; });
      showNotification?.("Les trainer geladen voor bewerking", "info");
    }
    if (delId) {
      store.set(KEY, list.filter(x => x.id !== delId));
      render();
      showNotification?.("Les trainer verwijderd", "success");
    }
  });
}
