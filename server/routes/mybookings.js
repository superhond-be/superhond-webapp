// server/routes/mybookings.js (v27)
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const DB_PATH = path.join(__dirname, '..', 'data', 'superhond.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new sqlite3.Database(DB_PATH);

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

// GET /api/bookings/mine — all bookings for logged-in user
router.get('/mine', requireAuth, (req, res) => {
  db.all(`SELECT b.id, b.status, b.created_at,
                 l.naam as lesnaam, l.lestype, l.les_datum, l.les_tijd, l.locatie,
                 d.naam as hond_naam, d.ras as hond_ras
          FROM bookings b
          JOIN lessons l ON b.les_id = l.id
          JOIN dogs d ON b.dog_id = d.id
          WHERE b.user_id=?
          ORDER BY l.les_datum ASC, l.les_tijd ASC`,
    [req.user.id], (err, rows) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ ok:true, bookings: rows });
    });
});

// DELETE /api/bookings/:id — cancel own booking (refund credits)
router.delete('/:id', requireAuth, (req,res) => {
  const id = Number(req.params.id);
  db.get(`SELECT b.*, l.strippen, d.id as dog_id FROM bookings b
          JOIN lessons l ON b.les_id=l.id
          JOIN dogs d ON b.dog_id=d.id
          WHERE b.id=? AND b.user_id=? AND b.status='active'`,
    [id, req.user.id], (err, row) => {
      if (err) return res.status(500).json({ error:"Database error" });
      if (!row) return res.status(404).json({ error:"Boeking niet gevonden of al geannuleerd" });
      db.run("UPDATE bookings SET status='cancelled' WHERE id=?", [id], function(e2){
        if (e2) return res.status(500).json({ error:"Annuleer fout" });
        const refund = Number(row.strippen)||1;
        db.run("UPDATE dogs SET credits=credits+? WHERE id=?", [refund,row.dog_id], function(e3){
          if (e3) return res.status(500).json({ error:"Refund fout" });
          res.json({ ok:true });
        });
      });
    });
});

module.exports = router;
