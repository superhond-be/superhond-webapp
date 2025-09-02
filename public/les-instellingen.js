// Helpers voor localStorage
const store = {
  get(key, fallback = []) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
};

// Generate simple ids
const uid = () => Math.random().toString(36).slice(2, 10);

// ---------- 1) LES TYPE ----------
const KEY_TYPE = "lessonTypes";
const formType = document.getElementById("form-type");
const tableTypeBody = document.querySelector("#table-type tbody");
document.getElementById("reset-type").addEventListener("click", () => formType.reset());

function renderTypes() {
  const rows = store.get(KEY_TYPE);
  tableTypeBody.innerHTML = rows.map(r => `
    <tr>
      <td>${r.naam ?? ""}</td>
      <td>${r.aantal_lessen ?? ""}</td>
      <td>${r.geldigheidsduur ?? ""}</td>
      <td>${r.startdatum ?? ""}</td>
      <td>${r.max_deelnemers ?? ""}</td>
      <td>${r.actief === "J" ? "Ja" : "Nee"}</td>
      <td>${r.online === "J" ? "Ja" : "Nee"}</td>
      <td>
        <button class="btn" data-edit-type="${r.id}">Bewerken</button>
        <button class="btn" data-del-type="${r.id}">Verwijderen</button>
      </td>
    </tr>
  `).join("");
}
renderTypes();

formType.addEventListener("submit", e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(formType).entries());

  // Validatie: max deelnemers en aantal lessen
  if (data.max_deelnemers && Number(data.max_deelnemers) < 1) {
    showNotification("Max deelnemers moet minstens 1 zijn.", "error"); return;
  }
  if (data.aantal_lessen && Number(data.aantal_lessen) < 1) {
    showNotification("Aantal lessen moet minstens 1 zijn.", "error"); return;
  }
  if (data.online === "J" && data.actief !== "J") {
    showNotification("Online zichtbaar kan alleen als Les actief = Ja.", "error"); return;
  }

  const list = store.get(KEY_TYPE);
  if (!data.id) {
    data.id = uid();
    list.push(data);
  } else {
    const i = list.findIndex(x => x.id === data.id);
    if (i !== -1) list[i] = data;
  }
  store.set(KEY_TYPE, list);
  formType.reset();
  renderTypes();
  showNotification("Les type opgeslagen", "success");
});

tableTypeBody.addEventListener("click", e => {
  const editId = e.target.getAttribute("data-edit-type");
  const delId  = e.target.getAttribute("data-del-type");
  const list = store.get(KEY_TYPE);

  if (editId) {
    const row = list.find(x => x.id === editId);
    if (!row) return;
    Object.entries(row).forEach(([k, v]) => {
      if (formType[k]) {
        if (formType[k].type === "radio") {
          [...formType[k]].forEach(r => r.checked = (r.value === v));
        } else {
          formType[k].value = v;
        }
      }
    });
    showNotification("Les type geladen voor bewerking", "info");
  }

  if (delId) {
    const filtered = list.filter(x => x.id !== delId);
    store.set(KEY_TYPE, filtered);
    renderTypes();
    showNotification("Les type verwijderd", "success");
  }
});

// ---------- 2) LES THEMA ----------
const KEY_THEMA = "lessonThemes";
const formThema = document.getElementById("form-thema");
const tableThemaBody = document.querySelector("#table-thema tbody");
document.getElementById("reset-thema").addEventListener("click", () => formThema.reset());

function renderThemes() {
  const rows = store.get(KEY_THEMA);
  tableThemaBody.innerHTML = rows.map(r => `
    <tr>
      <td>${r.naam ?? ""}</td>
      <td>${r.beschrijving ?? ""}</td>
      <td>
        <button class="btn" data-edit-thema="${r.id}">Bewerken</button>
        <button class="btn" data-del-thema="${r.id}">Verwijderen</button>
      </td>
    </tr>
  `).join("");
}
renderThemes();

formThema.addEventListener("submit", e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(formThema).entries());
  const list = store.get(KEY_THEMA);
  if (!data.id) { data.id = uid(); list.push(data); }
  else {
    const i = list.findIndex(x => x.id === data.id);
    if (i !== -1) list[i] = data;
  }
  store.set(KEY_THEMA, list);
  formThema.reset();
  renderThemes();
  showNotification("Les thema opgeslagen", "success");
});

tableThemaBody.addEventListener("click", e => {
  const editId = e.target.getAttribute("data-edit-thema");
  const delId  = e.target.getAttribute("data-del-thema");
  const list = store.get(KEY_THEMA);

  if (editId) {
    const row = list.find(x => x.id === editId);
    if (!row) return;
    Object.entries(row).forEach(([k,v]) => { if (formThema[k]) formThema[k].value = v; });
    showNotification("Les thema geladen voor bewerking", "info");
  }
  if (delId) {
    store.set(KEY_THEMA, list.filter(x => x.id !== delId));
    renderThemes();
    showNotification("Les thema verwijderd", "success");
  }
});

// ---------- 3) LESLOCATIE ----------
const KEY_LOC = "lessonLocations";
const formLoc = document.getElementById("form-loc");
const tableLocBody = document.querySelector("#table-loc tbody");
document.getElementById("reset-loc").addEventListener("click", () => formLoc.reset());

// Open Google Maps op basis van adres + plaats
document.getElementById("map-btn").addEventListener("click", () => {
  const adres = formLoc.adres.value || "";
  const plaats = formLoc.plaats.value || "";
  const q = encodeURIComponent(`${adres} ${plaats}`.trim());
  if (!q) { showNotification("Vul eerst Adres/plaats in.", "error"); return; }
  window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
});

function renderLocs() {
  const rows = store.get(KEY_LOC);
  tableLocBody.innerHTML = rows.map(r => `
    <tr>
      <td>${r.naam ?? ""}</td>
      <td>${r.adres ?? ""}</td>
      <td>${r.plaats ?? ""}</td>
      <td>${r.locatie ?? ""}</td>
      <td>
        <button class="btn" data-edit-loc="${r.id}">Bewerken</button>
        <button class="btn" data-del-loc="${r.id}">Verwijderen</button>
      </td>
    </tr>
  `).join("");
}
renderLocs();

formLoc.addEventListener("submit", e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(formLoc).entries());
  const list = store.get(KEY_LOC);
  if (!data.id) { data.id = uid(); list.push(data); }
  else {
    const i = list.findIndex(x => x.id === data.id);
    if (i !== -1) list[i] = data;
  }
  store.set(KEY_LOC, list);
  formLoc.reset();
  renderLocs();
  showNotification("Leslocatie opgeslagen", "success");
});

tableLocBody.addEventListener("click", e => {
  const editId = e.target.getAttribute("data-edit-loc");
  const delId  = e.target.getAttribute("data-del-loc");
  const list = store.get(KEY_LOC);

  if (editId) {
    const row = list.find(x => x.id === editId);
    if (!row) return;
    Object.entries(row).forEach(([k,v]) => { if (formLoc[k] !== undefined) formLoc[k].value = v; });
    showNotification("Leslocatie geladen voor bewerking", "info");
  }
  if (delId) {
    store.set(KEY_LOC, list.filter(x => x.id !== delId));
    renderLocs();
    showNotification("Leslocatie verwijderd", "success");
  }
});

// ---------- 4) LES TRAINERS ----------
const KEY_TRAINER = "lessonTrainers";
const formTrainer = document.getElementById("form-trainer");
const tableTrainerBody = document.querySelector("#table-trainer tbody");
document.getElementById("reset-trainer").addEventListener("click", () => formTrainer.reset());

function renderTrainers() {
  const rows = store.get(KEY_TRAINER);
  tableTrainerBody.innerHTML = rows.map(r => `
    <tr>
      <td>${r.naam ?? ""}</td>
      <td>${r.functie ?? ""}</td>
      <td>
        <button class="btn" data-edit-trainer="${r.id}">Bewerken</button>
        <button class="btn" data-del-trainer="${r.id}">Verwijderen</button>
      </td>
    </tr>
  `).join("");
}
renderTrainers();

formTrainer.addEventListener("submit", e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(formTrainer).entries());
  const list = store.get(KEY_TRAINER);
  if (!data.id) { data.id = uid(); list.push(data); }
  else {
    const i = list.findIndex(x => x.id === data.id);
    if (i !== -1) list[i] = data;
  }
  store.set(KEY_TRAINER, list);
  formTrainer.reset();
  renderTrainers();
  showNotification("Les trainer opgeslagen", "success");
});

tableTrainerBody.addEventListener("click", e => {
  const editId = e.target.getAttribute("data-edit-trainer");
  const delId  = e.target.getAttribute("data-del-trainer");
  const list = store.get(KEY_TRAINER);

  if (editId) {
    const row = list.find(x => x.id === editId);
    if (!row) return;
    Object.entries(row).forEach(([k,v]) => { if (formTrainer[k]) formTrainer[k].value = v; });
    showNotification("Les trainer geladen voor bewerking", "info");
  }
  if (delId) {
    store.set(KEY_TRAINER, list.filter(x => x.id !== delId));
    renderTrainers();
    showNotification("Les trainer verwijderd", "success");
  }
});
