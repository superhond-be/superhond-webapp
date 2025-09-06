// server/routes/admin-users.js
const express = require('express');
const { addUser, getUsers } = require('../store/adminStore');
const router = express.Router();

// Nieuwe gebruiker toevoegen
router.post('/', (req, res) => {
  const { name, email, role, password } = req.body;

  if (!name || !email || !role || !password) {
    return res.status(400).json({ ok: false, error: 'Alle velden verplicht' });
  }

  const user = {
    id: 'adm_' + Date.now(),
    name,
    email,
    role,
    password, // ⚠️ productie: hash met bcrypt
    createdAt: new Date().toISOString(),
  };

  addUser(user);
  res.json({ ok: true, user });
});

// Alle gebruikers ophalen
router.get('/', (_req, res) => {
  res.json({ ok: true, users: getUsers() });
});

module.exports = router;
