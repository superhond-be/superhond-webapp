const express = require('express');
const router = express.Router();

// Tijdelijke opslag in memory
let users = [];

// Voeg een admin toe
router.post('/', (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Alle velden zijn verplicht' });
  }

  const newUser = {
    id: `adm_${Date.now()}`,
    name,
    email,
    role,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  res.json({ ok: true, user: newUser });
});

// Haal alle admins op
router.get('/', (req, res) => {
  res.json(users);
});

module.exports = router;
