// server/routes/admin-users.js
// Eenvoudige admin-user beheer (DEMO: geen hashing/rollen-check voor productie)
const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE  = path.join(DATA_DIR, 'admins.json');

// ===== helpers =====
function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '[]', 'utf8');
}
function load() {
  ensureStore();
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
  catch { return []; }
}
function save(list) {
  ensureStore();
  fs.writeFileSync(DB_FILE, JSON.stringify(list, null, 2), 'utf8');
}
function uid(prefix='adm') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2,7)}`;
}

// GET /api/admin/users  -> lijst
router.get('/users', (_req, res) => {
  try {
    res.json({ ok: true, users: load() });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'read_failed', details: String(e?.message || e) });
  }
});

// POST /api/admin/users  -> nieuwe admin
// body: { name, email, password, role }
router.post('/users', express.json(), (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};
    if (!name || !email) return res.status(400).json({ ok: false, error: 'name_email_required' });

    const users = load();
    if (users.some(u => u.email?.toLowerCase() === String(email).toLowerCase())) {
      return res.status(409).json({ ok: false, error: 'email_exists' });
    }

    const user = {
      id: uid(),
      name: String(name),
      email: String(email),
      // DEMO: sla plaintext op (voor productie -> bcrypt!) 
      password: password ? String(password) : undefined,
      role: role === 'superadmin' ? 'superadmin' : 'admin',
      createdAt: new Date().toISOString()
    };
    users.push(user);
    save(users);
    res.status(201).json({ ok: true, user });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'create_failed', details: String(e?.message || e) });
  }
});

// (optioneel) DELETE /api/admin/users/:id
router.delete('/users/:id', (req, res) => {
  try {
    const id = req.params.id;
    const users = load();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return res.status(404).json({ ok: false, error: 'not_found' });
    const [removed] = users.splice(idx, 1);
    save(users);
    res.json({ ok: true, removed });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'delete_failed', details: String(e?.message || e) });
  }
});

module.exports = router;
