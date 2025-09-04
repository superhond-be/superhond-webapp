// server/index.js
require('dotenv').config();            // laad .env lokaal
const path = require('path');
const express = require('express');
const adminGuard = require('./adminGuard');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Middleware ----------
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static files (dashboard, admin UI, publiek)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Health & ping
app.get('/health', (_req, res) => res.status(200).send('OK'));
app.get('/api/ping', (_req, res) => res.json({ ok: true, ts: Date.now() }));

// ---------- Open routes (geen admin token nodig) ----------
// Admin login → geeft JWT terug
app.use('/api/admin', require('./routes/admin'));

// Klanten & honden (publieke onboarding mag deze gebruiken)
app.use('/api/clients', require('./routes/clients'));
app.use('/api/dogs',    require('./routes/dogs'));

// Inschrijvingen (server valideert membership/strippenkaart zelf)
app.use('/api/enrollments', require('./routes/enrollments'));

// Strippenkaarten
app.use('/api/passes', require('./routes/passes'));

// Aankopen / post-payment onboarding (webhook + start/complete)
app.use('/api/purchases', require('./routes/purchases'));

// ---------- Admin-only (JWT vereist) ----------
app.use('/api/settings',    adminGuard, require('./routes/settings'));     // lestypes, themas, locaties, trainers
app.use('/api/courses',     adminGuard, require('./routes/courses'));
app.use('/api/sessions',    adminGuard, require('./routes/sessions'));
app.use('/api/memberships', adminGuard, require('./routes/memberships'));  // pending/approved

// ---------- Optioneel te mounten (indien bestand bestaat) ----------
function tryMount(routePath, mountPath) {
  try { app.use(mountPath, require(routePath)); }
  catch (e) { console.warn(`⚠️  Optionele route overgeslagen: ${mountPath} (${e.message})`); }
}
tryMount('./routes/testmail', '/api/test');      // POST /api/test/mail
tryMount('./routes/email.test', '/api/email-test');

// 404 voor onbekende API-paden
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

// Globale foutafhandelaar
app.use((err, _req, res, _next) => {
  console.error('🔴 Unhandled error:', err);
  res.status(500).json({ error: 'Server error', message: err.message });
});

// Start
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Superhond server draait op http://localhost:${PORT}`);
});
