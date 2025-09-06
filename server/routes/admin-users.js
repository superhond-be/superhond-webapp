// server/routes/admin-users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');                 // ← hashing
const { requireSuperAdmin, requireAdmin } = require('../helpers/auth');

// In-memory store (later DB)
let admins = [];

// Hulpfunctie: nooit wachtwoord terugsturen
const scrub = (a) => {
  const { password, ...safe } = a;
  return safe;
};

/**
 * Lijst alle admins (alleen superadmin)
 */
router.get('/', requireSuperAdmin, (req, res) => {
  res.json(admins.map(scrub));
});

/**
 * Nieuwe admin toevoegen (alleen superadmin)
 * Body: { name, email, password, role }
 */
router.post('/', requireSuperAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Alle velden zijn verplicht' });
    }

    // bestaat al?
    if (admins.some(a => a.email.toLowerCase() === String(email).toLowerCase())) {
      return res.status(409).json({ error: 'E-mail bestaat al' });
    }

    // hash wachtwoord
    const hash = await bcrypt.hash(password, 12);

    const newAdmin = {
      id: `adm_${Date.now()}`,
      name,
      email,
      password: hash,                     // ← gehashed
      role,                               // 'admin' | 'superadmin'
      createdAt: new Date().toISOString()
    };

    admins.push(newAdmin);
    res.json({ ok: true, user: scrub(newAdmin) });
  } catch (err) {
    console.error('POST /api/admin/users error:', err);
    res.status(500).json({ error: 'Interne fout' });
  }
});

/**
 * Eén admin ophalen (admin + superadmin)
 */
router.get('/:id', requireAdmin, (req, res) => {
  const admin = admins.find(a => a.id === req.params.id);
  if (!admin) return res.status(404).json({ error: 'Admin niet gevonden' });
  res.json(scrub(admin));
});

/**
 * Admin verwijderen (alleen superadmin)
 */
router.delete('/:id', requireSuperAdmin, (req, res) => {
  const before = admins.length;
  admins = admins.filter(a => a.id !== req.params.id);
  res.json({ ok: true, removed: before - admins.length });
});

module.exports = router;
