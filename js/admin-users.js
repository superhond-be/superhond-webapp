
async function loadUsers(){
  const box = document.getElementById('list');
  box.textContent = 'Laden…';
  const res = await sh.$json('/api/admin/users');
  if(!res || !res.ok){ box.textContent = (res && res.error) ? res.error : 'Kon niet laden.'; return; }
  const users = res.users || [];
  if(!users.length){ box.textContent = 'Nog geen admins.'; return; }
  box.innerHTML = '';
  users.forEach(u=>{
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `
      <div><strong>${u.name||''}</strong></div>
      <div class="small">${u.email||''}</div>
      <div><span class="small">${u.role||'-'}</span></div>
      <div class="small">${(u.createdAt||'').toString().slice(0,10)}</div>
    `;
    box.appendChild(row);
  });
}

document.getElementById('newForm')?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const body = {
    name:  document.getElementById('n_name').value.trim(),
    email: document.getElementById('n_email').value.trim(),
    password: document.getElementById('n_pass').value,
    role: document.getElementById('n_role').value
  };
  const info = document.getElementById('info');
  info.textContent = 'Bezig…';
  const res = await sh.$json('/api/admin/users', { method:'POST', body: JSON.stringify(body) });
  info.textContent = JSON.stringify(res);
  await loadUsers();
});

loadUsers();
