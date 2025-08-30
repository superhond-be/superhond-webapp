// ------------------------------
// Kleine util helpers
// ------------------------------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const setText = (el, txt) => (el.textContent = txt ?? "");

// Timestamp footer
function showUpdatedStamp() {
  const stamp = new Date().toLocaleString("nl-BE", {
    dateStyle: "short",
    timeStyle: "medium",
  });
  setText($("#lastUpdated"), `Laatste update: ${stamp}`);
}
showUpdatedStamp();

// API endpoints (zoals in jouw backend)
const API = {
  health: "/api/health",
  settings: "/api/settings",
  customers: "/api/customers",
  dogs: "/api/dogs",
  register: "/api/register", // gecombineerde route (klant + hond). Fallback implementeren we ook.
  passes: "/api/passes",
  bookings: "/api/bookings",
};

// ------------------------------
// Tabbed navigation
// ------------------------------
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".tab-btn");
  if (!btn) return;

  // active knop
  $$(".tab-btn").forEach((b) => b.classList.toggle("active", b === btn));

  // panels
  const target = btn.dataset.tab;
  $$(".tab-panel").forEach((p) => {
    p.hidden = p.id !== target;
  });

  // lazy load inhoud per tab
  if (target === "customers") loadCustomers();
  if (target === "dogs") loadDogs();
  if (target === "passes") loadPasses();
  if (target === "bookings") loadBookings();
  if (target === "settings") loadSettings();
  if (target === "overview") loadOverview();
});

// ------------------------------
// Klanten + Hond registreren
// ------------------------------
$("#registerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = $("#registerMsg");
  setText(msg, "Bezig met registreren…");

  const form = new FormData(e.currentTarget);
  const payload = {
    customer: {
      name: form.get("customer_name")?.trim(),
      email: form.get("customer_email")?.trim(),
      phone: form.get("customer_phone")?.trim(),
      address: form.get("customer_address")?.trim(),
    },
    dog: {
      name: form.get("dog_name")?.trim(),
      breed: form.get("dog_breed")?.trim(),
      birthdate: form.get("dog_birthdate") || null,
      gender: form.get("dog_gender") || "",
      vaccination_status: form.get("vaccination_status")?.trim(),
      vaccination_book_ref: form.get("vaccination_book_ref")?.trim(),
      vet_phone: form.get("vet_phone")?.trim(),
      emergency_phone: form.get("emergency_phone")?.trim(),
      vet_name: form.get("vet_name")?.trim(),
    },
  };

  try {
    // 1) Probeer gecombineerde /api/register
    let r = await fetch(API.register, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Als jouw backend deze route nog niet heeft, vang 404/405 af en doe 2-staps fallback
    if (!r.ok && (r.status === 404 || r.status === 405)) {
      // 2a) klant aanmaken
      const rc = await fetch(API.customers, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload.customer),
      });
      if (!rc.ok) throw new Error("Klant kon niet worden aangemaakt.");
      const createdCustomer = await rc.json();

      // 2b) hond koppelen aan klant
      const rd = await fetch(`${API.dogs}/${createdCustomer.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload.dog),
      });
      if (!rd.ok) throw new Error("Hond kon niet worden gekoppeld.");
      r = rd;
    }

    if (!r.ok) {
      const t = await r.text();
      throw new Error(t || "Registratie mislukt.");
    }

    setText(msg, "✅ Registratie geslaagd.");
    e.currentTarget.reset();
    loadCustomers();
    loadDogs();
    showUpdatedStamp();
  } catch (err) {
    setText(msg, `❌ ${err.message || err}`);
  }
});

$("#reloadCustomers")?.addEventListener("click", () => {
  loadCustomers().then(showUpdatedStamp);
});

async function loadCustomers() {
  const ul = $("#customersList");
  if (!ul) return;
  ul.innerHTML = "<li class='muted'>Laden…</li>";

  try {
    const r = await fetch(API.customers);
    if (!r.ok) throw new Error("Kon klanten niet laden.");
    const items = await r.json();

    if (!Array.isArray(items) || items.length === 0) {
      ul.innerHTML = "<li class='muted'>Geen klanten gevonden.</li>";
      return;
    }

    ul.innerHTML = items
      .map((c) => {
        const dogs = (c.dogs || []).map((d) => d.name).join(", ");
        return `<li>
          <strong>${escapeHtml(c.name || "Onbekend")}</strong>
          <span class="muted">(${escapeHtml(c.email || "—")})</span>
          ${dogs ? `<div class="tiny">Honden: ${escapeHtml(dogs)}</div>` : ""}
        </li>`;
      })
      .join("");
  } catch (err) {
    ul.innerHTML = `<li class="error">❌ ${escapeHtml(err.message || err)}</li>`;
  }
}

// ------------------------------
// Honden
// ------------------------------
$("#reloadDogs")?.addEventListener("click", () => {
  loadDogs().then(showUpdatedStamp);
});

async function loadDogs() {
  const ul = $("#dogsList");
  if (!ul) return;
  ul.innerHTML = "<li class='muted'>Laden…</li>";

  try {
    // We halen zowel honden als klanten (om eigenaar-naam te tonen)
    const [dogsRes, customersRes] = await Promise.all([
      fetch(API.dogs),
      fetch(API.customers),
    ]);
    if (!dogsRes.ok) throw new Error("Kon honden niet laden.");
    const dogs = await dogsRes.json();
    const customers = customersRes.ok ? await customersRes.json() : [];

    const byId =
      Array.isArray(customers) &&
      customers.reduce((acc, c) => ((acc[c.id] = c), acc), {});

    if (!Array.isArray(dogs) || dogs.length === 0) {
      ul.innerHTML = "<li class='muted'>Geen honden gevonden.</li>";
      return;
    }

    ul.innerHTML = dogs
      .map((d) => {
        const ownerName = byId && byId[d.ownerId] ? byId[d.ownerId].name : "—";
        return `<li>
          <strong>${escapeHtml(d.name || "Onbekend")}</strong>
          <span class="muted">(${escapeHtml(d.breed || "ras n/b")})</span>
          <div class="tiny">Eigenaar: ${escapeHtml(ownerName)}</div>
        </li>`;
      })
      .join("");
  } catch (err) {
    ul.innerHTML = `<li class="error">❌ ${escapeHtml(err.message || err)}</li>`;
  }
}

// ------------------------------
// Strippenkaarten (placeholder)
// ------------------------------
$("#reloadPasses")?.addEventListener("click", () => {
  loadPasses().then(showUpdatedStamp);
});

async function loadPasses() {
  const ul = $("#passesList");
  if (!ul) return;
  ul.innerHTML = "<li class='muted'>Laden…</li>";
  try {
    const r = await fetch(API.passes);
    const items = r.ok ? await r.json() : [];
    if (!Array.isArray(items) || items.length === 0) {
      ul.innerHTML = "<li class='muted'>Nog geen strippenkaarten.</li>";
      return;
    }
    ul.innerHTML = items
      .map(
        (p) => `<li><strong>${escapeHtml(p.name || "Kaart")}</strong>
          <span class="muted">(${p.credits ?? "?"} strips)</span></li>`
      )
      .join("");
  } catch (err) {
    ul.innerHTML = `<li class="error">❌ ${escapeHtml(err.message || err)}</li>`;
  }
}

// ------------------------------
// Inschrijvingen (placeholder)
// ------------------------------
$("#reloadBookings")?.addEventListener("click", () => {
  loadBookings().then(showUpdatedStamp);
});

async function loadBookings() {
  const ul = $("#bookingsList");
  if (!ul) return;
  ul.innerHTML = "<li class='muted'>Laden…</li>";
  try {
    const r = await fetch(API.bookings);
    const items = r.ok ? await r.json() : [];
    if (!Array.isArray(items) || items.length === 0) {
      ul.innerHTML = "<li class='muted'>Nog geen inschrijvingen.</li>";
      return;
    }
    ul.innerHTML = items
      .map(
        (b) =>
          `<li><strong>${escapeHtml(b.title || "Inschrijving")}</strong> <span class="muted">${escapeHtml(
            b.date || ""
          )}</span></li>`
      )
      .join("");
  } catch (err) {
    ul.innerHTML = `<li class="error">❌ ${escapeHtml(err.message || err)}</li>`;
  }
}

// ------------------------------
// Instellingen (read-only)
// ------------------------------
$("#reloadSettings")?.addEventListener("click", () => {
  loadSettings().then(showUpdatedStamp);
});

async function loadSettings() {
  const dl = $("#settingsDl");
  if (!dl) return;
  dl.innerHTML = "<div class='muted'>Laden…</div>";
  try {
    const r = await fetch(API.settings);
    if (!r.ok) throw new Error("Kon instellingen niet laden.");
    const s = await r.json();

    const items = [
      ["Organisatie", s.org],
      ["E-mail", s.email],
      ["Telefoon", s.phone],
      ["Website", s.website],
      ["Adres", formatAddress(s.address)],
      ["Huisstijl (primaire kleur)", s.branding?.primaryColor],
    ];

    dl.innerHTML = items
      .map(
        ([k, v]) =>
          `<div class="row"><dt>${escapeHtml(k)}</dt><dd>${escapeHtml(
            v ?? "—"
          )}</dd></div>`
      )
      .join("");
  } catch (err) {
    dl.innerHTML = `<div class="error">❌ ${escapeHtml(err.message || err)}</div>`;
  }
}

function formatAddress(a) {
  if (!a) return "";
  const parts = [a.street, a.nr, a.city, a.zip, a.country].filter(Boolean);
  return parts.join(", ");
}

// ------------------------------
// Overzicht
// ------------------------------
$("#reloadOverview")?.addEventListener("click", () => {
  loadOverview().then(showUpdatedStamp);
});

async function loadOverview() {
  const box = $("#overviewStats");
  if (!box) return;
  box.innerHTML = "<div class='muted'>Laden…</div>";

  try {
    const [cRes, dRes] = await Promise.all([fetch(API.customers), fetch(API.dogs)]);
    const customers = cRes.ok ? await cRes.json() : [];
    const dogs = dRes.ok ? await dRes.json() : [];

    const cards = [
      { label: "Klanten", value: (customers || []).length },
      { label: "Honden", value: (dogs || []).length },
      // meer stats later (strippenkaarten/inschrijvingen)
    ];

    box.innerHTML = cards
      .map(
        (c) => `<div class="stat-card">
          <div class="value">${c.value}</div>
          <div class="label">${escapeHtml(c.label)}</div>
        </div>`
      )
      .join("");
  } catch (err) {
    box.innerHTML = `<div class="error">❌ ${escapeHtml(err.message || err)}</div>`;
  }
}

// ------------------------------
// Opstart: laad standaard de klanten-tab
// ------------------------------
loadCustomers();

// ------------------------------
// Kleine XSS-veilige helper
// ------------------------------
function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
