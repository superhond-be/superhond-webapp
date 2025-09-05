// server/routes/admin.js
const express = require("express");
const router = express.Router();

// Dummy databank van admins (later vervangen door echte DB)
let admins = [
  { id: 1, name: "Sofie Thijs", email: "info@superhond.be" }
];

// ✅ Status endpoint
router.get("/status", (req, res) => {
  try {
    const aantalAdmins = admins.length; // tel huidige admins
    res.json({
      ok: true,
      admins_count: aantalAdmins
    });
  } catch (err) {
    console.error("Status error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ✅ (optioneel) Endpoint om alle admins te tonen
router.get("/", (req, res) => {
  res.json({ ok: true, admins });
});

// ✅ (optioneel) Endpoint om nieuwe admin toe te voegen
router.post("/", (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ ok: false, error: "Naam en e-mail verplicht" });
  }
  const newAdmin = { id: admins.length + 1, name, email };
  admins.push(newAdmin);
  res.json({ ok: true, admin: newAdmin });
});

module.exports = router;
