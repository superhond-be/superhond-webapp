// server/index.js
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Middleware ----
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Statische bestanden (admin/publieke pages in /public)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Korte health checks
app.get('/api/ping', (_req, res) => res.json({ ok: true, pong: Date.now() }));
app.get('/health', (_req, res) => res.status(200).send('OK'));

// ---- API routes ----
// Settings (lestypes, themas, locaties, trainers)
app.use('/api/settings', require('./routes/settings'));

// Lessen (courses) & Sessies
app.use('/api/courses',  require('./routes/courses'));
app.use('/api/sessions', require('./routes/sessions'));

// Inschrijvingen (met clients/dogs + strippenkaarten)
app.use('/api/enrollments', require('./routes/enrollments'));

// Strippenkaarten
app.use('/api/passes', require('./routes/passes'));

// Klanten & Honden
app.use('/api/clients', require('./routes/clients'));
app.use('/api/dogs',    require('./routes/dogs'));

// Optionele testroutes (niet verplicht aanwezig)
const tryMount = (route, mountPath) => {
  try { app.use(mountPath, require(route)); }
  catch (e) { console.warn(`⚠️  Optionele route overgeslagen: ${mountPath} (${e.message})`); }
};
tryMount('./routes/testmail', '/api/test');      // POST /api/test/mail
tryMount('./routes/email.test', '/api/email-test');

// 404 voor onbekende API-paden
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

// Globale foutafhandelaar (laatste vangnet)
app.use((err, _req, res, _next) => {
  console.error('🔴 Unhandled error:', err);
  res.status(500).json({ error: 'Server error', message: err.message });
});

// ---- Start server ----
// Bind op 0.0.0.0 zodat je via LAN/Render bereikbaar bent
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Superhond server draait op http://localhost:${PORT}`);
});
