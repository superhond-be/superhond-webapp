// server/routes/admin.js
const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const bcrypt = require('bcryptjs');
const adminGuard = require('../helpers/adminGuard'); // verwacht req.user { id, role, email, name }
const router = express.Router();

const ADMINS_FILE = path.join(__dirname, '../../data/admins.json');
const SETUP_TOKEN = process.env.SETUP_TOKEN || '';
const SALT_ROUNDS = 10;

// ---------- helpers ----------
async function readJsonSafe(file, fallback) {
  try {
    const txt = await fs.readFile(file, 'utf8');
    return JSON.parse(txt);
  } catch (e) {
    if (e.code === 'ENOENT') return fallback;
    throw e;
  }
}

async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(value, null, 2), 'utf8');
}

function sanitizeUser(u) {
  const { passwordHash, ...clean } = u;
  return clean;
}

function requireSuperadmin(req, res, next) {
  if (req.user?.role !== 'superadmin') {
    return res.status(403).json({ error: 'forbidden', reason: 'superadmin_only' });
  }
  next();
}

// ---------- status (publiek) ----------
router.get('/api/admin/status', async (req, res) => {
  const admins = await readJsonSafe(ADMINS_FILE, []);
  res.json({
    count: admins.length,
    hasSetupToken: Boolean(SETUP_TOKEN)
  });
});

// ---------- lijst admins (beschermd) ----------
router.get('/api/admin/users', adminGuard, async (req, res) => {
  const admins = await readJsonSafe(ADMINS_FILE, []);
  res.json(admins.map(sanitizeUser));
});

// ---------- nieuwe admin (alleen superadmin) ----------
router.post('/api/admin/users', adminGuard, requireSuperadmin, async (req, res) => {
  try {
    const { name, email, password, role = 'admin' } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'validation_error', fields: ['name','email','password'] });
    }
    if (!['admin', 'superadmin'].includes(role)) {
      return res.status(400).json({ error: 'validation_error', fields: ['role'] });
    }

    const admins = await readJsonSafe(ADMINS_FILE, []);
    const exists = admins.find(a => a.email.toLowerCase() === String(email).toLowerCase());
    if (exists) {
      return res.status(409).json({ error: 'email_in_use' });
    }

    const passwordHash = await bcrypt.hash(String(password), SALT_ROUNDS);
    const id = (global.crypto?.randomUUID?.() || require('crypto').randomUUID());
    const now = new Date().toISOString();

    const newUser = {
      id,
      name: String(name),
      email: String(email).toLowerCase(),
      role,
      createdAt: now,
      updatedAt: now,
      passwordHash
    };

    admins.push(newUser);
    await writeJson(ADMINS_FILE, admins);

    res.status(201).json(sanitizeUser(newUser));
  } catch (err) {
    console.error('POST /api/admin/users error', err);
    res.status(500).json({ error: 'server_error' });
  }
});

// ---------- verwijder admin (alleen superadmin) ----------
router.delete('/api/admin/users/:id', adminGuard, requireSuperadmin, async (req, res) => {
  try {
    const { id } = req.params;
    const admins = await readJsonSafe(ADMINS_FILE, []);

    const idx = admins.findIndex(a => a.id === id);
    if (idx === -1) return res.status(404).json({ error: 'not_found' });

    // superadmin mag zichzelf niet verwijderen (voorkomt lock-out)
    if (admins[idx].id === req.user.id) {
      return res.status(400).json({ error: 'cannot_delete_self' });
    }

    const removed = admins.splice(idx, 1)[0];
    await writeJson(ADMINS_FILE, admins);

    res.json({ deleted: sanitizeUser(removed) });
  } catch (err) {
    console.error('DELETE /api/admin/users/:id error', err);
    res.status(500).json({ error: 'server_error' });
  }
});

// ---------- reset wachtwoord (superadmin of gebruiker zelf) ----------
router.patch('/api/admin/users/:id/password', adminGuard, async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body || {};
    if (!password || String(password).length < 8) {
      return res.status(400).json({ error: 'validation_error', fields: ['password_min_8'] });
    }

    const admins = await readJsonSafe(ADMINS_FILE, []);
    const user = admins.find(a => a.id === id);
    if (!user) return res.status(404).json({ error: 'not_found' });

    const isSelf = req.user?.id === id;
    const isSuper = req.user?.role === 'superadmin';
    if (!isSelf && !isSuper) {
      return res.status(403).json({ error: 'forbidden' });
    }

    user.passwordHash = await bcrypt.hash(String(password), SALT_ROUNDS);
    user.updatedAt = new Date().toISOString();
    await writeJson(ADMINS_FILE, admins);

    res.json({ ok: true });
  } catch (err) {
    console.error('PATCH /api/admin/users/:id/password error', err);
    res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;
