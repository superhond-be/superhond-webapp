// server/routes/credits.js (v29) — user-level credit ledger
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const DB_PATH = path.join(__dirname, '..', 'data', 'superhond.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS credit_ledger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    delta INTEGER NOT NULL,
    reason TEXT,
    ref_lesson_id INTEGER,
    ref_booking_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE VIEW IF NOT EXISTS user_credit_balance AS
    SELECT user_id, COALESCE(SUM(delta),0) AS balance
    FROM credit_ledger GROUP BY user_id`);
});

const JWT_SECRET = process.env.JWT_SECRET || "superhond-secret";

function requireAuth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ error: "No auth header" });
  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token) return res.status(401).json({ error: "Invalid auth header" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch(e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: "Admin only" });
  next();
}

// GET balance
router.get('/balance', requireAuth, (req, res) => {
  db.get("SELECT COALESCE(SUM(delta),0) AS balance FROM credit_ledger WHERE user_id=?", [req.user.id], (err, row) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ ok: true, balance: (row && row.balance) || 0 });
  });
});

// GET history
router.get('/history', requireAuth, (req, res) => {
  db.all(`SELECT id, delta, reason, ref_lesson_id, ref_booking_id, created_at
          FROM credit_ledger WHERE user_id=? ORDER BY id DESC LIMIT 200`, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ ok: true, history: rows });
  });
});

// POST grant
router.post('/grant', requireAuth, requireAdmin, (req, res) => {
  const { user_id, amount, package_id, note } = req.body || {};
  if (!user_id) return res.status(400).json({ error: "user_id is required" });

  function insertAmount(n, reason) {
    const stmt = db.prepare("INSERT INTO credit_ledger (user_id, delta, reason) VALUES (?,?,?)");
    stmt.run([user_id, n, reason || 'manual'], function(err){
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ ok: true, id: this.lastID, granted: n });
    });
  }

  if (package_id) {
    db.get("SELECT start_credits, naam, lestype FROM lesson_packages WHERE id=?", [package_id], (e, pkg) => {
      if (e || !pkg) return res.status(400).json({ error: "Package not found" });
      insertAmount(Number(pkg.start_credits)||0, `grant_package:${pkg.naam||''}:${pkg.lestype||''}`);
    });
  } else if (typeof amount === 'number') {
    insertAmount(Math.trunc(amount), note || 'manual');
  } else {
    return res.status(400).json({ error: "Provide amount or package_id" });
  }
});

module.exports = router;
