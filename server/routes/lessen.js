// server/routes/lessen.js (v22) — bookings now linked to dogs with credits
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const DB_PATH = path.join(__dirname, '..', 'data', 'superhond.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new sqlite3.Database(DB_PATH);

// Ensure lessons + bookings tables exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    naam TEXT,
    lestype TEXT,
    max_deelnemers INTEGER,
    prijs REAL,
    beschrijving TEXT,
    les_duur TEXT,
    strippen INTEGER,
    startdatum TEXT,
    les_datum TEXT,
    les_tijd TEXT,
    locatie TEXT,
    lesgevers TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    les_id INTEGER,
    user_id INTEGER,
    dog_id INTEGER,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (les_id) REFERENCES lessons(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (dog_id) REFERENCES dogs(id)
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

// BOOK (auth) — now requires dog_id, deduct credits from that dog
router.post('/:id/book', requireAuth, (req, res) => {
  const les_id = Number(req.params.id);
  const { dog_id } = req.body;
  if (!dog_id) return res.status(400).json({ error: "dog_id is required" });
  db.get("SELECT * FROM dogs WHERE id=? AND user_id=?", [dog_id, req.user.id], (err, dog) => {
    if (err || !dog) return res.status(400).json({ error: "Dog not found" });
    db.get(`SELECT *,
      (SELECT COUNT(*) FROM bookings b WHERE b.les_id = lessons.id AND b.status='active') as inschrijvingen
      FROM lessons WHERE id=?`, [les_id], (e2, les) => {
      if (e2 || !les) return res.status(404).json({ error: "Les niet gevonden" });
      if (les.max_deelnemers && Number(les.inschrijvingen) >= les.max_deelnemers) return res.status(400).json({ error: "Volzet" });
      const cost = Number(les.strippen) || 1;
      if ((dog.credits||0) < cost) return res.status(400).json({ error: "Onvoldoende credits voor deze hond" });
      db.get("SELECT id FROM bookings WHERE les_id=? AND dog_id=? AND status='active'", [les_id, dog_id], (e3, existing) => {
        if (existing) return res.status(400).json({ error: "Deze hond is al ingeschreven" });
        db.run("INSERT INTO bookings (les_id, user_id, dog_id, status) VALUES (?,?,?, 'active')", [les_id, req.user.id, dog_id], function(e4){
          if (e4) return res.status(500).json({ error: "Booking error" });
          db.run("UPDATE dogs SET credits=credits-? WHERE id=?", [cost, dog_id], function(e5){
            if (e5) return res.status(500).json({ error: "Credits update error" });
            res.json({ ok: true, booking_id: this.lastID });
          });
        });
      });
    });
  });
});

// UNBOOK (auth) — refund credits to dog
router.delete('/:id/book', requireAuth, (req, res) => {
  const les_id = Number(req.params.id);
  const { dog_id } = req.body;
  if (!dog_id) return res.status(400).json({ error: "dog_id is required" });
  db.get("SELECT * FROM dogs WHERE id=? AND user_id=?", [dog_id, req.user.id], (err, dog) => {
    if (err || !dog) return res.status(400).json({ error: "Dog not found" });
    db.get("SELECT * FROM lessons WHERE id=?", [les_id], (e2, les) => {
      if (e2 || !les) return res.status(404).json({ error: "Les niet gevonden" });
      const refund = Number(les.strippen) || 1;
      db.get("SELECT * FROM bookings WHERE les_id=? AND dog_id=? AND status='active'", [les_id, dog_id], (e3, b) => {
        if (e3 || !b) return res.status(400).json({ error: "Geen actieve boeking" });
        db.run("UPDATE bookings SET status='cancelled' WHERE id=?", [b.id], function(e4){
          if (e4) return res.status(500).json({ error: "Annuleer error" });
          db.run("UPDATE dogs SET credits=credits+? WHERE id=?", [refund, dog_id], function(e5){
            if (e5) return res.status(500).json({ error: "Credits update error" });
            res.json({ ok: true });
          });
        });
      });
    });
  });
});

// BOOKINGS LIST (admin) — show user + dog info
router.get('/:id/bookings', requireAuth, requireAdmin, (req, res) => {
  const les_id = Number(req.params.id);
  db.all(`SELECT b.id, u.name as eigenaar, u.email, d.naam as hond, d.ras, b.status, b.created_at
          FROM bookings b 
          JOIN users u ON b.user_id=u.id
          JOIN dogs d ON b.dog_id=d.id
          WHERE b.les_id=? ORDER BY b.created_at DESC`, [les_id], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ ok: true, bookings: rows });
  });
});

module.exports = router;
