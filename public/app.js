async function api(path, opts = {}) {
  const res = await fetch("/api" + path, {
    headers: { "Content-Type": "application/json" },
    ...opts
  });
  if (!res.ok) throw new Error((await res.text()) || res.statusText);
  return res.json();
}

/* ---------- Klassen ---------- */
async function loadClasses() {
  const classes = await api("/classes");
  const ul = document.getElementById("classesList");
  ul.innerHTML = "";
  if (!classes.length) ul.innerHTML = "<li>(nog geen klassen)</li>";
  classes.forEach(c => {
    const li = document.createElement("li");
    li.textContent = `${c.id}. ${c.name} — trainer: ${c.trainer} — ${c.active ? "actief" : "inactief"}`;
    const del = document.createElement("button");
    del.textContent = "❌";
    del.style.marginLeft = "8px";
    del.onclick = async () => {
      if (!confirm(`Klas "${c.name}" verwijderen?`)) return;
      await api(`/classes/${c.id}`, { method: "DELETE" });
      loadClasses();
    };
    li.appendChild(del);
    ul.appendChild(li);
  });
}

async function submitClass(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = {
    name: fd.get("name"),
    trainer: fd.get("trainer"),
    active: fd.get("active") === "on"
  };
  await api("/classes", { method: "POST", body: JSON.stringify(payload) });
  e.target.reset();
  e.target.querySelector('[name="active"]').checked = true;
  loadClasses();
}

/* ---------- Sessies ---------- */
async function loadSessions() {
  const sessions = await api("/sessions");
  const ul = document.getElementById("sessionsList");
  ul.innerHTML = "";
  if (!sessions.length) ul.innerHTML = "<li>(nog geen sessies)</li>";
  sessions.forEach(s => {
    const li = document.createElement("li");
    li.textContent = `${s.id}. ${s.date} — ${s.topic}`;
    const del = document.createElement("button");
    del.textContent = "❌";
    del.style.marginLeft = "8px";
    del.onclick = async () => {
      if (!confirm(`Sessie ${s.id} verwijderen?`)) return;
      await api(`/sessions/${s.id}`, { method: "DELETE" });
      loadSessions();
    };
    li.appendChild(del);
    ul.appendChild(li);
  });
}

async function submitSession(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = {
    date: fd.get("date"),
    topic: fd.get("topic")
  };
  await api("/sessions", { method: "POST", body: JSON.stringify(payload) });
  e.target.reset();
  loadSessions();
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("classForm").addEventListener("submit", submitClass);
  document.getElementById("sessionForm").addEventListener("submit", submitSession);
  loadClasses();
  loadSessions();
});
