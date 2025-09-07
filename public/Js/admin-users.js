(() => {
  const $ = (sel) => document.querySelector(sel);

  const els = {
    loading: $('#usersLoading'),
    list: $('#usersList'),
    empty: $('#usersEmpty'),
    error: $('#usersError'),
    result: $('#resultBox'),
    form: $('#createForm'),
    name: $('#name'),
    email: $('#email'),
    password: $('#password'),
    role: $('#role'),
  };

  function show(el) { el && (el.hidden = false); }
  function hide(el) { el && (el.hidden = true); }
  function setResult(obj) {
    if (!els.result) return;
    try {
      els.result.textContent = JSON.stringify(obj, null, 2);
    } catch {
      els.result.textContent = String(obj);
    }
  }

  async function loadUsers() {
    hide(els.error); hide(els.empty); hide(els.list);
    show(els.loading);

    try {
      const res = await fetch('/api/admin/users', { headers: { 'Accept': 'application/json' } });
      // 401/403 → niet ingelogd/geen superadmin
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${res.statusText} – ${text}`);
      }
      const data = await res.json();

      // Altijd de loader weg
      hide(els.loading);

      // Verdere defensieve checks
      const users = (data && Array.isArray(data.users)) ? data.users : [];

      if (users.length === 0) {
        show(els.empty);
        els.list.innerHTML = '';
        hide(els.list);
        return;
      }

      // Render lijst
      els.list.innerHTML = users.map(u => `
        <li>
          <strong>${escapeHtml(u.name || '')}</strong>
          &nbsp; <span class="badge">${escapeHtml(u.role || 'admin')}</span><br/>
          <small>${escapeHtml(u.email || '')}</small>
        </li>
      `).join('');
      show(els.list);
    } catch (err) {
      hide(els.loading);
      show(els.error);
      setResult({ ok:false, error: String(err && err.message || err) });
      console.error('[admin-users] loadUsers failed:', err);
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'","&#39;");
  }

  async function createUser(ev) {
    ev.preventDefault();

    const payload = {
      name: (els.name.value || '').trim(),
      email: (els.email.value || '').trim(),
      password: els.password.value,
      role: els.role.value,
    };
    setResult({ info: 'Bezig met toevoegen…', payload: { ...payload, password: '***' } });

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept':'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.ok === false) {
        throw new Error(data && data.error ? data.error : `HTTP ${res.status}`);
      }

      setResult({ ok: true, user: data.user || null });
      // formulier resetten (wachtwoord leegmaken)
      els.password.value = '';
      // lijst herladen
      await loadUsers();
    } catch (err) {
      setResult({ ok:false, error: String(err && err.message || err) });
      console.error('[admin-users] createUser failed:', err);
    }
  }

  // init
  if (els.form) els.form.addEventListener('submit', createUser);
  // laad de lijst (ook als leeg)
  loadUsers();
})();
