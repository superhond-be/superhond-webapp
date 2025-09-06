// server/routes/admin-users.js
const express = require('express');
const router = express.Router();

/**
 * Eenvoudige in-memory store.
 * (Later kunnen we dit vervangen door een bestand/DB.)
 */
const users = [];

/**
 * GET /api/admin/users
 * Alle admin users ophalen
 */
router.get('/', (req, res) => {
  res.json({ ok: true, users });
});

/**
 * POST /api/admin/users
 * Nieuwe admin user toevoegen
 * body: { name, email, password, role }
 */
router.post('/', (req, res) => {
  const { name, email, password, role } = req.body || {};

  if (!name || !email || !password || !role) {
    return res.status(400).json({ ok: false, error: 'Alle velden zijn verplicht.' });
  }

  // heel basic: geen hashing (mag later met bcrypt)
  const user = {
    id: `adm_${Date.now()}`,
    name,
    email,
    role,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  res.json({ ok: true, user });
});

module.exports = router;
