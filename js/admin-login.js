
document.getElementById('loginForm')?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const user = document.getElementById('user').value.trim();
  const pass = document.getElementById('pass').value;
  const err = document.getElementById('err');
  err.textContent = 'Bezig…';
  const res = await sh.$json('/api/admin/users/login', {
    method:'POST',
    body: JSON.stringify({ email:user, password:pass })
  });
  if(res && res.ok){
    err.classList.remove('err'); err.classList.add('ok');
    err.textContent = 'Ingelogd ✅';
    location.href = '/public/index.html';
  }else{
    err.classList.add('err');
    err.textContent = (res && res.error) ? res.error : 'Login mislukt';
  }
});
