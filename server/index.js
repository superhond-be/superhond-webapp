require('dotenv').config();
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const adminGuard = require('./adminGuard');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Static (publiek)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Health
app.get('/health', (_req, res) => res.status(200).send('OK'));
app.get('/api/ping', (_req, res) => res.json({ ok: true, ts: Date.now() }));

// --- Open routes ---
app.use('/api/admin',       require('./routes/admin'));        // register, login, (users - guarded)
app.use('/api/clients',     require('./routes/clients'));
app.use('/api/dogs',        require('./routes/dogs'));
app.use('/api/enrollments', require('./routes/enrollments'));
app.use('/api/passes',      require('./routes/passes'));
app.use('/api/purchases',   require('./routes/purchases'));

// --- Admin-only APIs (JWT vereist) ---
app.use('/api/settings',    adminGuard, require('./routes/settings'));
app.use('/api/courses',     adminGuard, require('./routes/courses'));
app.use('/api/sessions',    adminGuard, require('./routes/sessions'));
app.use('/api/memberships', adminGuard, require('./routes/memberships'));

// 404 & error
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, _req, res, _next) => {
  console.error('🔴 Unhandled error:', err);
  res.status(500).json({ error: 'Server error', message: err.message });
});

app.listen(PORT, '0.0.0.0', () =>
  console.log(`✅ Superhond server draait op http://localhost:${PORT}`));
