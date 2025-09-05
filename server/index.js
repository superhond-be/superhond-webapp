// server/index.js
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

const app = express();

// ==== Basis middleware ====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==== Static files ====
app.use(express.static(path.join(__dirname, '..', 'public')));

// ==== Zorg dat data-map bestaat ====
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// ==== Routes ====
app.use('/api/admin', require('./routes/admin')); // <— NIEUW: admin API

// Gezondheidscheck
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development' });
});

// Catch-all naar dashboard (optioneel)
app.get('*', (req, res, next) => {
  // Laat API routes passeren
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, '..', 'public', 'dashboard.html'));
});

// ==== Start server ====
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🐶 Superhond server luistert op ${PORT}`);
});
