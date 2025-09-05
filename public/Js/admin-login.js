// Dummy login handler
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = {
    email: form.email.value,
    password: form.password.value
  };

  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const j = await res.json();
    if (res.ok) {
      alert("✅ Ingelogd als admin: " + j.email);
      window.location.href = "/admin/index.html";
    } else {
      alert("❌ Fout: " + (j.error || "Onbekende fout"));
    }
  } catch (err) {
    alert("❌ Netwerkfout: " + err.message);
  }
});
