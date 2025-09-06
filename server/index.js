// server/index.js
const path = require('path');
const express = require('express');
const cors = require('cors');
const session = require('express-session');

const app = express();

// --- Config / middleware ---
app.use(cors());
app.use(express.json());                // JSON body parser
app.use(express.urlencoded({ extended: true }));

// Sessions (nodig voor later, mag basic op Render)
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev_session_secret';
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

// Static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- API routes ---
const adminUsersRoutes = require('./routes/admin-users');
app.use('/api/admin/users', adminUsersRoutes);

// Setup-status endpoint (gebruikt door je dashboardkaart)
app.get('/api/admin/setup-status', (req, res) => {
  // simpele check: als de env var bestaat en niet leeg is => true
  const token = (process.env.SETUP_TOKEN || '').trim();
  const hasSetupToken = token.length > 0;

  // In dit voorbeeld tellen we users uit de in-memory route.
  // Om hier bij te kunnen, lezen we ze via de route zelf zou omslachtig zijn;
  // dus geven we een vaste 0 terug wanneer de app net gestart is.
  // Je kaart gebruikt vooral hasSetupToken om te weten of registratie open staat.
  res.json({ count: 0, hasSetupToken });
});

// Fallback naar dashboard (optioneel)
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'dashboard.html'));
});

// 404 voor onbekende API-routes
app.use('/api', (_req, res) => {
  res.status(404).json({ ok: false, error: 'API endpoint niet gevonden' });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ ok: false, error: 'Interne serverfout' });
});

// Start
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Superhond server luistert op ${PORT}`);
});
