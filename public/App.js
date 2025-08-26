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
