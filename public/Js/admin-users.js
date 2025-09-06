// public/js/admin-users.js
const el = sel => document.querySelector(sel);

function showNote(type, msg) {
  const box = el('#admin-users-note');
  box.className = ''; // reset
  box.classList.add('note', type === 'success' ? 'note--success' : 'note--error');
  box.textContent = msg;
  box.style.display = 'block';
  setTimeout(() => { box.style.display = 'none'; }, 4000);
}

async function fetchJSON(url, opts = {}) {
  const res = await fetch(url, { credentials: 'include', ...opts });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error || 'request_failed');
    err.status = res.status;
    throw err;
  }
  return data;
}

async function loadUsers() {
  const tbody = el('#admin-users-tbody');
  tbody.innerHTML = '<tr><td colspan="3">Laden…</td></tr>';
  try {
    const data = await fetchJSON('/api/admin/users');
    const rows = (data.users || []).map(u => `
      <tr>
        <td>${u.name || '-'}</td>
        <td>${u.email}</td>
        <td>${u.role}</td>
      </tr>
    `).join('');
    tbody.innerHTML = rows || '<tr><td colspan="3">Nog geen gebruikers.</td></tr>';
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="3">Kon lijst niet laden.</td></tr>';
  }
}

async function onSubmit(e) {
  e.preventDefault();
  const name = el('#new-name').value.trim();
  const email = el('#new-email').value.trim();
  const password = el('#new-password').value;
  const role = el('#new-role').value;

  if (!name || !email || !password) {
    showNote('error', 'Vul naam, e-mail en wachtwoord in.');
    return;
  }

  try {
    const body = JSON.stringify({ name, email, password, role });
    await fetchJSON('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    });
    showNote('success', 'Gebruiker toegevoegd.');
    e.target.reset();
    await loadUsers();
  } catch (err) {
    if (err.status === 409) {
      showNote('error', 'Dit e-mailadres bestaat al.');
    } else if (err.status === 400) {
      showNote('error', 'Onvolledige gegevens.');
    } else if (err.status === 401 || err.status === 403) {
      showNote('error', 'Je hebt geen rechten om dit te doen.');
    } else {
      showNote('error', 'Toevoegen mislukt. Probeer later opnieuw.');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = el('#admin-add-form');
  form.addEventListener('submit', onSubmit);
  loadUsers();
});
