// server/index.js
require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// Render/Proxy
app.set('trust proxy', 1);

// === Config ===
const PORT = process.env.PORT || 10000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || true; // laat alles toe tenzij je een origin zet

// === Middleware ===
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(cookieParser(process.env.SESSION_SECRET || 'secret'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// === Static (public/) ===
app.use(express.static(path.join(__dirname, '..', 'public')));

// === Healthcheck ===
app.get('/healthz', (_req, res) => res.json({ ok: true, uptime: process.uptime() }));

// === API routes ===
// LET OP: deze requires verwachten dat de bestanden bestaan.
// Als je een bepaalde route (nog) niet hebt, comment die regel voorlopig uit.
try { app.use('/api/customer', require('./routes/customer')); } catch { /* nog niet aanwezig */ }
try { app.use('/api/customer/calendar', require('./routes/customer_calendar')); } catch {}
try { app.use('/api/customer/preferences', require('./routes/customer_prefs')); } catch {}

try { app.use('/api/admin/notifications', require('./routes/admin_notifications')); } catch {}
try { app.use('/api/public-enrollments', require('./routes/publicEnroll_admin')); } catch {}
try { app.use('/api/admin/segments', require('./routes/segments_admin')); } catch {}
try { app.use('/admin/email-preview', require('./routes/email_preview')); } catch {}

// Webhooks (automatische koppeling externe betalingen/boekingen)
try { app.use('/api/webhooks', require('./routes/webhooks')); } catch {}

// === Fallbacks ===
// 404 voor niet-gevonden API’s
app.use('/api', (_req, res) => res.status(404).json({ error: 'not_found' }));

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ error: 'server_error', message: err.message });
});

// Server start
app.listen(PORT, () => {
  console.log(`✅ Superhond server luistert op ${PORT}`);
});
