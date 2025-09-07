// public/js/admin-users.js
(async function () {
  const usersBox = document.getElementById("usersBox");
  const addForm  = document.getElementById("addForm");
  const resultEl = document.getElementById("result");

  const API = "/api/admin/users";

  function showLoading() {
    usersBox.textContent = "Laden…";
  }

  function renderUsers(users) {
    if (!users || users.length === 0) {
      usersBox.innerHTML = '<div class="muted">Nog geen gebruikers.</div>';
      return;
    }
    usersBox.innerHTML = users.map(u => `
      <div class="item">
        <div><b>${escapeHtml(u.name)}</b> — <span class="muted">${escapeHtml(u.email)}</span></div>
        <div class="muted">rol: ${escapeHtml(u.role)} • id: ${escapeHtml(u.id)}</div>
      </div>
    `).join("");
  }

  function escapeHtml(s = "") {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function loadUsers() {
    showLoading();
    try {
      const res = await fetch(API, { headers: { "Accept": "application/json" } });
      if (!res.ok) {
        const text = await res.text();
        usersBox.innerHTML = `<div class="muted">Fout: ${escapeHtml(text)}</div>`;
        return;
      }
      const data = await res.json();
      if (data.ok !== true) {
        usersBox.innerHTML = `<div class="muted">Fout: ${escapeHtml(JSON.stringify(data))}</div>`;
        return;
      }
      renderUsers(data.users);
    } catch (err) {
      usersBox.innerHTML = `<div class="muted">Netwerkfout: ${escapeHtml(err.message)}</div>`;
    }
  }

  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    resultEl.textContent = 'Bezig met toevoegen…';

    const formData = new FormData(addForm);
    const payload = {
      name: formData.get("name")?.trim(),
      email: formData.get("email")?.trim(),
      password: formData.get("password"),
      role: formData.get("role") || "admin"
    };

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(async () => ({ ok:false, error: await res.text() }));
      resultEl.textContent = JSON.stringify(data, null, 2);

      if (res.ok && data.ok) {
        addForm.reset();
        await loadUsers();
      }
    } catch (err) {
      resultEl.textContent = JSON.stringify({ ok:false, error: err.message }, null, 2);
    }
  });

  // Init
  loadUsers();
})();
