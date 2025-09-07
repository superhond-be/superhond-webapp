// server/routes/admin-users.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const router = express.Router();

// simpele "db" op het bestandssysteem
const DB_FILE = path.join(__dirname, '..', 'data', 'admins.json');

function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
  catch { return []; }
}
function writeDB(list) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(list, null, 2));
}

// GET /api/admin/users  -> lijst met admins (zonder wachtwoorden)
router.get('/', (req, res) => {
  const users = readDB().map(u => ({
    id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt
  }));
  res.json({ ok: true, users });
});

// GET /api/admin/users/status -> voor je “Admin status”-kaart
router.get('/status', (req, res) => {
  const count = readDB().length;
  const hasSetupToken = !!process.env.SETUP_TOKEN;
  res.json({ ok: true, count, hasSetupToken });
});

// POST /api/admin/users  -> nieuwe admin aanmaken
router.post('/', async (req, res) => {
  const { name, email, password, role = 'admin' } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ ok: false, error: 'name, email en password zijn verplicht' });
  }

  const list = readDB();
  if (list.find(u => u.email.toLowerCase() === String(email).toLowerCase())) {
    return res.status(409).json({ ok: false, error: 'E-mail bestaat al' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: 'adm_' + Date.now().toString(36),
    name,
    email,
    role,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  list.push(user);
  writeDB(list);

  return res.json({
    ok: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt }
  });
});

module.exports = router;
