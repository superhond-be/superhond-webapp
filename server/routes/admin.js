// server/routes/admin.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const {
  readUsers,
  writeUsers,
  createUser,
  verifyUser,
  publicUser
} = require('../helpers/adminUsers');

const adminGuard = require('../adminGuard');

const router = express.Router();
const SECRET = process.env.ADMIN_JWT_SECRET || 'devsecret';

// --------- REGISTREREN (eenmalig met SETUP_TOKEN) ----------
router.post('/register', async (req, res) => {
  try {
    const { token, name, email, password, role } = req.body || {};
    if (!token || token !== (process.env.SETUP_TOKEN || '')) {
      return res.status(401).json({ error: 'setup_token_invalid' });
    }
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'missing_fields' });
    }
    const existing = readUsers().length;
    const u = await createUser({
      name,
      email,
      password,
      role: existing === 0 ? 'superadmin' : (role || 'admin')
    });
    res.status(201).json({ ok: true, user: u });
  } catch (e) {
    res.status(400).json({ error: e.message || 'register_failed' });
  }
});

// --------- INLOGGEN ----------
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = await verifyUser(email, password);
  if (!user) return res.status(401).json({ error: 'invalid_credentials' });
  const token = jwt.sign(
    { uid: user.id, email: user.email, role: user.role, name: user.name },
    SECRET,
    { expiresIn: '8h' }
  );
  res.json({ ok: true, token, user: publicUser(user) });
});

// --------- USERS LISTEN ----------
router.get('/users', adminGuard, (req, res) => {
  if (req.admin?.role !== 'superadmin') return res.status(403).json({ error: 'forbidden' });
  res.json(readUsers().map(publicUser));
});

// --------- USER TOEVOEGEN ----------
router.post('/users', adminGuard, async (req, res) => {
  if (req.admin?.role !== 'superadmin') return res.status(403).json({ error: 'forbidden' });
  try {
    const u = await createUser(req.body || {});
    res.status(201).json(publicUser(u));
  } catch (e) {
    res.status(400).json({ error: e.message || 'create_failed' });
  }
});

// --------- USER VERWIJDEREN ----------
router.delete('/users/:id', adminGuard, (req, res) => {
  if (req.admin?.role !== 'superadmin') return res.status(403).json({ error: 'forbidden' });
  const all = readUsers();
  const i = all.findIndex(u => u.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'not_found' });
  const removed = all.splice(i, 1)[0];
  writeUsers(all);
  res.json({ ok: true, removed: publicUser(removed) });
});

// --------- WACHTWOORD RESET ----------
router.patch('/users/:id/password', adminGuard, async (req, res) => {
  if (req.admin?.role !== 'superadmin') return res.status(403).json({ error: 'forbidden' });
  const { password } = req.body || {};
  if (!password) return res.status(400).json({ error: 'missing_password' });

  const users = readUsers();
  const i = users.findIndex(u => u.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'not_found' });

  users[i].passhash = await bcrypt.hash(password, 10);
  writeUsers(users);
  res.json({ ok: true, user: publicUser(users[i]) });
});

// ---- (optioneel) DEBUG: toont alleen of het token aanwezig is ----
router.get('/debug/setup', (_req, res) => {
  res.json({ hasSetupToken: !!process.env.SETUP_TOKEN });
});

module.exports = router;
