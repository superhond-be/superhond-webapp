/* public/Js/les-instellingen.js v0903k */
console.log("les-instellingen.js geladen v0903k");

// ---- helpers ---------------------------------------------------
const $ = (s, r=document) => r.querySelector(s);

async function j(url) {
  const r = await fetch(url, { headers: { "cache-control": "no-cache" } });
  if (!r.ok) throw new Error(`${url} → ${r.status}`);
  return r.json();
}
async function jSend(url, method, body) {
  const r = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  if (!r.ok) {
    let msg = r.statusText;
    try { const e = await r.json(); msg = e.error || msg; } catch {}
    throw new Error(`${method} ${url} → ${r.status} ${msg}`);
  }
  return r.json();
}
function download(name, content, mime="application/json") {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], {type: mime}));
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// ---- Lestypes CRUD ---------------------------------------------
let LESTYPES = [];

function emptyRow(text, colspan) {
  return `<tr class="placeholder"><td colspan="${colspan}" style="text-align:center;color:#777;">${text}</td></tr>`;
}

function renderLestypes() {
  const tbody = $("#tbl-lestypes tbody");
  if (!LESTYPES.length) { tbody.innerHTML = emptyRow("Nog geen lestypes toegevoegd.", 7); return; }

  tbody.innerHTML = LESTYPES.map(t => `
    <tr data-id="${t.id}">
      <td>${t.naam || ""}</td>
      <td>${t.aantal_lessen ?? ""}</td>
      <td>${t.lesduur_min ?? ""}</td>
      <td>${t.geldigheid_m ?? ""}</td>
      <td>${t.max_deelnemers ?? ""}</td>
      <td>${t.beschrijving ? String(t.beschrijving).slice(0,120) : ""}</td>
      <td class="t-actions">
        <button class="icon-btn edit" title="Bewerken">✏️</button>
        <button class="icon-btn delete" title="Verwijderen">🗑️</button>
      </td>
    </tr>
  `).join("");

  // koppel events elke render
  $("#tbl-lestypes tbody").onclick = (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const tr = e.target.closest("tr");
    const id = tr?.dataset.id;
    if (!id) return;

    if (btn.classList.contains("edit")) {
      const row = LESTYPES.find(x => x.id === id);
      if (row) fillForm(row);
    }
    if (btn.classList.contains("delete")) onDeleteLestype(id);
  };
}

async function loadLestypes() {
  LESTYPES = await j("/api/les-types");
  renderLestypes();
}

function clearForm() {
  $("#lt-id").value = "";
  $("#lt-naam").value = "";
  $("#lt-aantal").value = "";
  $("#lt-duur").value = "";
  $("#lt-geldig").value = "";
  $("#lt-max").value = "";
  $("#lt-beschrijving").value = "";
}

function fillForm(row) {
  $("#lt-id").value = row.id || "";
  $("#lt-naam").value = row.naam || "";
  $("#lt-aantal").value = row.aantal_lessen ?? "";
  $("#lt-duur").value = row.lesduur_min ?? "";
  $("#lt-geldig").value = row.geldigheid_m ?? "";
  $("#lt-max").value = row.max_deelnemers ?? "";
  $("#lt-beschrijving").value = row.beschrijving ?? "";
}

async function onSubmitLestype(e) {
  e.preventDefault();
  const body = {
    naam: $("#lt-naam").value.trim(),
    aantal_lessen: Number($("#lt-aantal").value || 0),
    lesduur_min: Number($("#lt-duur").value || 0),
    geldigheid_m: Number($("#lt-geldig").value || 0),
    max_deelnemers: Number($("#lt-max").value || 0),
    beschrijving: $("#lt-beschrijving").value.trim(),
  };
  const id = $("#lt-id").value.trim();

  try {
    if (id) {
      const updated = await jSend(`/api/les-types/${encodeURIComponent(id)}`, "PUT", body);
      const i = LESTYPES.findIndex(x => x.id === id);
      if (i !== -1) LESTYPES[i] = updated;
    } else {
      const created = await jSend("/api/les-types", "POST", body);
      LESTYPES.push(created);
    }
    renderLestypes();
    clearForm();
  } catch (err) {
    alert("Opslaan mislukt: " + err.message);
  }
}

async function onDeleteLestype(id) {
  if (!confirm("Lestype verwijderen?")) return;
  try {
    await jSend(`/api/les-types/${encodeURIComponent(id)}`, "DELETE");
    LESTYPES = LESTYPES.filter(t => t.id !== id);
    renderLestypes();
  } catch (err) {
    alert("Verwijderen mislukt: " + err.message);
  }
}

// Form actions
$("#form-lestype")?.addEventListener("submit", onSubmitLestype);
$("#lt-nieuw")?.addEventListener("click", clearForm);

// Export / Import
$("#lt-export")?.addEventListener("click", () => {
  download("les-types-export.json", JSON.stringify(LESTYPES, null, 2));
});
$("#lt-import")?.addEventListener("click", () => $("#lt-file").click());
$("#lt-file")?.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  const arr = JSON.parse(text);
  if (!Array.isArray(arr)) return alert("Onverwacht bestand");
  for (const row of arr) {
    const { id, ...rest } = row;
    const created = await jSend("/api/les-types", "POST", rest);
    LESTYPES.push(created);
  }
  renderLestypes();
  alert("Geïmporteerd.");
});

// ---- Eenmalige migratie uit localStorage -----------------------
(function restoreOldLestypesOnce() {
  try {
    const OLD_KEYS = [
      "lestypes", "les_types", "superhond_lestypes", "sh_lestypes",
      "settings.lestypes", "superhond.settings.lestypes"
    ];

    function looksLikeLestypes(arr) {
      return Array.isArray(arr) && arr.some(o =>
        o && typeof o === "object" && (
          "naam" in o || "aantal_lessen" in o || "max_deelnemers" in o
        )
      );
    }

    let found = null, foundKey = null;
    for (const k of OLD_KEYS) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      try {
        const val = JSON.parse(raw);
        if (looksLikeLestypes(val)) { found = val; foundKey = k; break; }
      } catch {}
    }
    if (!found) return;

    const host = document.querySelector("#sect-lestype .card") || document.body;
    const wrap = document.createElement("div");
    wrap.style.cssText = "background:#e8f6ff;border:1px solid #9ed4ff;border-radius:8px;padding:10px;margin:8px 0;";
    wrap.innerHTML = `
      <b>Oude Lestypes gevonden</b> (bron: <code>${foundKey}</code>) –
      <button id="btn-restore-lestypes" class="btn" style="margin-left:6px">Herstellen</button>
      <span style="color:#666;margin-left:6px">(eenmalig)</span>`;
    host.prepend(wrap);

    document.getElementById("btn-restore-lestypes").addEventListener("click", async () => {
      try {
        for (const row of found) {
          const { id, ...rest } = row;
          const created = await jSend("/api/les-types", "POST", rest);
          LESTYPES.push(created);
        }
        renderLestypes();
        wrap.innerHTML = `<b>Herstel voltooid.</b> Je lestypes zijn teruggezet.`;
      } catch (e) {
        alert("Herstellen mislukt: " + e.message);
      }
    });
  } catch (e) {
    console.warn("Restore helper faalde:", e);
  }
})();

// Init
loadLestypes().catch(e => console.error(e));
