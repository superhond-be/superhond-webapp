// Dummy admin registratie
document.getElementById("regForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = {
    token: form.token.value,
    name: form.name.value,
    email: form.email.value,
    password: form.password.value
  };

  try {
    const res = await fetch("/api/admin/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const j = await res.json();
    if (res.ok) {
      alert("✅ Admin geregistreerd: " + j.message);
      window.location.href = "/admin/login.html";
    } else {
      alert("❌ Fout: " + (j.error || "Onbekende fout"));
    }
  } catch (err) {
    alert("❌ Netwerkfout: " + err.message);
  }
});
