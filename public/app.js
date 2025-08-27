async function api(path, opts = {}) {
  const res = await fetch("/api" + path, {
    headers: { "Content-Type": "application/json" },
    ...opts
  });
  if (!res.ok) throw new Error((await res.text()) || res.statusText);
  return res.json();
}

/* ---------- KLASSEN ---------- */
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
