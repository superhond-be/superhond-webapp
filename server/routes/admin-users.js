// server/routes/admin-users.js
const express = require("express");
const router = express.Router();

// Simpele in-memory opslag (vervang later door DB)
let admins = [];

// Lijst ophalen
router.get("/", (req, res) => {
  res.json({ ok: true, users: admins });
});

// Toevoegen
router.post("/", (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({
      ok: false,
      error: "Naam, e-mail en wachtwoord zijn verplicht."
    });
  }
  const user = {
    id: "adm_" + Date.now(),
    name,
    email,
    role: role || "admin",
    createdAt: new Date().toISOString()
  };
  admins.push(user);
  res.json({ ok: true, user });
});

module.exports = router;
