
document.getElementById('regForm')?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const body = {
    name:  document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    password: document.getElementById('pass').value,
    role: document.getElementById('role').value
  };
  const out = document.getElementById('out');
  out.textContent = 'Bezig…';
  const res = await sh.$json('/api/admin/users', {
    method:'POST', body: JSON.stringify(body)
  });
  out.textContent = JSON.stringify(res, null, 2);
});
