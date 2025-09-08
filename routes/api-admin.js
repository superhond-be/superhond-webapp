const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

const STORE = path.join(__dirname, '..', 'server', 'store.json');

async function readStore(){
  try {
    const raw = await fs.readFile(STORE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { users: [
      { id: 'adm_1', name: 'Sofie Thijs', email: 'sofie@example.com', pass: 'test123', role: 'superadmin', createdAt: new Date().toISOString() }
    ]};
  }
}

async function writeStore(data){
  await fs.mkdir(path.dirname(STORE), { recursive: true });
  await fs.writeFile(STORE, JSON.stringify(data, null, 2), 'utf8');
}

// Health/status
router.get('/status', async (req, res) => {
  const { users } = await readStore();
  res.json({ ok: true, count: users.length, hasSetupToken: !!process.env.SETUP_TOKEN });
});

// Get all users
router.get('/users', async (req, res) => {
  const { users } = await readStore();
  res.json({ ok: true, users });
});

// Create user
router.post('/users', async (req, res) => {
  const { name, email, pass, role } = req.body || {};
  if(!name || !email || !pass){
    return res.status(400).json({ ok:false, error:'Ontbrekende velden' });
  }
  const data = await readStore();
  if(data.users.find(u => u.email.toLowerCase() === String(email).toLowerCase())){
    return res.status(409).json({ ok:false, error:'E-mail bestaat al' });
  }
  const user = {
    id: 'adm_' + Date.now().toString(36),
    name, email, pass,
    role: (role === 'superadmin' ? 'superadmin' : 'admin'),
    createdAt: new Date().toISOString()
  };
  data.users.push(user);
  await writeStore(data);
  res.json({ ok:true, user });
});

// Dummy login
router.post('/users/login', async (req, res) => {
  const { email, password } = req.body || {};
  const { users } = await readStore();
  const u = users.find(x => x.email.toLowerCase() === String(email).toLowerCase());
  if(!u || u.pass !== password){
    return res.status(401).json({ ok:false, error:'Ongeldige login' });
  }
  res.json({ ok:true, user: { id: u.id, name: u.name, email: u.email, role: u.role } });
});

module.exports = router;