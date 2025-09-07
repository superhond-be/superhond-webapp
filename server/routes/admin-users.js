// server/routes/admin-users.js
const express = require('express');
const router = express.Router();
const store = require('../models/adminStore');

// Alle admins
router.get('/', (req, res) => {
  try {
    const users = store.getAll();
    res.json({ ok: true, users });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Nieuwe admin toevoegen
router.post('/', express.json(), (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'E-mail en wachtwoord zijn verplicht.' });
    }
    const user = store.create({ name, email, password, role });
    res.json({ ok: true, user });
  } catch (e) {
    if (e.code === 'DUPLICATE') {
      return res.status(409).json({ ok: false, error: e.message });
    }
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
