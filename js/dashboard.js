document.addEventListener("DOMContentLoaded", () => {
  console.log("Superhond Dashboard geladen ✅");

  const form = document.querySelector(".login-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Login functionaliteit volgt nog!");
    });
  }
});