// server/routes/admin-users.js
const express = require('express');
const router = express.Router();

// Tijdelijke opslag (kan later naar database)
let admins = [];

// GET alle admins
router.get('/', (req, res) => {
  res.json({ ok: true, users: admins });
});

// POST nieuwe admin
router.post('/', (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ ok: false, error: 'Ontbrekende velden' });
  }

  const user = {
    id: 'adm_' + Date.now(),
    name,
    email,
    role: role || 'admin',
    createdAt: new Date().toISOString()
  };

  admins.push(user);

  res.json({ ok: true, user });
});

module.exports = router;
