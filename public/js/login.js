
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  if(!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());
    try{
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      if(!res.ok){
        const err = await res.json().catch(()=>({message:'Login mislukt'}));
        alert(err.message || 'Login mislukt');
        return;
      }
      const data = await res.json();
      setToken(data.token);
      window.location.href = './index.html';
    }catch(err){
      alert('Netwerkfout bij login');
    }
  });
});
