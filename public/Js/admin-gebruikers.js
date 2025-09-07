// public/js/admin-gebruikers.js
(async function () {
  const listEl = document.querySelector('[data-admin-list]') || document.getElementById('adminList');
  const form = document.querySelector('[data-admin-form]') || document.getElementById('adminForm');
  const resultPre = document.querySelector('[data-admin-result]') || document.getElementById('adminResult');

  function showResult(obj) {
    if (resultPre) resultPre.textContent = JSON.stringify(obj, null, 2);
  }

  async function loadUsers() {
    try {
      const r = await fetch('/api/admin/users');
      const data = await r.json();
      if (!data.ok) throw new Error(data.error || 'Onbekende fout');
      if (listEl) {
        listEl.innerHTML = '';
        data.users.forEach(u => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${u.name || ''}</td>
            <td>${u.email}</td>
            <td>${u.role}</td>
            <td>${new Date(u.createdAt).toLocaleString()}</td>
          `;
          listEl.appendChild(tr);
        });
      }
      showResult({ ok: true, users: data.users });
    } catch (e) {
      showResult({ ok: false, error: e.message });
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    const name = form.querySelector('[name="name"]')?.value || '';
    const email = form.querySelector('[name="email"]')?.value || '';
    const password = form.querySelector('[name="password"]')?.value || '';
    const role = form.querySelector('[name="role"]')?.value || 'admin';
    try {
      const r = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await r.json();
      if (!data.ok) throw new Error(data.error || 'Kon gebruiker niet toevoegen');
      showResult(data);
      await loadUsers();
      form.reset();
    } catch (e2) {
      showResult({ ok: false, error: e2.message });
    }
  }

  if (form) form.addEventListener('submit', onSubmit);

  // initial load
  await loadUsers();
})();
