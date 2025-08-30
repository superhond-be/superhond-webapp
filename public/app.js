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
