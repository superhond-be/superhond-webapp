/* public/Js/lessen-instellingen.js */

/* ===== Helpers ===== */
const store = {
  get: (k, f = []) => {
    try { return JSON.parse(localStorage.getItem(k)) ?? f; }
    catch { return f; }
  },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};
const uid = () => Math.random().toString(36).slice(2, 10);

/* ===== Tabs ===== */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });

  setupLestype();
  setupThema();
  setupLocatie();
  setupTrainer();
});

/* ===== 1) LESTYPE (formulier-only, geen tabel, geen startdatum) ===== */
function setupLestype() {
  const KEY = "lessonTypes";
  const form = document.getElementById("form-type");
  const resetBtn = document.getElementById("reset-type");
  if (!form) return;

  resetBtn?.addEventListener("click", () => form.reset());

  form.addEventListener("submit", (e) => {
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
    showNotification?.("Lestype opgeslagen", "success");
  });
}

/* ===== 2) LES THEMA ===== */
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
          <button class="btn" data-edit="${r.id}">Bewerken</button>
          <button class="btn" data-del="${r.id}">Verwijderen</button>
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
    const editId = e.target.getAttribute("data-edit");
    const delId  = e.target.getAttribute("data-del");
    const list = store.get(KEY);

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

/* ===== 3) LESLOCATIE ===== */
function setupLocatie() {
  const KEY = "lessonLocations";
  const form = document.getElementById("form-loc");
  const tbody = document.querySelector("#table-loc tbody");
  const resetBtn = document.getElementById("reset-loc");
  const mapBtn = document.getElementById("map-btn");
  if (!form || !tbody) return;

  const render = () => {
    const rows = store.get(KEY);
    if (!rows.length) {
      tbody.innerHTML = `<tr class="placeholder"><td colspan="5" style="text-align:center;color:#777;">
        Nog geen <strong>leslocaties</strong>. Vul het formulier in en druk <em>Opslaan</em>.
        Met <em>Bekijk locatie</em> open je Google Maps.
      </td></tr>`;
      return;
    }
    tbody.innerHTML = rows.map(r => `
      <tr>
        <td>${r.naam ?? ""}</td>
        <td>${r.adres ?? ""}</td>
        <td>${r.plaats ?? ""}</td>
        <td>${r.locatie ?? ""}</td>
        <td class="t-actions">
          <button class="btn" data-edit="${r.id}">Bewerken</button>
          <button class="btn" data-del="${r.id}">Verwijderen</button>
        </td>
      </tr>
    `).join("");
  };
  render();

  resetBtn?.addEventListener("click", () => form.reset());

  mapBtn?.addEventListener("click", () => {
    const adres = form.adres.value || "";
    const plaats = form.plaats.value || "";
    const q = encodeURIComponent(`${adres} ${plaats}`.trim());
    if (!q) { showNotification?.("Vul eerst Adres/Plaats in.", "error"); return; }
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
  });

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
    const editId = e.target.getAttribute("data-edit");
    const delId  = e.target.getAttribute("data-del");
    const list = store.get(KEY);

    if (editId) {
      const row = list.find(x => x.id === editId);
      if (!row) return;
      Object.entries(row).forEach(([k,v]) => { if (form[k] !== undefined) form[k].value = v; });
      showNotification?.("Leslocatie geladen voor bewerking", "info");
    }
    if (delId) {
      store.set(KEY, list.filter(x => x.id !== delId));
      render();
      showNotification?.("Leslocatie verwijderd", "success");
    }
  });
}

/* ===== 4) LES TRAINERS ===== */
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
          <button class="btn" data-edit="${r.id}">Bewerken</button>
          <button class="btn" data-del="${r.id}">Verwijderen</button>
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
    const editId = e.target.getAttribute("data-edit");
    const delId  = e.target.getAttribute("data-del");
    const list = store.get(KEY);

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
