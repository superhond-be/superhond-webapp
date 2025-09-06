// server/routes/admin.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const adminGuard = require('../helpers/adminGuard');

// >>> Simpele in-memory "DB". Vervang later door echte opslag.
const ADMINS = [];
const SETUP_TOKEN = process.env.SETUP_TOKEN || '';
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

// ----- Helpers
function publicAdminView(a) {
  const { passwordHash, ...rest } = a;
  return rest;
}

// ----- Status (voor dashboardknop)
router.get('/admin/status', (req, res) => {
  res.json({ count: ADMINS.length, hasSetupToken: !!SETUP_TOKEN });
});

// ----- Eerste superadmin registreren met setup token
router.post('/admin/register', (req, res) => {
  const { token, name, email, password } = req.body || {};
  if (!SETUP_TOKEN) return res.status(400).json({ error: 'setup_token_missing' });
  if (token !== SETUP_TOKEN) return res.status(401).json({ error: 'setup_token_invalid' });
  if (!name || !email || !password) return res.status(400).json({ error: 'missing_fields' });

  if (ADMINS.find(a => a.email === email)) {
    return res.status(409).json({ error: 'email_exists' });
  }
  const id = `adm_${Date.now()}`;
  const passwordHash = bcrypt.hashSync(password, 10);
  ADMINS.push({ id, name, email, passwordHash, role: 'superadmin', createdAt: new Date().toISOString() });
  res.json({ ok: true, user: publicAdminView(ADMINS.at(-1)) });
});

// ----- Login -> JWT
router.post('/admin/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = ADMINS.find(a => a.email === email);
  if (!user) return res.status(401).json({ error: 'invalid_login' });
  const ok = bcrypt.compareSync(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid_login' });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '2h' }
  );
  res.json({ token, user: publicAdminView(user) });
});

// ----- Very light JWT attach (zet req.user als er Bearer token is)
router.use((req, _res, next) => {
  const h = req.headers.authorization;
  if (h && h.startsWith('Bearer ')) {
    const tok = h.slice(7);
    try { req.user = jwt.verify(tok, JWT_SECRET); } catch { /* ignore */ }
  }
  next();
});

// ----- Admin users CRUD (add + list)
// create
router.post('/admin/users', adminGuard, (req, res) => {
  const { name, email, password, role = 'admin' } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: 'missing_fields' });
  if (ADMINS.find(a => a.email === email)) return res.status(409).json({ error: 'email_exists' });

  const id = `adm_${Date.now()}`;
  const passwordHash = bcrypt.hashSync(password, 10);
  const newUser = { id, name, email, passwordHash, role, createdAt: new Date().toISOString() };
  ADMINS.push(newUser);
  res.json({ ok: true, user: publicAdminView(newUser) });
});

// list
router.get('/admin/users', adminGuard, (_req, res) => {
  res.json(ADMINS.map(publicAdminView));
});

module.exports = router;
