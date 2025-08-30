// public/app.js
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const setUpdated = () =>
  ($("#last-updated").textContent = `Laatste update: ${new Date()
    .toLocaleString()
    .replace(",", "")}`);

async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || res.statusText);
  }
  return res.json().catch(() => ({}));
}

/* ---------------- Tabs ---------------- */
function initTabs() {
  const map = {
    klanten: "#tab-klanten",
    honden: "#tab-honden",
    overzicht: "#tab-overzicht",
    instellingen: "#tab-instellingen",
  };
  $$(".tabs .tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".tabs .tab").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      $$(".tabpane").forEach((p) => p.classList.remove("is-visible"));
      $(map[btn.dataset.tab]).classList.add("is-visible");
      setUpdated();
    });
  });
}

/* ---------------- Klanten ---------------- */
async function loadCustomers() {
  const list = $("#customers-list");
  list.innerHTML = `<div class="muted">Laden…</div>`;
  const customers = await api("/api/customers");
  if (!customers.length) {
    list.innerHTML = `<div class="muted">Geen klanten gevonden.</div>`;
    fillCustomerSelect(customers);
    return;
  }

  list.innerHTML = "";
  customers.forEach((c) => {
    const passes = c.passes || [];
    const dogs = c.dogs || [];

    const el = document.createElement("div");
    el.className = "card";
    el.innerHTML = `
      <div class="card-head">
        <div>
          <strong>${escapeHTML(c.name)}</strong>
          <div class="sub">${escapeHTML(c.email || "—")} · ${escapeHTML(
      c.phone || "—"
    )}</div>
        </div>
        <div class="actions">
          <button class="btn" data-act="newpass">+ Strippenkaart</button>
          <button class="btn" data-act="refresh">↻</button>
        </div>
      </div>

      <div class="card-body">
        <div class="grid-two">
          <div>
            <h4>Honden</h4>
            ${
              dogs.length
                ? `<ul class="bullets">${dogs
                    .map(
                      (d) =>
                        `<li>${escapeHTML(d.name)} <span class="muted">(${escapeHTML(
                          d.breed || "-"
                        )})</span></li>`
                    )
                    .join("")}</ul>`
                : `<div class="muted">Nog geen honden</div>`
            }
          </div>
          <div>
            <h4>Strippenkaarten</h4>
            ${
              passes.length
                ? `<ul class="passes">${passes
                    .map(
                      (p) => `
                <li>
                  <div>
                    <strong>${escapeHTML(p.type)}</strong>
                    <div class="sub">${p.remaining}/${p.totalStrips} over</div>
                  </div>
                  <div>
                    <button class="btn small" data-act="use" data-pass="${p.id}">Gebruik strip</button>
                  </div>
                </li>`
                    )
                    .join("")}</ul>`
                : `<div class="muted">Geen strippenkaarten</div>`
            }
          </div>
        </div>
      </div>
    `;

    el.addEventListener("click", async (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;

      if (btn.dataset.act === "refresh") {
        await loadCustomers();
      }

      if (btn.dataset.act === "newpass") {
        const total = Number(prompt("Aantal strippen (bv. 10):", "10"));
        if (!total || total < 1) return;
        const type = prompt("Type (vrije tekst):", `${total}-beurten`) || `${total}-beurten`;
        try {
          await api(`/api/passes/${c.id}`, {
            method: "POST",
            body: JSON.stringify({ totalStrips: total, type }),
          });
          await loadCustomers();
        } catch (err) {
          alert("Mislukt: " + err.message);
        }
      }

      if (btn.dataset.act === "use") {
        const passId = btn.dataset.pass;
        try {
          await api(`/api/passes/${c.id}/${passId}/use`, { method: "POST" });
          await loadCustomers();
        } catch (err) {
          alert("Mislukt: " + err.message);
        }
      }
    });

    list.appendChild(el);
  });

  fillCustomerSelect(customers);
  setUpdated();
}

function fillCustomerSelect(customers) {
  const sel = $("#dog-customer-select");
  sel.innerHTML = customers
    .map((c) => `<option value="${c.id}">${escapeHTML(c.name)}</option>`)
    .join("");
}

/* ---- klant toevoegen ---- */
$("#form-add-customer")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.currentTarget);
  const payload = Object.fromEntries(fd.entries());
  try {
    await api("/api/customers", { method: "POST", body: JSON.stringify(payload) });
    e.currentTarget.reset();
    await loadCustomers();
  } catch (err) {
    alert("Mislukt: " + err.message);
  }
});
$("#btn-reload-customers")?.addEventListener("click", loadCustomers);

/* ---------------- Honden ---------------- */
async function loadDogs() {
  const list = $("#dogs-list");
  list.innerHTML = `<div class="muted">Laden…</div>`;
  // Toon alle honden
  const all = await api("/api/dogs");
  if (!all.length) {
    list.innerHTML = `<div class="muted">Nog geen honden geregistreerd.</div>`;
    return;
  }
  list.innerHTML = "";
  all.forEach((d) => {
    const row = document.createElement("div");
    row.className = "rowline";
    row.innerHTML = `
      <div><strong>${escapeHTML(d.name)}</strong> <span class="muted">(${escapeHTML(
      d.breed || "-"
    )})</span></div>
      <div class="muted">Eigenaar: ${escapeHTML(d.ownerName)} (#${d.ownerId})</div>
      <div class="muted">${escapeHTML(d.sex || "-")} · ${escapeHTML(d.birthDate || "")}</div>
    `;
    list.appendChild(row);
  });
  setUpdated();
}

$("#form-add-dog")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.currentTarget);
  const data = Object.fromEntries(fd.entries());
  const customerId = data.customerId;
  delete data.customerId;

  try {
    await api(`/api/dogs/${customerId}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    e.currentTarget.reset();
    await Promise.all([loadDogs(), loadCustomers()]);
  } catch (err) {
    alert("Mislukt: " + err.message);
  }
});
$("#btn-reload-dogs")?.addEventListener("click", loadDogs);

/* ---------------- Utils ---------------- */
function escapeHTML(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/* ---------------- Init ---------------- */
initTabs();
loadCustomers().then(loadDogs);
setUpdated();
