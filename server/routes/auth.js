
// server/routes/auth.js
const express = require("express");
const router = express.Router();
const {
  findAdminByEmail,
  verifyPassword,
  getUserFromSession,
  requireAuth
} = require("../helpers/auth");

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ ok: false, error: "missing_fields" });

    const user = findAdminByEmail(email);
    if (!user) return res.status(401).json({ ok: false, error: "invalid_credentials" });

    const ok = await verifyPassword(password, user);
    if (!ok) return res.status(401).json({ ok: false, error: "invalid_credentials" });

    // Store minimal user in session
    req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    res.json({ ok: true, user: req.session.user });
  } catch (err) {
    console.error("login error", err);
    res.status(500).json({ ok: false, error: "server_error" });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// GET /api/auth/me
router.get("/me", (req, res) => {
  const me = getUserFromSession(req);
  res.json({ ok: true, user: me || null });
});

// Example of a protected ping
router.get("/ping", requireAuth, (_req, res) => {
  res.json({ ok: true, pong: true });
});

module.exports = router;
