
// Load users from API using auth token + client-side filter
document.addEventListener('DOMContentLoaded', () => {
  requireAuth();
  const input = document.getElementById('userSearch');
  const tbody = document.querySelector('#usersTable tbody');
  async function loadUsers(){
    try{
      const res = await fetch('/api/admin-users', { headers: { ...authHeaders() } });
      if(!res.ok){ throw new Error('Kon gebruikers niet laden'); }
      const users = await res.json();
      tbody.innerHTML = users.map(u => 
        `<tr><td>${u.name}</td><td>${u.email}</td><td>${u.role||''}</td><td><button class="link">Bewerk</button></td></tr>`
      ).join('');
    }catch(e){
      tbody.innerHTML = `<tr><td colspan="4">Fout: ${e.message}</td></tr>`;
    }
  }
  loadUsers();
  input?.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    tbody.querySelectorAll('tr').forEach(r => {
      const text = r.innerText.toLowerCase();
      r.style.display = text.includes(q) ? '' : 'none';
    });
  });
});
