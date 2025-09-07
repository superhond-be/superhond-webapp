/* Admin gebruikers – lijst + toevoegen */
(() => {
  const $ = (sel) => document.querySelector(sel);
  const tbody = $("#usersTbody");
  const out = $("#out");
  const btnAdd = $("#btnAdd");

  const showOut = (obj) => {
    try { out.textContent = JSON.stringify(obj, null, 2); }
    catch { out.textContent = String(obj); }
  };

  // ---- Lijst ophalen --------------------------------------------------------
  async function loadUsers() {
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!data.ok) throw new Error(data.error || "Onbekende fout");

      const users = Array.isArray(data.users) ? data.users : [];
      if (users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="muted">Nog geen admin gebruikers.</td></tr>`;
        return;
        }
      tbody.innerHTML = users.map(u => {
        const dt = u.createdAt ? new Date(u.createdAt).toLocaleString() : "";
        return `<tr>
          <td>${escapeHtml(u.name || "")}</td>
          <td>${escapeHtml(u.email || "")}</td>
          <td>${escapeHtml(u.role || "")}</td>
          <td>${escapeHtml(dt)}</td>
        </tr>`;
      }).join("");
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="4" class="muted">Kon lijst niet laden.</td></tr>`;
      showOut({ ok:false, error:String(err) });
    }
  }

  // ---- Toevoegen ------------------------------------------------------------
  async function addUser() {
    const name = $("#naam").value.trim();
    const email = $("#email").value.trim();
    const password = $("#wachtwoord").value;
    const role = $("#rol").value;

    if (!name || !email || !password) {
      showOut({ ok:false, error:"Vul naam, e-mail en wachtwoord in." });
      return;
    }

    btnAdd.disabled = true;

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        const msg = data.error || `HTTP ${res.status}`;
        throw new Error(msg);
      }

      showOut(data);
      // Veldjes leegmaken en lijst herladen
      $("#wachtwoord").value = "";
      loadUsers();
    } catch (err) {
      showOut({ ok:false, error:String(err) });
    } finally {
      btnAdd.disabled = false;
    }
  }

  // ---- Helpers --------------------------------------------------------------
  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // Init
  btnAdd.addEventListener("click", addUser);
  loadUsers();
})();
