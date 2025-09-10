// Admin Users page logic
document.addEventListener('DOMContentLoaded', async () => {
  const tableBody = document.querySelector('#users-table tbody');
  async function loadUsers() {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      tableBody.innerHTML = data.map(u => `<tr>
        <td>${u.id}</td>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${u.role || ''}</td>
      </tr>`).join('');
    } catch (e) {
      tableBody.innerHTML = `<tr><td colspan="4">Kon niet laden: ${e.message}. Staat de server aan?</td></tr>`;
    }
  }
  await loadUsers();

  const form = document.getElementById('add-user-form');
  if (form) {
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const formData = new FormData(form);
      const body = Object.fromEntries(formData.entries());
      try {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.reset();
        await loadUsers();
      } catch (e) {
        alert('Toevoegen mislukt: ' + e.message);
      }
    });
  }
});
