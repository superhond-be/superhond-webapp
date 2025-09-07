// public/js/admin-users.js
// Volledige client-side logica voor Admin gebruikersbeheer

(() => {
  const listEl = document.querySelector("#admin-users-list");
  const formEl = document.querySelector("#add-admin-form");
  const resultEl = document.querySelector("#result-box");

  const API = {
    list: async () => {
      const res = await fetch("/api/admin/users", { headers: { "Accept": "application/json" } });
      if (!res.ok) throw new Error(`Laden mislukt (${res.status})`);
      return res.json();
    },
    create: async (payload) => {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      });
      // Backend geeft JSON terug met { ok: true/false, ... }
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) {
        const msg = data?.error || `Opslaan mislukt (${res.status})`;
        throw new Error(msg);
      }
      return data;
    }
  };

  // Helpers
  function setResult(message, type = "info") {
    if (!resultEl) return;
    resultEl.textContent = (typeof message === "string") ? message : JSON.stringify(message, null, 2);
    resultEl.dataset.type = type; // handiger voor styling
  }

  function asListItem(user) {
    const li = document.createElement("li");
    li.className = "admin-user-item";
    li.innerHTML = `
      <strong>${escapeHtml(user.name)}</strong>
      <span> (${escapeHtml(user.email)})</span>
      <small> – rol: ${escapeHtml(user.role || "admin")}</small>
      <small style="opacity:.7"> • ${new Date(user.createdAt).toLocaleString()}</small>
    `;
    return li;
  }

  function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }

  // UI acties
  async function loadAdmins() {
    if (listEl) listEl.innerHTML = `<em>Laden...</em>`;
    try {
      const data = await API.list(); // verwacht { ok:true, users:[...] }
      if (!data?.ok) throw new Error(data?.error || "Onbekende fout");

      if (!data.users || data.users.length === 0) {
        listEl.innerHTML = `<em>Er zijn nog geen admin-accounts.</em>`;
        return;
      }

      // Render lijst
      const container = document.createElement(listEl.tagName.toLowerCase() === "ul" ? "ul" : "div");
      container.className = "admin-users";
      data.users.forEach(u => container.appendChild(asListItem(u)));
      listEl.replaceChildren(container);
    } catch (err) {
      listEl.innerHTML = `<span style="color:#b00020">Fout bij laden: ${escapeHtml(err.message)}</span>`;
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!formEl) return;

    // Lees velden
    const fd = new FormData(formEl);
    const name = fd.get("name")?.toString().trim();
    const email = fd.get("email")?.toString().trim();
    const password = fd.get("password")?.toString();
    const role = (fd.get("role")?.toString().trim()) || "admin";

    // Validatie
    if (!name || !email || !password) {
      setResult("Vul naam, e-mail en wachtwoord in.", "error");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setResult("Ongeldig e-mailadres.", "error");
      return;
    }
    if (password.length < 6) {
      setResult("Wachtwoord moet minstens 6 tekens bevatten.", "error");
      return;
    }

    // Submit blokkeren tijdens request
    const submitBtn = formEl.querySelector("[type=submit]") || formEl.querySelector("button");
    const originalText = submitBtn ? submitBtn.textContent : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Toevoegen…";
    }

    try {
      const data = await API.create({ name, email, password, role });
      setResult({ ok: true, user: data.user }, "success");
      formEl.reset();
      await loadAdmins();
    } catch (err) {
      setResult(`Fout: ${err.message}`, "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText || "Toevoegen";
      }
    }
  }

  // Init
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") loadAdmins();
  });

  if (formEl) formEl.addEventListener("submit", onSubmit);

  // Eerste load
  loadAdmins();
})();
