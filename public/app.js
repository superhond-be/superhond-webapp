// ------- helpers -------
async function apiJson(url, options) {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
const byId = (id) => document.getElementById(id);

// ------- referentiedata laden voor selects -------
async function fillLessonRefs() {
  const [lts, ths, locs] = await Promise.all([
    apiJson("/api/lesson-types"),
    apiJson("/api/themes"),
    apiJson("/api/locations"),
  ]);

  // Lestypes
  byId("ltSelect").innerHTML = lts.map(x => `<option value="${x.id}">${x.name}</option>`).join("");

  // Thema's (met lege optie al in HTML)
  const thSel = byId("thSelect");
  thSel.innerHTML = `<option value="">(geen)</option>` + ths.map(x => `<option value="${x.id}">${x.name}</option>`).join("");

  // Locaties
  byId("locSelect").innerHTML = locs.map(x => `<option value="${x.id}">${x.name}</option>`).join("");
}

// ------- KLASSEN -------
async function loadClasses() {
  const classes = await apiJson("/api/classes");
  // Voor leesbare namen ook referenties ophalen:
  const [lts, ths, locs] = await Promise.all([
    apiJson("/api/lesson-types"),
    apiJson("/api/themes"),
    apiJson("/api/locations"),
  ]);
  const ltById = Object.fromEntries(lts.map(x => [x.id, x.name]));
  const thById = Object.fromEntries(ths.map(x => [x.id, x.name]));
  const locById = Object.fromEntries(locs.map(x => [x.id, x.name]));

  byId("classesBody").innerHTML = classes.map(c => `
    <tr>
      <td>${c.id}</td>
      <td>${escapeHtml(c.name)}</td>
      <td>${ltById[c.lessonTypeId] || "-"}</td>
      <td>${c.themeId ? (thById[c.themeId] || "-") : "-"}</td>
      <td>${locById[c.locationId] || "-"}</td>
    </tr>
  `).join("");
}
byId("classForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = new FormData(e.currentTarget);
  await apiJson("/api/classes", {
    method: "POST",
    body: JSON.stringify({
      name: f.get("name"),
      lessonTypeId: Number(f.get("lessonTypeId")),
      themeId: f.get("themeId") ? Number(f.get("themeId")) : null,
      locationId: Number(f.get("locationId")),
      note: f.get("note")
    }),
  });
  e.currentTarget.reset();
  await loadClasses();
});
byId("reloadClasses")?.addEventListener("click", loadClasses);

// ------- LESSEN (SESSIONS) -------
async function fillClassSelects() {
  const classes = await apiJson("/api/classes");
  byId("classSelect").innerHTML = classes.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("");
  byId("sessionFilterClass").innerHTML = `<option value="">(alle)</option>` + classes.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("");
}

async function loadSessions() {
  const cls = byId("sessionFilterClass").value;
  const dt  = byId("sessionFilterDate").value;
  const qs = new URLSearchParams();
  if (cls) qs.set("classId", cls);
  if (dt)  qs.set("date", dt);

  const sessions = await apiJson(`/api/sessions${qs.toString() ? "?" + qs.toString() : ""}`);

  // toon klassennaam
  const classes = await apiJson("/api/classes");
  const byIdC = Object.fromEntries(classes.map(c => [c.id, c.name]));

  byId("sessionsBody").innerHTML = sessions.map(s => `
    <tr>
      <td>${s.id}</td>
      <td>${escapeHtml(byIdC[s.classId] || "-")}</td>
      <td>${s.date}</td>
      <td>${s.time}</td>
      <td>${s.capacity ?? "-"}</td>
    </tr>
  `).join("");
}

byId("sessionForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = new FormData(e.currentTarget);
  await apiJson("/api/sessions", {
    method: "POST",
    body: JSON.stringify({
      classId: Number(f.get("classId")),
      date: f.get("date"),
      time: f.get("time"),
      capacity: f.get("capacity") ? Number(f.get("capacity")) : null,
      note: f.get("note")
    }),
  });
  e.currentTarget.reset();
  await loadSessions();
});

byId("sessionFilterClass")?.addEventListener("change", loadSessions);
byId("sessionFilterDate")?.addEventListener("change", loadSessions);
byId("reloadSessions")?.addEventListener("click", loadSessions);

// ------- util -------
function escapeHtml(v){ return String(v ?? "").replace(/[<>&"]/g, s => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[s])); }

// ------- init (roep dit aan wanneer je tab opent, of direct bij load) -------
document.addEventListener("DOMContentLoaded", async () => {
  // selects klaarzetten
  try {
    await fillLessonRefs();
  } catch(e) { /* ignore als tab nog niet zichtbaar is */ }

  try {
    await loadClasses();
    await fillClassSelects();
    await loadSessions();
  } catch(e) { /* ignore on first load */ }
});
<!-- STRIPPENKAARTEN -->
<section id="tab-passes" class="tab">
  <h2>Strippenkaarten</h2>
  <form id="passForm" class="card">
    <div class="grid">
      <label>Klant (ID)
        <input name="customerId" type="number" required />
      </label>
      <label>Type (bv. puppy-9)
        <input name="type" placeholder="puppy-9" required />
      </label>
      <label>Totaal strips
        <input name="totalStrips" type="number" min="1" value="9" required />
      </label>
      <label>Geldig t/m
        <input name="expiresAt" type="date" />
      </label>
      <label class="grid span-2">Opmerking
        <input name="note" />
      </label>
    </div>
    <button class="primary">+ Kaart toevoegen</button>
  </form>

  <div class="toolbar">
    <label>Klant filter (ID)
      <input id="passCustomerFilter" type="number" />
    </label>
    <button id="reloadPasses">🔄 Herlaad</button>
  </div>

  <table class="list">
    <thead><tr>
      <th>#</th><th>Klant</th><th>Type</th><th>Totaal</th><th>Gebruikt</th><th>Gereserveerd</th><th>Beschikbaar</th><th>Geldig t/m</th><th>Actief</th>
    </tr></thead>
    <tbody id="passesBody"></tbody>
  </table>
</section>

<!-- INSCHRIJVINGEN -->
<section id="tab-bookings" class="tab">
  <h2>Inschrijvingen</h2>
  <form id="bookingForm" class="card">
    <div class="grid">
      <label>Les (sessionId)
        <input name="sessionId" type="number" required />
      </label>
      <label>Klant (customerId)
        <input name="customerId" type="number" required />
      </label>
      <label>Hond (dogId)
        <input name="dogId" type="number" />
      </label>
    </div>
    <button class="primary">+ Inschrijven (reserveer 1 strip)</button>
  </form>

  <div class="toolbar">
    <button id="reloadBookings">🔄 Herlaad</button>
  </div>

  <table class="list">
    <thead><tr><th>#</th><th>Les</th><th>Klant</th><th>Hond</th><th>Status</th><th>Acties</th></tr></thead>
    <tbody id="bookingsBody"></tbody>
  </table>

// --- Tabs wisselen ---
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".tab-btn");
  if (!btn) return;

  // active knop
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.toggle("active", b === btn));

  // panels
  const target = btn.dataset.tab;
  document.querySelectorAll(".tab-panel").forEach(p => {
    p.hidden = p.id !== target;
  });
});
  
</section>
