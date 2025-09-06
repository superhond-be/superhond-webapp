// public/js/admin-login.js
const form = document.getElementById("loginForm");
const out  = document.getElementById("out");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  out.textContent = "Bezig met inloggen…";
  const data = Object.fromEntries(new FormData(form).entries());

  try {
    const resp = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "same-origin"
    });

    const json = await resp.json();
    out.textContent = JSON.stringify(json, null, 2);

    if (json.ok) {
      // doorsturen naar admin dashboard (pas aan naar jouw pad)
      location.href = "/admin-login.html"; // of bv. "/dashboard.html"
    }
  } catch (err) {
    out.textContent = "Netwerkfout: " + err.message;
  }
});
