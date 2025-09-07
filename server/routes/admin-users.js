// server/routes/admin-users.js
const express = require("express");
const router = express.Router();

// Tijdelijke opslag in geheugen (kan later vervangen door DB)
let admins = [];

// GET - lijst van alle admins
router.get("/", (req, res) => {
  res.json({
    ok: true,
    users: admins
  });
});

// POST - nieuwe admin toevoegen
router.post("/", (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      ok: false,
      error: "Naam, e-mail en wachtwoord zijn verplicht"
    });
  }

  // Nieuwe admin object
  const newAdmin = {
    id: "adm_" + Date.now(),
    name,
    email,
    role: role || "admin",
    createdAt: new Date().toISOString()
  };

  admins.push(newAdmin);

  res.json({
    ok: true,
    user: newAdmin
  });
});

module.exports = router;
