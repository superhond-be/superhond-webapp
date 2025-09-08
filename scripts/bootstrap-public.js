// scripts/bootstrap-public.js
const fs = require('fs');
const path = require('path');

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
function writeIfMissing(p, content) {
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, content, 'utf8');
    console.log('✚ aangemaakt:', p);
  } else {
    console.log('✓ bestaat al:', p);
  }
}

const ROOT = path.join(__dirname, '..');
const PUB = path.join(ROOT, 'public');

const files = {
  // HTML
  [path.join(PUB, 'index.html')]: `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <title>Superhond – Dashboard</title>
  <link rel="stylesheet" href="/css/app.css">
</head>
<body>
  <header><h1>Superhond Dashboard</h1></header>
  <main class="tiles">
    <a class="tile" href="/dashboard.html">📊 Dashboard</a>
    <a class="tile" href="/admin-login/admin-login.html">🔑 Admin Login</a>
    <a class="tile" href="/admin-register/admin-register.html">📝 Admin Register</a>
    <a class="tile" href="/admin-users/admin-users.html">👤 Admin Users</a>
  </main>
</body>
</html>
`,

  [path.join(PUB, 'dashboard.html')]: `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <title>Dashboard</title>
  <link rel="stylesheet" href="/css/app.css">
  <script src="/js/dashboard.js" defer></script>
</head>
<body>
  <header><h1>📊 Dashboard</h1></header>
  <main style="max-width:900px;margin:24px auto;padding:0 16px;">
    <p id="status">Status: onbekend</p>
    <button id="refreshBtn">🔄 Vernieuw status</button>
  </main>
</body>
</html>
`,

  // CSS
  [path.join(PUB, 'css', 'app.css')]: `body{font-family:Arial,sans-serif;margin:0;background:#fafafa}
header{background:#ffcc00;padding:20px;text-align:center}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;max-width:900px;margin:40px auto;padding:0 20px}
.tile{display:block;background:#fff;border:1px solid #ddd;border-radius:12px;padding:20px;text-align:center;text-decoration:none;color:#333}
button{padding:10px 20px;border-radius:6px;background:#ffcc00;border:0;cursor:pointer}
`,

  // JS
  [path.join(PUB, 'js', 'dashboard.js')]: `document.addEventListener('DOMContentLoaded',()=>{
  const statusEl=document.getElementById('status');
  const btn=document.getElementById('refreshBtn');
  if(btn) btn.addEventListener('click',()=>{ statusEl.textContent='Status: OK (dummy test)'; });
});
`,
  [path.join(PUB, 'js', 'dashboard-status.js')]: `console.log('Dashboard status geladen');`,
  [path.join(PUB, 'js', 'klanten.js')]: `console.log('Klanten geladen');`,
  [path.join(PUB, 'js', 'lessen.js')]: `console.log('Lessen geladen');`,
  [path.join(PUB, 'js', 'honden.js')]: `console.log('Honden geladen');`,
  [path.join(PUB, 'js', 'utils.js')]: `console.log('Utils geladen');`,

  // Admin login
  [path.join(PUB, 'admin-login', 'admin-login.html')]: `<!DOCTYPE html>
<html lang="nl"><head><meta charset="UTF-8">
<title>Admin Login</title><link rel="stylesheet" href="/css/app.css">
<script defer src="/admin-login/admin-login.js"></script></head>
<body><a href="/index.html">← Terug</a><h1>🔑 Admin Login</h1>
<form id="loginForm" style="max-width:420px;margin:20px auto">
  <label>E-mail<br><input id="user" type="email" required></label><br><br>
  <label>Wachtwoord<br><input id="pass" type="password" required></label><br><br>
  <button type="submit">Login</button>
  <div id="err" style="margin-top:10px;color:#b00;"></div>
</form></body></html>
`,
  [path.join(PUB, 'admin-login', 'admin-login.js')]: `document.getElementById('loginForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const email=document.getElementById('user').value.trim();
  const password=document.getElementById('pass').value;
  const out=document.getElementById('err'); out.textContent='Bezig...';
  try{
    const res=await fetch('/api/admin/users/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
    const data=await res.json();
    if(!res.ok) throw new Error(data.error||'Login mislukt');
    out.textContent='OK'; location.href='/dashboard.html';
  }catch(err){ out.textContent='Fout: '+err.message; }
});
`,

  // Admin register
  [path.join(PUB, 'admin-register', 'admin-register.html')]: `<!DOCTYPE html>
<html lang="nl"><head><meta charset="UTF-8">
<title>Admin Register</title><link rel="stylesheet" href="/css/app.css">
<script defer src="/admin-register/admin-register.js"></script></head>
<body><a href="/index.html">← Terug</a><h1>📝 Admin Register</h1>
<form id="registerForm" style="max-width:420px;margin:20px auto">
  <label>Naam<br><input id="name" required></label><br><br>
  <label>E-mail<br><input id="email" type="email" required></label><br><br>
  <label>Wachtwoord<br><input id="password" type="password" required></label><br><br>
  <button type="submit">Registreer</button>
  <pre id="out" style="margin-top:12px;background:#111;color:#0f0;padding:10px;border-radius:8px">{ "info": "Resultaat" }</pre>
</form></body></html>
`,
  [path.join(PUB, 'admin-register', 'admin-register.js')]: `document.getElementById('registerForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const payload={name: name.value.trim(), email: email.value.trim(), password: password.value, role:'admin'};
  const out=document.getElementById('out'); out.textContent='Bezig...';
  try{
    const r=await fetch('/api/admin/users',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const j=await r.json(); out.textContent=JSON.stringify(j,null,2);
  }catch(err){ out.textContent='Fout: '+err.message; }
});
`,

  // Admin users
  [path.join(PUB, 'admin-users', 'admin-users.html')]: `<!DOCTYPE html>
<html lang="nl"><head><meta charset="UTF-8">
<title>Admin Users</title><link rel="stylesheet" href="/css/app.css"></head>
<body><a href="/index.html">← Terug</a><h1>👤 Admin Users</h1>
<div style="max-width:980px;margin:20px auto;padding:0 16px;">
  <div><h2>Overzicht</h2><button id="refresh" class="btn">Vernieuwen</button><pre id="users">Laden…</pre></div>
  <hr/>
  <div><h2>Nieuwe gebruiker</h2>
    <form id="addForm">
      <label>Naam</label><input id="a_name" required>
      <label>E-mail</label><input id="a_email" type="email" required>
      <label>Wachtwoord</label><input id="a_password" type="password" required>
      <label>Rol</label><select id="a_role"><option value="admin">admin</option><option value="superadmin">superadmin</option></select>
      <button class="btn">Toevoegen</button>
    </form>
    <pre id="out">{ "info": "Resultaat verschijnt hier." }</pre>
  </div>
</div>
<script>
async function loadUsers(){
  const pre=document.getElementById('users'); pre.textContent='Laden…';
  try{ const r=await fetch('/api/admin/users'); const j=await r.json(); pre.textContent=JSON.stringify(j,null,2); }
  catch(e){ pre.textContent='Fout: '+e.message; }
}
document.getElementById('refresh').onclick=loadUsers; loadUsers();
document.getElementById('addForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const body={ name:a_name.value.trim(), email:a_email.value.trim(), password:a_password.value, role:a_role.value };
  const out=document.getElementById('out'); out.textContent='Bezig…';
  try{ const r=await fetch('/api/admin/users',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); const j=await r.json(); out.textContent=JSON.stringify(j,null,2); loadUsers(); }
  catch(err){ out.textContent='Fout: '+err.message; }
});
</script>
</body></html>
`,
};

const dirs = [
  PUB,
  path.join(PUB, 'css'),
  path.join(PUB, 'js'),
  path.join(PUB, 'img'),
  path.join(PUB, 'admin-login'),
  path.join(PUB, 'admin-register'),
  path.join(PUB, 'admin-users'),
];

dirs.forEach(ensureDir);
Object.entries(files).forEach(([p, c]) => writeIfMissing(p, c));

console.log('✅ bootstrap-public voltooid.');
