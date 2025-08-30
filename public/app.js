/* ========= Admin: sessies & deelnemers ========= */

// Demo-klanten (zoals eerder gebruikt)
const adminDemoClients = [
  { id: 1, name: "Jan Janssens" },
  { id: 2, name: "Sofie Peeters" },
];

let ADMIN_SELECTED_SESSION = null;

async function adminLoadClassesIntoFilter() {
  const classes = await api("/classes");
  const sel = document.getElementById("adminClassFilter");
  sel.innerHTML = '<option value="">(alle klassen)</option>';
  classes.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = `${c.name} (#${c.id})`;
    sel.appendChild(opt);
  });
}

function adminLoadClientChoices() {
  const sel = document.getElementById("adminClientSelect");
  sel.innerHTML = adminDemoClients.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
}

async function adminList(kind) {
  const map = {
    "lesson-types": "/api/lesson-types",
    "themes": "/api/themes",
    "locations": "/api/locations",
  };
  const url = map[kind];
  const res = await fetch(url);
  const data = await res.json();
  const el = document.getElementById("admin-list") || document.body.appendChild(Object.assign(document.createElement('pre'), { id: 'admin-list' }));
  el.textContent = JSON.stringify(data, null, 2);
}

async function adminLoadSessions() {
  const ul = document.getElementById("adminSessionsList");
  const classId = document.getElementById("adminClassFilter").value;
  const path = classId ? `/sessions?classId=${encodeURIComponent(classId)}` : "/sessions";
  const sessions = await api(path);
  ul.innerHTML = "";

  if (!sessions.length) {
    ul.innerHTML = "<li class='muted'>(geen sessies)</li>";
    return;
  }

  sessions.forEach(s => {
    const li = document.createElement("li");
    li.className = "row";
    const time = s.end ? `${s.start}–${s.end}` : s.start;
    li.innerHTML = `
      <div>
        <div><strong>${s.date}</strong> ${time}</div>
        <small>Klas #${s.classId}${s.location ? " · " + s.location : ""}${s.capacity ? " · max " + s.capacity : ""}</small>
      </div>
      <div>
        <button type="button" class="btn-secondary">Details</button>
      </div>
    `;
    li.querySelector("button").onclick = () => adminShowSessionDetails(s);
    ul.appendChild(li);
  });
}

async function adminShowSessionDetails(session) {
  ADMIN_SELECTED_SESSION = session;

  // header
  const header = document.getElementById("adminSessionHeader");
  const time = session.end ? `${session.start}–${session.end}` : session.start;
  header.className = "card";
  header.innerHTML = `
    <div><strong>Sessie #${session.id}</strong></div>
    <div>${session.date} · ${time} · Klas #${session.classId}${session.location ? " · " + session.location : ""}${session.capacity ? " · max " + session.capacity : ""}</div>
  `;

  // snel boeken zichtbaar maken
  document.getElementById("adminQuickBook").style.display = "";

  // deelnemers renderen
  await adminRenderBookingsList(session.id);
}

async function adminRenderBookingsList(sessionId) {
  const ul = document.getElementById("adminBookingsList");
  const bookings = await api(`/bookings?sessionId=${sessionId}`);
  ul.innerHTML = "";

  if (!bookings.length) {
    ul.innerHTML = "<li class='muted'>(nog geen deelnemers)</li>";
    return;
  }

  bookings.forEach(b => {
    const li = document.createElement("li");
    li.className = "row";
    const client = adminDemoClients.find(c => c.id === b.clientId);
    const name = client ? client.name : `Klant #${b.clientId}`;

    // badge kleur
    const badge = (status) =>
      `<span class="badge ${status === "RESERVED" ? "blue" : status === "ATTENDED" ? "green" : status === "CANCELLED" ? "orange" : ""}">${status}</span>`;

    li.innerHTML = `
      <div>
        <strong>${name}</strong> · ${badge(b.status)}
        <div class="muted">Boeking #${b.id}${b.classId ? " · Klas #" + b.classId : ""}</div>
      </div>
      <div class="actions"></div>
    `;

    const actions = li.querySelector(".actions");
    if (b.status === "RESERVED") {
      const btnAttend = document.createElement("button");
      btnAttend.textContent = "Aanwezig";
      btnAttend.onclick = async () => {
        try {
          await api(`/bookings/${b.id}/attend`, { method: "POST" });
          await adminRenderBookingsList(sessionId);
        } catch (e) {
          alert("Markeren mislukt: " + e.message);
        }
      };

      const btnCancel = document.createElement("button");
      btnCancel.textContent = "Afmelden";
      btnCancel.className = "btn-secondary";
      btnCancel.onclick = async () => {
        try {
          await api(`/bookings/${b.id}/cancel`, { method: "POST" });
          await adminRenderBookingsList(sessionId);
        } catch (e) {
          alert("Annuleren mislukt: " + e.message);
        }
      };

      actions.append(btnAttend, btnCancel);
    }

    ul.appendChild(li);
  });
}

/* init voor admin */
async function initAdmin() {
  await adminLoadClassesIntoFilter();
  adminLoadClientChoices();
  await adminLoadSessions();

  document.getElementById("adminClassFilter").addEventListener("change", adminLoadSessions);
  document.getElementById("adminReload").addEventListener("click", adminLoadSessions);

  // snel boeken
  document.getElementById("adminBookBtn").addEventListener("click", async () => {
    if (!ADMIN_SELECTED_SESSION) return alert("Kies eerst links een sessie.");
    const clientId = Number(document.getElementById("adminClientSelect").value);
    try {
      await api("/bookings", {
        method: "POST",
        body: JSON.stringify({ clientId, sessionId: ADMIN_SELECTED_SESSION.id })
      });
      await adminRenderBookingsList(ADMIN_SELECTED_SESSION.id);
      alert("Geboekt!");
    } catch (e) {
      alert("Boeken mislukt: " + e.message);
    }
  });
}

async function api(path, opts = {}) {
  const res = await fetch("/api" + path, {
    headers: { "Content-Type": "application/json" },
    ...opts
  });
  if (!res.ok) throw new Error((await res.text()) || res.statusText);
  return res.json();
}

/* ---------- KLASSEN ---------- */
async function loadSessionsAdmin() {
  const ul = document.getElementById("sessionsAdmin");
  const sessions = await api("/sessions");
  ul.innerHTML = "";

  sessions.forEach(s => {
    const li = document.createElement("li");
    li.innerHTML = `${s.date} ${s.start} (Klas ${s.classId}) 
      <button>Details</button>`;
    li.querySelector("button").onclick = () => showSessionDetails(s.id);
    ul.appendChild(li);
  });
}

async function showSessionDetails(sessionId) {
  const div = document.getElementById("sessionDetails");
  const bookings = await api(`/bookings?sessionId=${sessionId}`);
  div.innerHTML = "<h3>Deelnemers</h3><ul></ul>";
  const ul = div.querySelector("ul");

  bookings.forEach(b => {
    const li = document.createElement("li");
    li.textContent = `Klant ${b.clientId} → ${b.status}`;

    if (b.status === "RESERVED") {
      const att = document.createElement("button");
      att.textContent = "Aanwezig";
      att.onclick = async () => {
        await api(`/bookings/${b.id}/attend`, { method: "POST" });
        showSessionDetails(sessionId);
      };
      const canc = document.createElement("button");
      canc.textContent = "Afmelden";
      canc.onclick = async () => {
        await api(`/bookings/${b.id}/cancel`, { method: "POST" });
        showSessionDetails(sessionId);
      };
      li.appendChild(att);
      li.appendChild(canc);
    }

    ul.appendChild(li);
  });
}
async function loadClasses() {
  const classes = await api("/classes");
  const ul = document.getElementById("classesList");
  const select = document.getElementById("classSelect");
  const filterSelect = document.getElementById("filterClass");

  ul.innerHTML = "";
  select.innerHTML = '<option value="">Kies klas...</option>';
  filterSelect.innerHTML = '<option value="">(alle klassen)</option>';

  classes.forEach(c => {
    // lijst
    const li = document.createElement("li");
    li.textContent = `${c.id}. ${c.name} — ${c.maxLessons} credits • ${c.validityMonths} mnd • ${c.description || "-"}`;
    const del = document.createElement("button");
    del.textContent = "❌";
    del.style.marginLeft = "8px";
    del.onclick = async () => {
      if (!confirm(`Klas "${c.name}" verwijderen?`)) return;
      await api(`/classes/${c.id}`, { method: "DELETE" });
      await loadClasses();
      await loadSessions(); // ook sessielijst herladen i.v.m. filter
    };
    li.appendChild(del);
    ul.appendChild(li);

    // selects
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.name;
    select.appendChild(opt);

    const opt2 = opt.cloneNode(true);
    filterSelect.appendChild(opt2);
  });
}

async function submitClass(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = {
    name: fd.get("name"),
    description: fd.get("description") || "",
    maxLessons: Number(fd.get("maxLessons")),
    validityMonths: Number(fd.get("validityMonths"))
  };
  await api("/classes", { method: "POST", body: JSON.stringify(payload) });
  e.target.reset();
  await loadClasses();
}

/* ---------- SESSIES ---------- */
async function loadSessions() {
  const filterClass = document.getElementById("filterClass").value;
  const path = filterClass ? `/sessions?classId=${encodeURIComponent(filterClass)}` : "/sessions";
  const sessions = await api(path);
  const ul = document.getElementById("sessionsList");
  ul.innerHTML = "";

  if (!sessions.length) {
    ul.innerHTML = "<li>(geen sessies)</li>";
    return;
  }

  sessions.forEach(s => {
    const li = document.createElement("li");
    const time = s.end ? `${s.start}–${s.end}` : s.start;
    li.textContent = `${s.id}. [Klas #${s.classId}] ${s.date} ${time} @ ${s.location || "-"}`;

    const del = document.createElement("button");
    del.textContent = "❌";
    del.style.marginLeft = "8px";
    del.onclick = async () => {
      if (!confirm(`Sessie #${s.id} verwijderen?`)) return;
      await api(`/sessions/${s.id}`, { method: "DELETE" });
      await loadSessions();
    };
    li.appendChild(del);
    ul.appendChild(li);
  });
}

async function submitSession(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = {
    classId: Number(fd.get("classId")),
    date: fd.get("date"),
    start: fd.get("start"),
    end: fd.get("end") || "",
    location: fd.get("location") || ""
  };
  await api("/sessions", { method: "POST", body: JSON.stringify(payload) });
  e.target.reset();
  await loadSessions();
}

/* ---------- INIT ---------- */ 
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("classForm").addEventListener("submit", submitClass);
  document.getElementById("sessionForm").addEventListener("submit", submitSession);
  document.getElementById("filterClass").addEventListener("change", loadSessions);
  document.getElementById("clearFilter").addEventListener("click", () => {
    document.getElementById("filterClass").value = "";
    loadSessions();
  });

  loadClasses().then(loadSessions);
});
document.addEventListener("DOMContentLoaded", () => {
  // hier start je bestaande init-code

  initClasses();   // laad klassenlijst
  initSessions();  // laad sessies
  // ...

  // voeg deze regel erbij
  initAdmin();     // laad ook de admin-sectie
});
// Eenvoudige fetch-helper (laat deze staan als je al een api() functie hebt)
async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...opts
  });
  if (!res.ok) {
    // probeer leesbare fout terug te geven
    let msg = `${res.status} ${res.statusText}`;
    try {
      const j = await res.json();
      if (j && j.error) msg = j.error;
    } catch (_) {}
    throw new Error(msg);
  }
  // probeer JSON, val terug op text
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();

  // Admin state
let ADMIN_SELECTED_SESSION = null;

// Tijdelijke klantenlijst (vervang later door /api/clients)
const adminDemoClients = [
  { id: 1, name: "Jan Janssens" },
  { id: 2, name: "Sofie Peeters" },
  { id: 3, name: "Kurt Maes" },
];
  /* ========= Admin: sessies & deelnemers ========= */

async function adminLoadClassesIntoFilter() {
  // verwacht endpoint: GET /api/classes  -> [{id, name}, ...]
  const classes = await api("/api/classes");
  const sel = document.getElementById("adminClassFilter");
  sel.innerHTML = '<option value="">(alle klassen)</option>';
  classes.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.name || `Klas #${c.id}`;
    sel.appendChild(opt);
  });
}

function adminLoadClientChoices() {
  const sel = document.getElementById("adminClientSelect");
  sel.innerHTML = adminDemoClients
    .map(c => `<option value="${c.id}">${c.name}</option>`)
    .join("");
}

async function adminLoadSessions() {
  // verwacht endpoint: GET /api/sessions[?classId=..]
  const classId = document.getElementById("adminClassFilter").value;
  const path = classId ? `/api/sessions?classId=${encodeURIComponent(classId)}` : "/api/sessions";
  const sessions = await api(path);

  const ul = document.getElementById("adminSessionsList");
  ul.innerHTML = "";

  if (!sessions.length) {
    ul.innerHTML = "<li class='muted'>(geen sessies)</li>";
    return;
  }

  sessions.forEach(s => {
    // verwacht velden: id, classId, date, start, end?, capacity?, location?
    const li = document.createElement("li");
    li.className = "row";
    const time = s.end ? `${s.start}–${s.end}` : s.start;
    const capTxt = s.capacity ? ` · max ${s.capacity}` : "";
    const locTxt = s.location ? ` · ${s.location}` : "";
    li.innerHTML = `
      <div>
        <div><strong>${s.date}</strong> ${time}</div>
        <small>Klas #${s.classId}${locTxt}${capTxt}</small>
      </div>
      <div>
        <button type="button" class="btn-secondary">Details</button>
      </div>
    `;
    li.querySelector("button").onclick = () => adminShowSessionDetails(s);
    ul.appendChild(li);
  });
}

async function adminShowSessionDetails(session) {
  ADMIN_SELECTED_SESSION = session;

  // Header vullen
  const header = document.getElementById("adminSessionHeader");
  const time = session.end ? `${session.start}–${session.end}` : session.start;
  const capTxt = session.capacity ? ` · max ${session.capacity}` : "";
  const locTxt = session.location ? ` · ${session.location}` : "";
  header.className = "card";
  header.innerHTML = `
    <div><strong>Sessie #${session.id}</strong></div>
    <div>${session.date} · ${time} · Klas #${session.classId}${locTxt}${capTxt}</div>
  `;

  // Snel boeken tonen
  document.getElementById("adminQuickBook").style.display = "";

  // Deelnemers renderen
  await adminRenderBookingsList(session.id);
}

function adminStatusBadge(status) {
  const cls =
    status === "RESERVED" ? "blue" :
    status === "ATTENDED" ? "green" :
    status === "CANCELLED" ? "orange" : "";
  return `<span class="badge ${cls}">${status}</span>`;
}

async function adminRenderBookingsList(sessionId) {
  // verwacht endpoint: GET /api/bookings?sessionId=..
  const bookings = await api(`/api/bookings?sessionId=${sessionId}`);
  const ul = document.getElementById("adminBookingsList");
  ul.innerHTML = "";

  if (!bookings.length) {
    ul.innerHTML = "<li class='muted'>(nog geen deelnemers)</li>";
    return;
  }

  bookings.forEach(b => {
    const client = adminDemoClients.find(c => c.id === b.clientId);
    const name = client ? client.name : `Klant #${b.clientId}`;

    const li = document.createElement("li");
    li.className = "row";
    li.innerHTML = `
      <div>
        <strong>${name}</strong> · ${adminStatusBadge(b.status)}
        <div class="muted">Boeking #${b.id}${b.classId ? " · Klas #" + b.classId : ""}</div>
      </div>
      <div class="actions"></div>
    `;

    const actions = li.querySelector(".actions");
    if (b.status === "RESERVED") {
      // Aanwezig
      const btnAttend = document.createElement("button");
      btnAttend.textContent = "Aanwezig";
      btnAttend.onclick = async () => {
        try {
          await api(`/api/bookings/${b.id}/attend`, { method: "POST" });
          await adminRenderBookingsList(sessionId);
        } catch (e) {
          alert("Markeren mislukt: " + e.message);
        }
      };

      // Afmelden
      const btnCancel = document.createElement("button");
      btnCancel.textContent = "Afmelden";
      btnCancel.className = "btn-secondary";
      btnCancel.onclick = async () => {
        try {
          await api(`/api/bookings/${b.id}/cancel`, { method: "POST" });
          await adminRenderBookingsList(sessionId);
        } catch (e) {
          alert("Annuleren mislukt: " + e.message);
        }
      };

      actions.append(btnAttend, btnCancel);
    }

    ul.appendChild(li);
  });

  // (optioneel) stats laden en tonen in header
  try {
    const statsQs = ADMIN_SELECTED_SESSION.capacity
      ? `?capacity=${ADMIN_SELECTED_SESSION.capacity}`
      : "";
    const stats = await api(`/api/bookings/stats/session/${sessionId}${statsQs}`);
    const header = document.getElementById("adminSessionHeader");
    const info = document.createElement("div");
    info.style.marginTop = "8px";
    const capTxt = stats.capacity ? ` / ${stats.capacity}` : "";
    info.innerHTML = `
      <small>
        Reserved: <strong>${stats.reserved}${capTxt}</strong> ·
        Attended: <strong>${stats.attended}</strong> ·
        Cancelled: <strong>${stats.cancelled}</strong>
        ${stats.free !== undefined ? ` · Vrij: <strong>${stats.free}</strong>` : ""}
      </small>
    `;
    header.appendChild(info);
  } catch (_) {
    // stats optioneel – negeren als endpoint niet bestaat
  }
}

async function adminBookSelectedClient() {
  if (!ADMIN_SELECTED_SESSION) return alert("Kies eerst links een sessie.");
  const clientId = Number(document.getElementById("adminClientSelect").value);
  const s = ADMIN_SELECTED_SESSION;

  try {
    // POST /api/bookings  (stuurt sessie-capaciteit mee indien beschikbaar)
    await api("/api/bookings", {
      method: "POST",
      body: JSON.stringify({
        clientId,
        sessionId: s.id,
        classId: s.classId,
        sessionCapacity: s.capacity ?? undefined
      })
    });
    await adminRenderBookingsList(s.id);
    alert("Geboekt!");
  } catch (e) {
    alert("Boeken mislukt: " + e.message);
  }
}
  async function initAdmin() {
  // dropdowns vullen
  await adminLoadClassesIntoFilter();
  adminLoadClientChoices();

  // sessies laden (initieel: alle)
  await adminLoadSessions();

  // events
  document.getElementById("adminClassFilter")
    .addEventListener("change", adminLoadSessions);

  document.getElementById("adminReload")
    .addEventListener("click", adminLoadSessions);

  document.getElementById("adminBookBtn")
    .addEventListener("click", adminBookSelectedClient);
}
  document.addEventListener("DOMContentLoaded", () => {
  // jouw bestaande initialisatie (indien aanwezig)
  // initClasses(); initSessions(); ...

  // Admin-sectie laden
  initAdmin();
});
}
// ====== kleine helper ======
const api = (path, opts={}) =>
  fetch(path, { headers: { "Content-Type": "application/json" }, ...opts })
    .then(r => r.ok ? r.json().catch(()=>null) : r.json().then(e=>Promise.reject(e)));

// ====== panel switch ======
function showPanel(key) {
  for (const el of document.querySelectorAll(".admin-panel")) el.style.display = "none";
  document.getElementById(`panel-${key}`).style.display = "block";

  if (key === "lestypes") loadLestypes();
  if (key === "themas")   loadThemas();
  if (key === "locaties") loadLocaties();
}

// ====== LESTYPES ======
async function loadLestypes() {
  const ul = document.getElementById("list-lestypes");
  ul.innerHTML = "<li>Laden…</li>";
  try {
    const data = await api("/api/lestypes");
    ul.innerHTML = "";
    data.forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `
        <b>${escapeHtml(item.name)}</b>
        <small>${escapeHtml(item.description || "")}</small>
        <button onclick="deleteLestype(${item.id})">Verwijderen</button>`;
      ul.appendChild(li);
    });
  } catch (e) {
    ul.innerHTML = `<li style="color:red;">Fout: ${escapeHtml(e.error || "onbekend")}</li>`;
  }
}

async function createLestype(ev) {
  ev.preventDefault();
  const fd = new FormData(ev.target);
  await api("/api/lestypes", {
    method: "POST",
    body: JSON.stringify({ name: fd.get("name"), description: fd.get("description") })
  });
  ev.target.reset();
  loadLestypes();
  return false;
}

async function deleteLestype(id) {
  await fetch(`/api/lestypes/${id}`, { method: "DELETE" });
  loadLestypes();
}

// ====== THEMA'S ======
async function loadThemas() {
  const ul = document.getElementById("list-themas");
  ul.innerHTML = "<li>Laden…</li>";
  try {
    const data = await api("/api/themas");
    ul.innerHTML = "";
    data.forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `
        <b>${escapeHtml(item.name)}</b>
        <small>${escapeHtml(item.description || "")}</small>
        <button onclick="deleteThema(${item.id})">Verwijderen</button>`;
      ul.appendChild(li);
    });
  } catch (e) {
    ul.innerHTML = `<li style="color:red;">Fout: ${escapeHtml(e.error || "onbekend")}</li>`;
  }
}

async function createThema(ev) {
  ev.preventDefault();
  const fd = new FormData(ev.target);
  await api("/api/themas", {
    method: "POST",
    body: JSON.stringify({ name: fd.get("name"), description: fd.get("description") })
  });
  ev.target.reset();
  loadThemas();
  return false;
}

async function deleteThema(id) {
  await fetch(`/api/themas/${id}`, { method: "DELETE" });
  loadThemas();
}

// ====== LOCATIES ======
async function loadLocaties() {
  const ul = document.getElementById("list-locaties");
  ul.innerHTML = "<li>Laden…</li>";
  try {
    const data = await api("/api/locaties");
    ul.innerHTML = "";
    data.forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `
        <b>${escapeHtml(item.name)}</b>
        <small>${escapeHtml([item.address,item.postcode,item.city].filter(Boolean).join(", "))}</small>
        <button onclick="deleteLocatie(${item.id})">Verwijderen</button>`;
      ul.appendChild(li);
    });
  } catch (e) {
    ul.innerHTML = `<li style="color:red;">Fout: ${escapeHtml(e.error || "onbekend")}</li>`;
  }
}

async function createLocatie(ev) {
  ev.preventDefault();
  const fd = new FormData(ev.target);
  await api("/api/locaties", {
    method: "POST",
    body: JSON.stringify({
      name: fd.get("name"),
      address: fd.get("address"),
      postcode: fd.get("postcode"),
      city: fd.get("city"),
      description: fd.get("description")
    })
  });
  ev.target.reset();
  loadLocaties();
  return false;
}

async function deleteLocatie(id) {
  await fetch(`/api/locaties/${id}`, { method: "DELETE" });
  loadLocaties();
}

// ====== kleine XSS-helper ======
function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#39;");
}
async function fetchJSON(url, opts) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...opts
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* ---------- LESSTYPES ---------- */
async function loadLessonTypes() {
  const items = await fetchJSON("/api/lesson-types");
  const ul = document.getElementById("list-lesson-types");
  ul.innerHTML = items.map(i => `<li><strong>${i.name}</strong> — ${i.description ?? ""}</li>`).join("");
}

async function addLessonType(e) {
  e.preventDefault();
  const name = document.getElementById("lt-name").value.trim();
  const description = document.getElementById("lt-desc").value.trim();
  if (!name) return;
  await fetchJSON("/api/lesson-types", {
    method: "POST",
    body: JSON.stringify({ name, description })
  });
  e.target.reset();
  loadLessonTypes();
}

/* ---------- THEMES ---------- */
async function loadThemes() {
  const items = await fetchJSON("/api/themes");
  const ul = document.getElementById("list-themes");
  ul.innerHTML = items.map(i => `<li><strong>${i.name}</strong> — ${i.description ?? ""}</li>`).join("");
}

async function addTheme(e) {
  e.preventDefault();
  const name = document.getElementById("th-name").value.trim();
  const description = document.getElementById("th-desc").value.trim();
  if (!name) return;
  await fetchJSON("/api/themes", {
    method: "POST",
    body: JSON.stringify({ name, description })
  });
  e.target.reset();
  loadThemes();
}

/* ---------- LOCATIONS ---------- */
async function loadLocations() {
  const items = await fetchJSON("/api/locations");
  const ul = document.getElementById("list-locations");
  ul.innerHTML = items.map(i =>
    `<li><strong>${i.name}</strong> — ${i.address ?? ""}, ${i.postcode ?? ""} ${i.city ?? ""}</li>`
  ).join("");
}

async function addLocation(e) {
  e.preventDefault();
  const name = document.getElementById("loc-name").value.trim();
  const address = document.getElementById("loc-address").value.trim();
  const city = document.getElementById("loc-city").value.trim();
  const postcode = document.getElementById("loc-postcode").value.trim();
  if (!name) return;
  await fetchJSON("/api/locations", {
    method: "POST",
    body: JSON.stringify({ name, address, city, postcode })
  });
  e.target.reset();
  loadLocations();
}

/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded", () => {
  // lijstjes laden
  loadLessonTypes().catch(console.error);
  loadThemes().catch(console.error);
  loadLocations().catch(console.error);

  // submit handlers
  const f1 = document.getElementById("form-lesson-type");
  const f2 = document.getElementById("form-theme");
  const f3 = document.getElementById("form-location");
  if (f1) f1.addEventListener("submit", addLessonType);
  if (f2) f2.addEventListener("submit", addTheme);
  if (f3) f3.addEventListener("submit", addLocation);
<footer style="margin-top:20px; font-size:0.9em; color:gray;">
  Laatst geüpdatet op: <span id="lastUpdated"></span>
</footer>

<script>
  document.getElementById("lastUpdated").textContent =
    new Date().toLocaleString("nl-BE", {
      dateStyle: "full",
      timeStyle: "short"
    });
</script>

const $ = s => document.querySelector(s);
const api = p => fetch(p).then(r => r.json());

async function loadCustomers() {
  const data = await api("/api/customers");
  const list = $("#customersList");
  list.innerHTML = "";
  const sel = $("#d_customer");
  sel.innerHTML = "";

  data.forEach(c => {
    // lijst
    const li = document.createElement("li");
    const dogs = (c.dogs ?? []).map(d => d.name).join(", ");
    li.textContent = `${c.name} – ${c.phone ?? ""} ${c.email ?? ""}  | Honden: ${dogs || "-"}`;
    li.style.cursor = "pointer";
    li.onclick = () => loadDogs(c.id);
    list.appendChild(li);

    // dropdown voor hond-koppeling
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.name;
    sel.appendChild(opt);
  });
}

async function loadDogs(customerId) {
  const data = await api(`/api/dogs?customerId=${customerId}`);
  const list = $("#dogsList");
  list.innerHTML = "";
  data.forEach(d => {
    const li = document.createElement("li");
    li.textContent = `${d.name} (${d.breed || "ras onbekend"}) – eigenaar: ${d.customerName}`;
    list.appendChild(li);
  });
}

async function addCustomer() {
  const body = {
    name: $("#c_name").value.trim(),
    phone: $("#c_phone").value.trim(),
    email: $("#c_email").value.trim()
  };
  if (!body.name) { alert("Naam is verplicht"); return; }

  const r = await fetch("/api/customers", {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify(body)
  });
  if (!r.ok) { alert("Mislukt klant toevoegen"); return; }
  $("#c_name").value = $("#c_phone").value = $("#c_email").value = "";
  await loadCustomers();
}

async function addDog() {
  const body = {
    customerId: Number($("#d_customer").value),
    name: $("#d_name").value.trim(),
    breed: $("#d_breed").value.trim(),
    birthdate: $("#d_birth").value
  };
  if (!body.customerId || !body.name) { alert("Kies klant en vul hondnaam in"); return; }

  const r = await fetch("/api/dogs", {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify(body)
  });
  if (!r.ok) { alert("Mislukt hond toevoegen"); return; }
  $("#d_name").value = $("#d_breed").value = $("#d_birth").value = "";
  await loadDogs(body.customerId);
  await loadCustomers();
}

document.addEventListener("DOMContentLoaded", () => {
  $("#btnAddCustomer").addEventListener("click", addCustomer);
  $("#btnAddDog").addEventListener("click", addDog);
  loadCustomers();
});

<script src="/js/app.js" defer></script>

async function postJSON(url, data) {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify(data) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

document.getElementById("packForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  try {
    const pack = await postJSON("/api/packs", {
      customerId: Number(f.customerId.value),
      size: Number(f.size.value),
      expiresAt: f.expiresAt.value || null
    });
    alert("Pakket aangemaakt: #" + pack.id);
    f.reset();
  } catch (err) {
    alert("Fout: " + err.message);
  }
});

document.getElementById("bookForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target, msg = document.getElementById("bookMsg");
  msg.textContent = "";
  try {
    const booking = await postJSON("/api/bookings", {
      sessionId: Number(f.sessionId.value),
      customerId: Number(f.customerId.value),
      dogId: Number(f.dogId.value)
    });
    msg.textContent = `Gereserveerd (#${booking.id})`;
    f.reset();
  } catch (err) {
    msg.style.color = "#c00";
    msg.textContent = "Fout: " + err.message;
  }
});


async function showBalance(customerId) {
  const r = await fetch(`/api/packs/balance/${customerId}`);
  const b = await r.json();
  alert(`Credits klant #${customerId}: 
Totaal: ${b.total}, Gebruikt: ${b.used}, Gereserveerd: ${b.reserved}, Over: ${b.remaining}`);
}

// Pakketten (credits)
async function ViewPacks() {
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <h2>Pakketten (credits)</h2>
    <div class="card">
      <form id="newPackForm">
        <label>Klant ID<input name="customerId" type="number" required/></label>
        <label>Aantal lessen<input name="size" type="number" required/></label>
        <label>Geldig tot<input name="expiresAt" type="date"/></label>
        <button type="submit">Pakket toevoegen</button>
      </form>
      <div id="pMsg" class="muted"></div>
    </div>
    <div class="card">
      <h3>Overzicht</h3>
      <div id="packsList">Laden…</div>
    </div>
  `;

  const list = $("#packsList", wrap);
  const msg = $("#pMsg", wrap);

  async function loadPacks() {
    try {
      const packs = await getJSON("/api/packs");
      if (!packs.length) { list.innerHTML = `<p class="muted">Nog geen pakketten.</p>`; return; }
      list.innerHTML = packs.map(p => `
        <div style="border-bottom:1px dashed #eee; padding:8px 0;">
          <strong>#${p.id}</strong> klant #${p.customerId} – ${p.size} credits
          <br><span class="muted">gebruikt: ${p.used}, gereserveerd: ${p.reserved}, resterend: ${p.size - (p.used + p.reserved)}</span>
          ${p.expiresAt ? `<br><span class="muted">geldig tot: ${p.expiresAt}</span>` : ""}
        </div>
      `).join("");
    } catch (e) {
      list.textContent = "Kon pakketten niet laden.";
      console.error(e);
    }
  }

  $("#newPackForm", wrap).addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";
    const f = e.target;
    try {
      await postJSON("/api/packs", {
        customerId: Number(f.customerId.value),
        size: Number(f.size.value),
        expiresAt: f.expiresAt.value || null
      });
      msg.textContent = "✅ Pakket toegevoegd.";
      f.reset();
      await loadPacks();
    } catch (err) {
      msg.textContent = "❌ Fout: " + err.message;
    }
  });

  await loadPacks();
  return wrap;
}

// Boekingen
async function ViewBookings() {
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <h2>Boekingen</h2>
    <div class="card">
      <form id="newBookingForm">
        <label>Sessie ID<input name="sessionId" type="number" required/></label>
        <label>Klant ID<input name="customerId" type="number" required/></label>
        <label>Hond ID<input name="dogId" type="number" required/></label>
        <button type="submit">Boek les</button>
      </form>
      <div id="bMsg" class="muted"></div>
    </div>
    <div class="card">
      <h3>Overzicht</h3>
      <div id="bookingsList">Laden…</div>
    </div>
  `;

  const list = $("#bookingsList", wrap);
  const msg = $("#bMsg", wrap);

  async function loadBookings() {
    try {
      const bookings = await getJSON("/api/bookings");
      if (!bookings.length) { list.innerHTML = `<p class="muted">Nog geen boekingen.</p>`; return; }
      list.innerHTML = bookings.map(b => `
        <div style="border-bottom:1px dashed #eee; padding:8px 0;">
          <strong>#${b.id}</strong> sessie #${b.sessionId}, klant #${b.customerId}, hond #${b.dogId}
          <br><span class="muted">status: ${b.status}</span>
        </div>
      `).join("");
    } catch (e) {
      list.textContent = "Kon boekingen niet laden.";
      console.error(e);
    }
  }

  $("#newBookingForm", wrap).addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";
    const f = e.target;
    try {
      await postJSON("/api/bookings", {
        sessionId: Number(f.sessionId.value),
        customerId: Number(f.customerId.value),
        dogId: Number(f.dogId.value)
      });
      msg.textContent = "✅ Boeking gemaakt.";
      f.reset();
      await loadBookings();
    } catch (err) {
      msg.textContent = "❌ Fout: " + err.message;
    }
  });

  await loadBookings();
  return wrap;
}

// Lessen (Sessies) beheren
async function ViewSessions() {
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <h2>Lessen (Sessies)</h2>

    <div class="card">
      <h3>Nieuwe les</h3>
      <form id="newSessionForm">
        <label>Klas-ID (classId)<input name="classId" type="number" required /></label>
        <label>Datum & tijd<input name="date" type="datetime-local" required /></label>
        <label>Locatie<input name="location" required /></label>
        <label>Capaciteit (optioneel)<input name="capacity" type="number" min="1" /></label>
        <button type="submit">Opslaan</button>
      </form>
      <div id="sMsg" class="muted"></div>
    </div>

    <div class="card">
      <h3>Terugkerende lessen</h3>
      <form id="recurringForm">
        <label>Klas-ID<input name="classId" type="number" required /></label>
        <label>Locatie<input name="location" required /></label>
        <label>Capaciteit<input name="capacity" type="number" min="1" /></label>
        <label>Startdatum<input name="startDate" type="date" required /></label>
        <label>Einddatum<input name="endDate" type="date" required /></label>
        <label>Weekdag
          <select name="weekday" required>
            <option value="0">Zondag</option>
            <option value="1">Maandag</option>
            <option value="2">Dinsdag</option>
            <option value="3">Woensdag</option>
            <option value="4">Donderdag</option>
            <option value="5">Vrijdag</option>
            <option value="6">Zaterdag</option>
          </select>
        </label>
        <label>Uur<input name="hour" type="number" min="0" max="23" value="9" /></label>
        <label>Minuut<input name="minute" type="number" min="0" max="59" value="0" /></label>
        <button type="submit">Reeks aanmaken</button>
      </form>
      <div id="rMsg" class="muted"></div>
    </div>

    <div class="card">
      <h3>Overzicht lessen</h3>
      <div id="sessionsList">Laden…</div>
    </div>
  `;

  const sMsg = $("#sMsg", wrap);
  const rMsg = $("#rMsg", wrap);
  const list = $("#sessionsList", wrap);

  async function loadSessions() {
    try {
      const data = await getJSON("/api/sessions");
      if (!data.length) { list.innerHTML = `<p class="muted">Nog geen lessen.</p>`; return; }
      list.innerHTML = data.map(s => `
        <div style="border-bottom:1px dashed #eee; padding:8px 0;">
          <strong>#${s.id}</strong> klas #${s.classId} – ${fmtDate(s.date)} – ${s.location}
          ${s.capacity ? `<span class="muted"> · capaciteit: ${s.capacity}</span>` : ""}
        </div>
      `).join("");
    } catch (e) {
      console.error(e);
      list.textContent = "Kon lessen niet laden.";
    }
  }

  function fmtDate(iso) {
    // toont "dd/MM/yyyy HH:mm"
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleString("nl-BE", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" });
  }

  $("#newSessionForm", wrap).addEventListener("submit", async (e) => {
    e.preventDefault();
    sMsg.textContent = "";
    const f = e.currentTarget;
    const body = {
      classId: Number(f.classId.value),
      date: f.date.value,             // "YYYY-MM-DDTHH:mm"
      location: f.location.value.trim(),
      capacity: f.capacity.value ? Number(f.capacity.value) : null
    };
    if (!body.classId || !body.date || !body.location) {
      sMsg.style.color="#c00"; sMsg.textContent="Vul alle verplichte velden in."; return;
    }
    try {
      await postJSON("/api/sessions", body);
      sMsg.style.color="#2a7"; sMsg.textContent="Les aangemaakt.";
      f.reset();
      await loadSessions();
    } catch (err) {
      sMsg.style.color="#c00"; sMsg.textContent = "Fout: " + err.message;
    }
  });

  $("#recurringForm", wrap).addEventListener("submit", async (e) => {
    e.preventDefault();
    rMsg.textContent = "";
    const f = e.currentTarget;
    const body = {
      classId: Number(f.classId.value),
      location: f.location.value.trim(),
      capacity: f.capacity.value ? Number(f.capacity.value) : null,
      startDate: f.startDate.value,  // "YYYY-MM-DD"
      endDate: f.endDate.value,      // "YYYY-MM-DD"
      weekday: Number(f.weekday.value),
      hour: Number(f.hour.value || 9),
      minute: Number(f.minute.value || 0)
    };
    if (!body.classId || !body.location || !body.startDate || !body.endDate) {
      rMsg.style.color="#c00"; rMsg.textContent="Vul alle verplichte velden in."; return;
    }
    try {
      const res = await postJSON("/api/sessions/recurring", body);
      rMsg.style.color="#2a7"; rMsg.textContent = `Aangemaakt: ${res.count} lessen.`;
      f.reset();
      await loadSessions();
    } catch (err) {
      rMsg.style.color="#c00"; rMsg.textContent = "Fout: " + err.message;
    }
  });

  await loadSessions();
  return wrap;
}

const routes = {
  "#/dashboard": ViewDashboard,
  "#/customers": ViewCustomers,
  "#/dogs": ViewDogs,
  "#/packs": ViewPacks,
  "#/bookings": ViewBookings,
};

// Optioneel: toon bij opstart meteen "Lestypes"
document.addEventListener("DOMContentLoaded", () => showPanel("lestypes"));


