async function api(path, options = {}) {
  const res = await fetch("/api" + path, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  return res.json();
}

async function loadClasses() {
  const classes = await api("/classes");
  const ul = document.getElementById("classesList");
  const select = document.getElementById("classSelect");
  ul.innerHTML = "";
  select.innerHTML = '<option value="">(losse les of kies klas)</option>';

  classes.forEach(c => {
    const li = document.createElement("li");
    li.textContent = `${c.name} — ${c.location || "-"} (${c.start_date || ""} tot ${c.end_date || ""})`;
    ul.appendChild(li);

    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.name;
    select.appendChild(opt);
  });
}

async function loadSessions() {
  const sessions = await api("/sessions");
  const ul = document.getElementById("sessionsList");
  ul.innerHTML = "";
  sessions.forEach(s => {
    const when = [s.date, s.start_time, s.end_time ? `– ${s.end_time}` : ""].filter(Boolean).join(" ");
    const li = document.createElement("li");
    li.textContent = `${when} • ${s.class_name ? `[${s.class_name}] ` : ""}${s.location || "-"}`;
    ul.appendChild(li);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // formulier: nieuwe klas
  document.getElementById("classForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target).entries());
    await api("/classes", { method: "POST", body: JSON.stringify(f) });
    e.target.reset();
    await loadClasses();
  });

  // formulier: nieuwe les
  document.getElementById("sessionForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target).entries());
    await api("/sessions", { method: "POST", body: JSON.stringify(f) });
    e.target.reset();
    await loadSessions();
  });

  // initial load
  loadClasses().then(loadSessions);
});
