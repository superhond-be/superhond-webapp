// server/routes/admin.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const router = express.Router();

const DATA_DIR = path.join(__dirname, "../../data");
const ADMINS_FILE = path.join(DATA_DIR, "admins.json");

// — Helpers ---------------------------------------------------
function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(ADMINS_FILE)) fs.writeFileSync(ADMINS_FILE, "[]", "utf-8");
}
function readAdmins() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(ADMINS_FILE, "utf-8"));
}
function writeAdmins(admins) {
  fs.writeFileSync(ADMINS_FILE, JSON.stringify(admins, null, 2), "utf-8");
}
function hashPassword(pw) {
  // eenvoudige hash (geen extra dependency)
  return crypto.createHash("sha256").update(pw).digest("hex");
}

// — Routes ----------------------------------------------------

// Status voor dashboard-kaart
// GET /api/admin/status  -> { count: number, hasSetupToken: boolean }
router.get("/status", (req, res) => {
  const admins = readAdmins();
  const hasSetupToken = !!process.env.SETUP_TOKEN && String(process.env.SETUP_TOKEN).length > 0;
  res.json({ count: admins.length, hasSetupToken });
});

// Lijst met admin users
// GET /api/admin/users
router.get("/users", (req, res) => {
  const admins = readAdmins().map(a => ({ id: a.id, name: a.name, email: a.email, role: a.role }));
  res.json({ admins });
});

// Nieuwe admin toevoegen
// POST /api/admin/users   body: { name, email, password, role? }
router.post("/users", (req, res) => {
  const { name, email, password, role } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Naam, e-mail en wachtwoord zijn verplicht." });
  }

  const admins = readAdmins();

  if (admins.find(a => a.email.toLowerCase() === String(email).toLowerCase())) {
    return res.status(400).json({ error: "Deze gebruiker bestaat al." });
  }

  const newAdmin = {
    id: Date.now(),
    name: String(name).trim(),
    email: String(email).toLowerCase().trim(),
    password: hashPassword(String(password)),
    role: role === "superadmin" ? "superadmin" : "admin",
    createdAt: new Date().toISOString()
  };

  admins.push(newAdmin);
  writeAdmins(admins);

  res.json({
    message: "Admin toegevoegd",
    admin: { id: newAdmin.id, name: newAdmin.name, email: newAdmin.email, role: newAdmin.role }
  });
});

module.exports = router;
