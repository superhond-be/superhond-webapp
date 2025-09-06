// server/routes/admin-users.js
const express = require('express');
const router = express.Router();

// In-memory opslag (later vervangen door database)
let users = [];

// Nieuwe gebruiker toevoegen
router.post('/', (req, res) => {
  const { name, email, role, password } = req.body;

  if (!name || !email || !role || !password) {
    return res.status(400).json({ ok: false, error: 'Alle velden verplicht' });
  }

  const newUser = {
    id: 'adm_' + Date.now(),
    name,
    email,
    role,
    password, // ⚠️ in productie: hashen met bcrypt!
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  res.json({ ok: true, user: newUser });
});

// Alle gebruikers ophalen
router.get('/', (req, res) => {
  res.json({ ok: true, users });
});

module.exports = router;
