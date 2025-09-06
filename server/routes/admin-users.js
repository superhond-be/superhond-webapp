const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();

// In-memory "database" (later kan dit MongoDB of PostgreSQL worden)
let admins = [];

/**
 * GET /api/admin/users
 * Haalt alle geregistreerde admins op
 */
router.get("/", (req, res) => {
  res.json(admins);
});

/**
 * POST /api/admin/users
 * Voegt een nieuwe admin toe
 * Body: { name, email, password, role }
 */
router.post("/", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Alle velden zijn verplicht." });
    }

    // check of admin al bestaat
    const existing = admins.find((u) => u.email === email);
    if (existing) {
      return res.status(400).json({ error: "Deze gebruiker bestaat al." });
    }

    // wachtwoord versleutelen
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = {
      id: `adm_${Date.now()}`,
      name,
      email,
      password: hashedPassword,
      role, // "superadmin" of "admin"
      createdAt: new Date().toISOString(),
    };

    admins.push(newAdmin);

    res.json({
      ok: true,
      user: { id: newAdmin.id, name: newAdmin.name, email: newAdmin.email, role: newAdmin.role },
    });
  } catch (err) {
    res.status(500).json({ error: "Serverfout bij toevoegen admin." });
  }
});

module.exports = router;
