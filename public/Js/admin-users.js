// /public/js/admin-users.js
// client-side logica voor admin gebruikersbeheer

const els = {
  status:  document.querySelector('#status'),
  table:   document.querySelector('#usersTable'),
  tbody:   document.querySelector('#usersBody'),
  name:    document.querySelector('#name'),
  email:   document.querySelector('#email'),
  password:document.querySelector('#password'),
  role:    document.querySelector('#role'),
  addBtn:  document.querySelector('#addBtn'),
  result:  document.querySelector('#result'),
};

function fmtDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso || '';
  }
}

async function fetchStatus() {
  try {
    const res = await fetch('/api/admin/status');
    if (!res.ok) throw new Error(`Status HTTP ${res.status}`);
    const data = await res.json();
    els.status.textContent = JSON.stringify(data);
  } catch (err) {
    els.status.textContent = JSON.stringify({ ok:false, error: String(err.message || err) });
  }
}

async function fetchUsers() {
  els.tbody.innerHTML = '';
  els.table.style.display = 'none';
  try {
    const res = await fetch('/api/admin/users');
    if (!res.ok) throw new Error(`Users HTTP ${res.status}`);
    const json = await res.json();

    // json kan bv. { ok:true, users:[...] } zijn — we ondersteunen beide
    const users = Array.isArray(json) ? json : (json.users || []);

    if (!users.length) {
      els.status.textContent = 'Nog geen admins.';
      return;
    }

    els.table.style.display = '';
    els.status.textContent = `Totaal: ${users.length}`;
    for (const u of users) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${u.name || '-'}</td>
        <td>${u.email || '-'}</td>
        <td>
          <span class="pill ${u.role === 'superadmin' ? 'super':''}">
            ${u.role || 'admin'}
          </span>
        </td>
        <td>${fmtDate(u.createdAt)}</td>
      `;
      els.tbody.appendChild(tr);
    }
  } catch (err) {
    els.status.textContent = JSON.stringify({ ok:false, error: String(err.message || err) });
  }
}

async function addUser() {
  const name = els.name.value.trim();
  const email = els.email.value.trim();
  const password = els.password.value;
  const role = els.role.value;

  if (!name || !email || !password) {
    els.result.textContent = JSON.stringify({ ok:false, error:'Vul naam, e-mail en wachtwoord in.' });
    return;
  }

  els.addBtn.disabled = true;
  els.result.textContent = 'Bezig…';

  try {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.ok === false) {
      const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
      throw new Error(msg);
    }

    els.result.textContent = JSON.stringify(data, null, 2);

    // velden leegmaken
    els.name.value = '';
    els.email.value = '';
    els.password.value = '';
    els.role.value = 'admin';

    // lijst opnieuw laden
    await fetchUsers();
    await fetchStatus();
  } catch (err) {
    els.result.textContent = JSON.stringify({ ok:false, error: String(err.message || err) });
  } finally {
    els.addBtn.disabled = false;
  }
}

// events
els.addBtn.addEventListener('click', addUser);

// initial load
fetchStatus();
fetchUsers();
