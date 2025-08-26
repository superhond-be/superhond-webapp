console.log("Superhond frontend geladen");

// API helper
async function api(path, options = {}) {
  const res = await fetch("/api" + path, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  return res.json();
}

// Klassen ophalen en tonen
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
      ul.appendChild(li);
    });
  }
}

// Formulier: nieuwe klas
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("classForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = Object.fromEntries(new FormData(form).entries());
    data.max_participants = parseInt(data.max_participants) || null;

    await api("/classes", { method: "POST", body: JSON.stringify(data) });
    form.reset();
    await loadClasses();
  });

  loadClasses(); // eerste keer laden
});
