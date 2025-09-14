// server/routes/packages.js (v29) — beheer van lespakketten
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
  db.run(`CREATE TABLE IF NOT EXISTS lesson_packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    naam TEXT,
    lestype TEXT,
    start_credits INTEGER DEFAULT 0
  )`);
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

// GET alle pakketten
router.get('/', requireAuth, requireAdmin, (req, res) => {
  db.all("SELECT * FROM lesson_packages ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ ok: true, packages: rows });
  });
});

// POST nieuw pakket
router.post('/', requireAuth, requireAdmin, (req, res) => {
  const { naam, lestype, start_credits } = req.body || {};
  if (!naam || !lestype) return res.status(400).json({ error: "naam en lestype verplicht" });
  const stmt = db.prepare("INSERT INTO lesson_packages (naam, lestype, start_credits) VALUES (?,?,?)");
  stmt.run([naam, lestype, start_credits || 0], function(err){
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ ok: true, id: this.lastID });
  });
});

// DELETE pakket
router.delete('/:id', requireAuth, requireAdmin, (req, res) => {
  db.run("DELETE FROM lesson_packages WHERE id=?", [req.params.id], function(err){
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ ok: true, deleted: this.changes });
  });
});

module.exports = router;
