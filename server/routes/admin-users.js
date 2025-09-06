// server/routes/admin-users.js
const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { requireLogin, requireRole } = require('../helpers/auth');
const store = require('../helpers/adminStore');

const router = express.Router();

/**
 * GET /api/admin/users
 * Admin of superadmin mag lijst bekijken (zonder wachtwoordHash).
 */
router.get('/users', requireLogin, requireRole('admin'), async (req, res) => {
  const all = await store.getAllAdmins();
  const safe = all.map(({ passwordHash, ...rest }) => rest);
  res.json({ ok: true, users: safe });
});

/**
 * POST /api/admin/users
 * Alleen superadmin mag nieuwe admin/superadmin aanmaken.
 * body: { name, email, password, role }
 */
router.post('/users', requireLogin, requireRole('superadmin'), async (req, res) => {
  try {
    const { name, email, password, role } = (req.body || {});
    if (!name || !email || !password || !role) {
      return res.status(400).json({ ok: false, error: 'missing_fields' });
    }
    if (!['admin', 'superadmin'].includes(role)) {
      return res.status(400).json({ ok: false, error: 'invalid_role' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const id = 'adm_' + crypto.randomUUID().replace(/-/g, '').slice(0, 12);

    const user = await store.createAdmin({ id, name, email, role, passwordHash });
    const { passwordHash: _, ...safe } = user;
    res.json({ ok: true, user: safe });
  } catch (e) {
    if (e.message === 'email_exists') {
      return res.status(409).json({ ok: false, error: 'email_exists' });
    }
    console.error('create admin error', e);
    res.status(500).json({ ok: false, error: 'server_error' });
  }
});

module.exports = router;
