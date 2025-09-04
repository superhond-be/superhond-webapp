// server/routes/admin.js
const express = require('express');
const jwt = require('jsonwebtoken');
const {
  readUsers,
  writeUsers,
  createUser,
  verifyUser,
  publicUser
} = require('../helpers/adminUsers');
const adminGuard = require('../adminGuard');

const router = express.Router();                 // ← belangrijk!
const SECRET = process.env.ADMIN_JWT_SECRET || 'devsecret';

/**
 * POST /api/admin/register
 * Body: { token, name, email, password, role? }
 * - Alleen met SETUP_TOKEN toegestaan.
 * - Eerste gebruiker wordt automatisch superadmin.
 */
router.post('/register', async (req, res) => {
  try {
    const { token, name, email, password, role } = req.body || {};
    if (!token || token !== process.env.SETUP_TOKEN) {
      return res.status(401).json({ error: 'setup_token_invalid' });
    }
    const isFirst = readUsers().length === 0;
    const user = await createUser({
      name,
      email,
      password,
      role: isFirst ? 'superadmin' : (role || 'admin')
    });
    res.status(201).json({ ok: true, user });
  } catch (e) {
    res.status(400).json({ error: e.message || 'register_failed' });
  }
});

/**
 * POST /api/admin/login
 * Body: { email, password }
 * → { token, user }
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = await verifyUser(email, password);
  if (!user) return res.status(401).json({ error: 'invalid_credentials' });

  const token = jwt.sign(
    { uid: user.id, email: user.email, role: user.role, name: user.name },
    SECRET,
    { expiresIn: '8h' }
  );
  res.json({ ok: true, token, user });
});

/**
 * GET /api/admin/users
 * Alleen superadmin.
 */
router.get('/users', adminGuard, (req, res) => {
  if (req.admin?.role !== 'superadmin') {
    return res.status(403).json({ error: 'forbidden' });
  }
  res.json(readUsers().map(publicUser));
});

/**
 * POST /api/admin/users
 * Body: { name, email, password, role }
 * Alleen superadmin.
 */
router.post('/users', adminGuard, async (req, res) => {
  if (req.admin?.role !== 'superadmin') {
    return res.status(403).json({ error: 'forbidden' });
  }
  try {
    const u = await createUser(req.body);
    res.status(201).json(u);
  } catch (e) {
    res.status(400).json({ error: e.message || 'create_failed' });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Alleen superadmin.
 */
router.delete('/users/:id', adminGuard, (req, res) => {
  if (req.admin?.role !== 'superadmin') {
    return res.status(403).json({ error: 'forbidden' });
  }
  const all = readUsers();
  const i = all.findIndex(u => u.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'not_found' });
  const removed = all.splice(i, 1);
  writeUsers(all);
  res.json({ ok: true, removed: publicUser(removed[0]) });
});

/**
 * PATCH /api/admin/users/:id/password
 * Body: { password }
 * Alleen superadmin.
 */
router.patch('/users/:id/password', adminGuard, async (req, res) => {
  if (req.admin?.role !== 'superadmin') {
    return res.status(403).json({ error: 'forbidden' });
  }
  const { password } = req.body || {};
  if (!password) return res.status(400).json({ error: 'missing_password' });

  const bcrypt = require('bcryptjs');
  const users = readUsers();
  const i = users.findIndex(u => u.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'not_found' });

  users[i].passhash = await bcrypt.hash(password, 10);
  writeUsers(users);
  res.json({ ok: true, user: publicUser(users[i]) });
});

module.exports = router;
