const express = require('express');
const path = require('path');
const adminGuard = require('./adminGuard');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Public files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Health check
app.get('/api/ping', (_req, res) => res.json({ ok: true }));

// ----- Admin-only API’s -----
app.use('/api/settings',   adminGuard, require('./routes/settings'));
app.use('/api/courses',    adminGuard, require('./routes/courses'));
app.use('/api/sessions',   adminGuard, require('./routes/sessions'));
app.use('/api/memberships',adminGuard, require('./routes/memberships'));

// ----- Publieke API’s -----
app.use('/api/clients', require('./routes/clients'));
app.use('/api/dogs',    require('./routes/dogs'));
app.use('/api/enrollments', require('./routes/enrollments'));
app.use('/api/passes',      require('./routes/passes'));
app.use('/api/purchases',   require('./routes/purchases'));

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Superhond server draait op http://localhost:${PORT}`);
});
