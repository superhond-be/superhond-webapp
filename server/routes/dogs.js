// server/routes/dogs.js (v22) — dogs with credits
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const DB_PATH = path.join(__dirname, '..', 'data', 'superhond.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new sqlite3.Database(DB_PATH);

// Table dogs
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS dogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    naam TEXT,
    ras TEXT,
    geboortedatum TEXT,
    credits INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
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

// List dogs for logged-in user
router.get('/', requireAuth, (req, res) => {
  db.all("SELECT * FROM dogs WHERE user_id=?", [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ ok: true, dogs: rows });
  });
});

// Add dog
router.post('/', requireAuth, (req, res) => {
  const { naam, ras, geboortedatum, credits } = req.body;
  if (!naam) return res.status(400).json({ error: "Naam is verplicht" });
  const stmt = db.prepare("INSERT INTO dogs (user_id, naam, ras, geboortedatum, credits) VALUES (?,?,?,?,?)");
  stmt.run([req.user.id, naam, ras||'', geboortedatum||'', credits||0], function(err){
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ ok: true, id: this.lastID });
  });
});

module.exports = router;
