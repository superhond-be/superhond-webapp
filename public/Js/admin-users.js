async function loadAdmins() {
  const tbody = document.getElementById("adminTable");
  tbody.innerHTML = "<tr><td colspan='4'>Laden...</td></tr>";

  try {
    const res = await fetch("/api/admin/users");
    const admins = await res.json();

    if (!res.ok) throw new Error(admins.error || "Kon admins niet ophalen");

    if (!Array.isArray(admins) || admins.length === 0) {
      tbody.innerHTML = "<tr><td colspan='4'>Geen admins gevonden</td></tr>";
      return;
    }

    tbody.innerHTML = "";
    admins.forEach((a) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${a.name}</td>
        <td>${a.email}</td>
        <td>${a.role}</td>
        <td>
          <button onclick="resetPassword('${a.id}')">Reset wachtwoord</button>
          <button onclick="deleteAdmin('${a.id}')">Verwijderen</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan='4'>❌ Fout: ${err.message}</td></tr>`;
  }
}

async function deleteAdmin(id) {
  if (!confirm("Weet je zeker dat je deze admin wilt verwijderen?")) return;
  try {
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Verwijderen mislukt");
    alert("✅ Verwijderd");
    loadAdmins();
  } catch (err) {
    alert("❌ " + err.message);
  }
}

async function resetPassword(id) {
  const nieuw = prompt("Nieuw wachtwoord (min. 8 tekens):");
  if (!nieuw) return;
  try {
    const res = await fetch(`/api/admin/users/${id}/password`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: nieuw }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Wachtwoord reset mislukt");
    alert("✅ Wachtwoord aangepast");
  } catch (err) {
    alert("❌ " + err.message);
  }
}

document.getElementById("addUserForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));

  try {
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j.error || "Toevoegen mislukt");
    alert("✅ Admin toegevoegd");
    form.reset();
    loadAdmins();
  } catch (err) {
    alert("❌ " + err.message);
  }
});

// Laad admins bij openen
loadAdmins();
