/* public/Js/email-templates.js v0903t */
console.log("email-templates.js geladen v0903t");

const $ = (s) => document.querySelector(s);

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
    try {
      const e = await r.json();
      msg = e.error || msg;
    } catch {}
    throw new Error(`${method} ${url} → ${r.status} ${msg}`);
  }
  return r.json();
}

let TEMPLATES = [];

function render() {
  const tbody = $("#tbl-templates tbody");
  if (!TEMPLATES.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#777;">Geen templates gevonden.</td></tr>`;
    return;
  }

  tbody.innerHTML = TEMPLATES.map(
    (t) => `
    <tr data-id="${t.id}">
      <td>${t.naam}</td>
      <td>${t.categorie}</td>
      <td>${t.trigger}</td>
      <td>${t.onderwerp}</td>
      <td class="t-actions">
        <button class="icon-btn edit">✏️</button>
        <button class="icon-btn delete">🗑️</button>
      </td>
    </tr>`
  ).join("");
}

async function loadAll() {
  TEMPLATES = await j("/api/email-templates");
  render();
}

function openModal(title, tpl) {
  $("#modal-title").textContent = title;
  $("#form-tpl").reset();
  $("#form-tpl").id.value = tpl?.id || "";
  $("#f-naam").value = tpl?.naam || "";
  $("#f-cat").value = tpl?.categorie || "Algemeen";
  $("#f-trigger").value = tpl?.trigger || "";
  $("#f-onderwerp").value = tpl?.onderwerp || "";
  $("#f-inhoud").value = tpl?.inhoud_html || "";
  document.getElementById("modal-tpl").classList.add("open");
}
function closeModal() {
  document.getElementById("modal-tpl").classList.remove("open");
}

async function onSubmit(e) {
  e.preventDefault();
  const f = e.currentTarget;
  const payload = Object.fromEntries(new FormData(f).entries());
  const body = {
    naam: payload.naam,
    categorie: payload.categorie,
    trigger: payload.trigger,
    onderwerp: payload.onderwerp,
    inhoud_html: payload.inhoud,
  };
  try {
    if (!payload.id) {
      const created = await jSend("/api/email-templates", "POST", body);
      TEMPLATES.push(created);
    } else {
      const updated = await jSend(
        `/api/email-templates/${encodeURIComponent(payload.id)}`,
        "PUT",
        body
      );
      const i = TEMPLATES.findIndex((x) => x.id === payload.id);
      if (i !== -1) TEMPLATES[i] = updated;
    }
    closeModal();
    render();
  } catch (err) {
    alert("Opslaan mislukt: " + err.message);
  }
}

async function onDelete(id) {
  if (!confirm("Template verwijderen?")) return;
  try {
    await jSend(`/api/email-templates/${encodeURIComponent(id)}`, "DELETE");
    TEMPLATES = TEMPLATES.filter((t) => t.id !== id);
    render();
  } catch (err) {
    alert("Verwijderen mislukt: " + err.message);
  }
}

/* init */
(async function () {
  await loadAll();

  $("#btn-new").addEventListener("click", () => openModal("Nieuwe template"));
  $("[data-close='modal-tpl']").addEventListener("click", closeModal);
  $("#form-tpl").addEventListener("submit", onSubmit);

  document.querySelector("#tbl-templates tbody").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = e.target.closest("tr").dataset.id;
    if (btn.classList.contains("edit")) {
      const tpl = TEMPLATES.find((t) => t.id === id);
      openModal("Template bewerken", tpl);
    }
    if (btn.classList.contains("delete")) onDelete(id);
  });
})();
