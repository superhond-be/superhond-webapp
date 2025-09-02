// Basis script voor Superhond.be Admin Portaal
document.addEventListener("DOMContentLoaded", () => {
  // 1. Active tab highlight (fallback als 'active' niet handmatig in HTML staat)
  const path = window.location.pathname.split("/").pop(); // bv. 'index.html'
  document.querySelectorAll(".topnav a").forEach(link => {
    const href = link.getAttribute("href");
    if (href === path) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // 2. Demo notificatie functie
  window.showNotification = function (msg, type = "info") {
    // type: info, success, error
    const note = document.createElement("div");
    note.className = "notification " + type;
    note.textContent = msg;
    document.body.appendChild(note);

    setTimeout(() => {
      note.classList.add("show");
    }, 50);

    // auto verwijderen
    setTimeout(() => {
      note.classList.remove("show");
      setTimeout(() => note.remove(), 500);
    }, 3000);
  };
});
