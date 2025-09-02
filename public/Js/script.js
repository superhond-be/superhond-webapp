// ===== DEBUG melding om te controleren of script.js geladen wordt =====
console.log("✅ script.js is geladen (versie 2025-09-02)");
showNotification?.("✅ script.js geladen (2025-09-02)", "success");

// ===== Active tab highlight =====
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname.split("/").pop();
  document.querySelectorAll(".topnav a").forEach(link => {
    const href = link.getAttribute("href");
    if (href === path) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
});

// ===== Notificatie functie =====
window.showNotification = function (msg, type = "info") {
  const note = document.createElement("div");
  note.className = "notification " + type;
  note.textContent = msg;
  document.body.appendChild(note);

  // zichtbaar maken
  setTimeout(() => {
    note.classList.add("show");
  }, 50);

  // automatisch verwijderen
  setTimeout(() => {
    note.classList.remove("show");
    setTimeout(() => note.remove(), 500);
  }, 3000);
};
