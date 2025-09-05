const express = require("express");
const router = express.Router();

// Dummy admin gebruikers in geheugen
let admins = [];

// === Registratie ===
router.post("/register", (req, res) => {
  const { token, name, email, password } = req.body || {};

  // Controleer setup token
  if (!process.env.SETUP_TOKEN) {
    return res.status(400).json({ error: "setup_token_missing" });
  }
  if (token !== process.env.SETUP_TOKEN) {
    return res.status(401).json({ error: "setup_token_invalid" });
  }
  if (!name || !email || !password) {
    return res.status(400).json({ error: "missing_fields" });
  }

  // Kijk of admin al bestaat
  if (admins.find((a) => a.email === email)) {
    return res.status(409).json({ error: "already_exists" });
  }

  // Opslaan in geheugen (later vervangen door database)
  admins.push({ name, email, password });
  return res.status(201).json({ ok: true, message: "Admin geregistreerd" });
});

// === Login ===
router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  const found = admins.find((a) => a.email === email && a.password === password);

  if (!found) {
    return res.status(401).json({ error: "invalid_credentials" });
  }

  return res.json({ ok: true, email: found.email, name: found.name });
});

// === Status check ===
router.get("/status", (req, res) => {
  res.json({ ok: true, admins_count: admins.length });
});

module.exports = router;
