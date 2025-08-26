// Klassen ophalen en tonen (met verwijderknop)
async function loadClasses() {
  const classes = await api("/classes");
  const ul = document.getElementById("classesList");
  ul.innerHTML = "";

  if (classes.length === 0) {
    ul.innerHTML = "<li>(nog geen klassen)</li>";
  } else {
    classes.forEach(c => {
      const li = document.createElement("li");
      li.textContent = `${c.title} (${c.date} ${c.time}) – ${c.location || "-"}`;

      // ❌ Verwijderknop
      const btn = document.createElement("button");
      btn.textContent = "❌";
      btn.style.marginLeft = "10px";
      btn.addEventListener("click", async () => {
        if (confirm(`Klas "${c.title}" verwijderen?`)) {
          await api(`/classes/${c.id}`, { method: "DELETE" });
          await loadClasses();
        }
      });

      li.appendChild(btn);
      ul.appendChild(li);
    });
  }
}
// Sessies ophalen en tonen
async function loadSessions() {
  const sessions = await api("/sessions");
  const ul = document.getElementById("sessionsList");
  ul.innerHTML = "";

  if (sessions.length === 0) {
    ul.innerHTML = "<li>(nog geen lessen)</li>";
  } else {
    sessions.forEach(s => {
      const li = document.createElement("li");
      const when = `${s.date} ${s.start_time}${s.end_time ? "–" + s.end_time : ""}`;
      li.textContent = `${when} • ${s.class_name || "losse les"} @ ${s.location || "-"}`;

      // ❌ knop
      const btn = document.createElement("button");
      btn.textContent = "❌";
      btn.style.marginLeft = "10px";
      btn.addEventListener("click", async () => {
        if (confirm(`Les op ${s.date} verwijderen?`)) {
          await api(`/sessions/${s.id}`, { method: "DELETE" });
          await loadSessions();
        }
      });

      li.appendChild(btn);
      ul.appendChild(li);
    });
  }
}

// Formulier: nieuwe sessie
document.addEventListener("DOMContentLoaded", () => {
  const sessionForm = document.getElementById("sessionForm");
  sessionForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(sessionForm).entries());
    await api("/sessions", { method: "POST", body: JSON.stringify(f) });
    sessionForm.reset();
    await loadSessions();
  });
});
