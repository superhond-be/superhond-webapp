// public/js/admin-taxonomies.js
// Simpele beheer-UI voor /api/taxonomies/:type  (GET, POST, DELETE)
// Types die we ondersteunen:
const TYPES = [
  { key: "lestypes",   label: "Lestypes",   fields: ["naam", "beschrijving"] },
  { key: "themas",     label: "Thema’s",    fields: ["naam", "beschrijving"] },
  { key: "locaties",   label: "Locaties",   fields: ["naam", "adres", "postcode", "plaats", "beschrijving"] },
  { key: "trainingen", label: "Trainingen", fields: ["naam", "beschrijving"] },
];

const tabsEl = document.getElementById("tabs");
const panelsEl = document.getElementById("panels");

// Helpers
const apiBase = "/api/taxonomies";

async function apiGet(type) {
  const r = await fetch(`${apiBase}/${type}`);
  if (!r.ok) throw new Error(`GET ${type} failed`);
  return r.json();
}
async function apiPost(type, payload) {
  const r = await fetch(`${apiBase}/${type}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`POST ${type} failed`);
  return r.json();
}
async function apiDelete(type, id) {
  const r = await fetch(`${apiBase}/${type}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!r.ok) throw new Error(`DELETE ${type}/${id} failed`);
  return r.json();
}

// UI opbouw
function buildForm(typeDef) {
  const form = document.createElement("form");
  form.dataset.type = typeDef.key;

  for (const f of typeDef.fields) {
    const lab = document.createElement("label");
    lab.innerHTML = `${f.charAt(0).toUpperCase() + f.slice(1)}
      ${f === "beschrijving" ? `<textarea name="${f}" rows="3"></textarea>` :
                               `<input name="${f}" />`}`;
    form.appendChild(lab);
  }

  const submit = document.createElement("button");
  submit.textContent = `Toevoegen aan ${typeDef.label}`;
  form.appendChild(submit);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {};
    for (const f of typeDef.fields) {
      data[f] = form.elements[f].value.trim();
    }
    if (!data.naam || data.naam.length < 2) {
      alert("Geef minstens een geldige naam.");
      return;
    }
    try {
      await apiPost(typeDef.key, data);
      form.reset();
      await refreshTable(typeDef.key);
    } catch (err) {
      console.error(err);
      alert("Opslaan mislukt. Kijk console/logs.");
    }
  });

  return form;
}

function buildTable(type) {
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <table>
      <thead><tr><th>Naam</th><th class="muted">Extra</th><th></th></tr></thead>
      <tbody id="tbody-${type}">
        <tr><td colspan="3" class="muted">Laden…</td></tr>
      </tbody>
    </table>`;
  return wrap;
}

async function refreshTable(type) {
  const tbody = document.getElementById(`tbody-${type}`);
  if (!tbody) return;
  try {
    const items = await apiGet(type);
    if (!Array.isArray(items) || items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" class="muted">Nog geen items.</td></tr>`;
      return;
    }
    tbody.innerHTML = "";
    for (const it of items) {
      const tr = document.createElement("tr");
      const extra = Object.entries(it)
        .filter(([k]) => k !== "id" && k !== "naam")
        .map(([k, v]) => `<div><strong>${k}:</strong> ${String(v ?? "")}</div>`)
        .join("");

      tr.innerHTML = `
        <td>${it.naam ?? ""}</td>
        <td class="muted">${extra || "-"}</td>
        <td><button class="danger" data-id="${it.id}">Verwijderen</button></td>
      `;
      tr.querySelector("button.danger").addEventListener("click", async () => {
        if (!confirm(`Verwijderen: “${it.naam}”?`)) return;
        try {
          await apiDelete(type, it.id);
          await refreshTable(type);
        } catch (err) {
          console.error(err);
          alert("Verwijderen mislukt.");
        }
      });
      tbody.appendChild(tr);
    }
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="3" class="muted">Fout bij laden.</td></tr>`;
  }
}

function selectTab(key) {
  // activeer tabknop
  tabsEl.querySelectorAll("button").forEach(b => {
    b.classList.toggle("active", b.dataset.key === key);
  });
  // activeer panel
  panelsEl.querySelectorAll(".panel").forEach(p => {
    p.classList.toggle("active", p.dataset.key === key);
  });
  // initial refresh
  refreshTable(key);
}

function init() {
  // Tabs
  TYPES.forEach(t => {
    const btn = document.createElement("button");
    btn.textContent = t.label;
    btn.dataset.key = t.key;
    btn.addEventListener("click", () => selectTab(t.key));
    tabsEl.appendChild(btn);
  });

  // Panels (form + table)
  TYPES.forEach(t => {
    const panel = document.createElement("div");
    panel.className = "panel";
    panel.dataset.key = t.key;

    const h2 = document.createElement("h2");
    h2.textContent = t.label;
    panel.appendChild(h2);

    panel.appendChild(buildForm(t));
    panel.appendChild(buildTable(t));

    panelsEl.appendChild(panel);
  });

  // default tab
  selectTab(TYPES[0].key);
}

document.addEventListener("DOMContentLoaded", init);
