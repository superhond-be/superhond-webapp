// server/index.js
// Superhond — Express server (v27)

const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

const app = express();

// ---- Config -------------------------------------------------
const PORT = process.env.PORT || 3000;
// Zet deze secret in productie via echte env var
process.env.JWT_SECRET = process.env.JWT_SECRET || 'superhond-secret';

// ---- Middleware --------------------------------------------
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ---- Static files ------------------------------------------
const publicDir = path.join(__dirname, '..', 'public');
fs.mkdirSync(publicDir, { recursive: true });
app.use(express.static(publicDir));

// ---- Data dir (SQLite e.d.) --------------------------------
const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

// ---- API routes --------------------------------------------
// Auth (v17/v19/v21+)
mount('/api/auth', './routes/auth');

// Dogs (v22)
mount('/api/dogs', './routes/dogs');

// Lessons (v20/v21/v22+)
mount('/api/lessen', './routes/lessen');

// Lookup (v23)
mount('/api/lookup', './routes/lookup');

// Bookings (v27)
mount('/api/bookings', './routes/bookings');

// Import (v15) — optioneel, alleen mounten als aanwezig
mountOptional('/api/import', './routes/import');

// ---- Healthcheck -------------------------------------------
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    ts: new Date().toISOString(),
    version: getVersionSafe(publicDir),
  });
});

// ---- Root → dashboard --------------------------------------
app.get('/', (_req, res) => {
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

// ---- Helpers -----------------------------------------------
function mount(prefix, relPath) {
  try {
    app.use(prefix, require(relPath));
    console.log(`Mounted ${prefix} -> ${relPath}`);
  } catch (e) {
    console.error(`FOUT bij mounten van ${prefix} (${relPath}):`, e.message);
    process.exitCode = 1; // laat deploy slagen maar markeer als probleem in logs
  }
}

function mountOptional(prefix, relPath) {
  try {
    const mod = require(relPath);
    app.use(prefix, mod);
    console.log(`Mounted (optional) ${prefix} -> ${relPath}`);
  } catch (e) {
    console.warn(`Optionele route niet gevonden: ${prefix} (${relPath}) — overslaan.`);
  }
}

function getVersionSafe(publicDir) {
  try {
    const v = JSON.parse(fs.readFileSync(path.join(publicDir, 'version.json'), 'utf8'));
    return (v && v.version) || null;
  } catch {
    return null;
  }
}
