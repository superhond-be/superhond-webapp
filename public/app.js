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


