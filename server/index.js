// server/index.js
// Superhond — Express server (v22+ compatible)

const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

const app = express();

// ---- Config -------------------------------------------------
const PORT = process.env.PORT || 3000;
process.env.JWT_SECRET = process.env.JWT_SECRET || 'superhond-secret'; // zet dit in productie via env

// ---- Middleware --------------------------------------------
// parsers
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS (optioneel, handig bij lokale tests of aparte frontends)
app.use(cors());

// ---- Static files ------------------------------------------
const publicDir = path.join(__dirname, '..', 'public');
fs.mkdirSync(publicDir, { recursive: true });
app.use(express.static(publicDir));

// ---- Ensure data dir exists (voor SQLite db e.d.) -----------
const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

// ---- API routes --------------------------------------------
// Auth (v17+ / v19+ / v21+ uitgebreid)
try {
  app.use('/api/auth', require('./routes/auth'));
} catch (e) {
  console.warn('Let op: routes/auth.js niet gevonden of foutief. v17+ nodig.', e.message);
}

// Import (v15)
try {
  app.use('/api/import', require('./routes/import'));
} catch (e) {
  // niet verplicht in elke release
}

// Dogs (v22)
try {
  app.use('/api/dogs', require('./routes/dogs'));
} catch (e) {
  console.warn('Let op: routes/dogs.js niet gevonden of foutief. v22 nodig.', e.message);
}

// Lessen (v20/v21/v22)
try {
  app.use('/api/lessen', require('./routes/lessen'));
} catch (e) {
  console.warn('Let op: routes/lessen.js niet gevonden of foutief. v20+ nodig.', e.message);
}

// ---- Healthcheck -------------------------------------------
app.get('/health', (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString(), version: getVersionSafe(publicDir) });
});

// ---- Root → dashboard --------------------------------------
app.get('/', (_req, res) => {
  // Toon het nieuwe dashboard als het bestaat, anders index.html
  const dashboard = path.join(publicDir, 'dashboard.html');
  const indexHtml = path.join(publicDir, 'index.html');
  if (fs.existsSync(dashboard)) return res.sendFile(dashboard);
  if (fs.existsSync(indexHtml)) return res.sendFile(indexHtml);
  res.status(404).send('No dashboard found (public/dashboard.html of public/index.html ontbreekt).');
});

// ---- Fallback 404 voor onbekende API-routes ----------------
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// ---- Server start ------------------------------------------
app.listen(PORT, () => {
  console.log(`Superhond server draait op http://localhost:${PORT}`);
});

// ---- helpers -----------------------------------------------
function getVersionSafe(publicDir) {
  try {
    const v = JSON.parse(fs.readFileSync(path.join(publicDir, 'version.json'), 'utf8'));
    return v && v.version || null;
  } catch {
    return null;
  }
}
