// server/helpers/admins.js
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, '../../data/admins.json');

function ensureDbFile() {
  if (!fs.existsSync(path.dirname(DB_FILE))) {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [] }, null, 2));
  }
}

function readDb() {
  ensureDbFile();
  const raw = fs.readFileSync(DB_FILE, 'utf8');
  return JSON.parse(raw || '{"users":[]}');
}

function writeDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

async function listAdmins() {
  const db = readDb();
  // geef geen wachtwoorden terug
  return db.users.map(({ password, ...rest }) => rest);
}

async function createAdmin({ name, email, password, role }) {
  const db = readDb();
  const emailNorm = String(email).trim().toLowerCase();
  if (db.users.find(u => u.email.toLowerCase() === emailNorm)) {
    const err = new Error('email_exists');
    err.code = 'email_exists';
    throw err;
  }
  const hash = await bcrypt.hash(password, 10);
  const user = {
    id: 'adm_' + Math.random().toString(36).slice(2, 10),
    name: name?.trim() || '',
    email: emailNorm,
    role: role || 'admin',
    createdAt: new Date().toISOString(),
    password: hash
  };
  db.users.push(user);
  writeDb(db);
  // zonder wachtwoord teruggeven
  const { password: _pw, ...safe } = user;
  return safe;
}
// server/routes/admin.js (onderaan – NA je andere requires en router)
const express = require('express');
const router = express.Router();
const adminGuard = require('../helpers/adminGuard'); // laat staan zoals in je project
const { listAdmins, createAdmin } = require('../helpers/admins');

// Lijst met admin-gebruikers (alleen voor superadmin)
router.get('/admin/users', adminGuard('superadmin'), async (req, res) => {
  try {
    const users = await listAdmins();
    res.json({ ok: true, users });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'server_error' });
  }
});

// Nieuwe admin toevoegen (alleen voor superadmin)
router.post('/admin/users', adminGuard('superadmin'), express.json(), async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ ok: false, error: 'missing_fields' });
    }
    const user = await createAdmin({ name, email, password, role });
    res.status(201).json({ ok: true, user });
  } catch (e) {
    if (e.code === 'email_exists') {
      return res.status(409).json({ ok: false, error: 'email_exists' });
    }
    res.status(500).json({ ok: false, error: 'server_error' });
  }
});

module.exports = router;

module.exports = {
  listAdmins,
  createAdmin,
};
