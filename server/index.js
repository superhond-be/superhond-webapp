// server/index.js — fixed version for v15
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
module.exports = app;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static serve
const publicDir = path.join(__dirname, '..', 'public');
fs.mkdirSync(publicDir, { recursive: true });
console.log('[BOOT] publicDir =', publicDir, 'index exists?', fs.existsSync(path.join(publicDir,'index.html')));

app.use(express.static(publicDir));

// Root route
app.get('/', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Import routes (v15)
try {
  app.use('/api/import', require('./routes/import'));
} catch (e) {
  console.warn('[WARN] routes/import.js not found or failed to load:', e.message);
}

// Healthcheck
app.get('/health', (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Superhond server running at http://localhost:${PORT}`);
});
