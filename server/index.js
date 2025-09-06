// server/index.js
const path = require('path');
const express = require('express');
const session = require('express-session');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const SESSION_SECRET = process.env.SESSION_SECRET || 'devsecret';
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { sameSite: 'lax' }
  })
);

// Static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// ✅ Mount je bestaande routers
app.use('/api/admin/users', require('../routes/admin-users'));

// ✅ NIEUW: status endpoint
app.use('/api/admin/status', require('../routes/admin-status'));

// Health (optioneel)
app.get('/api/status', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// SPA-fallback
app.get(/^(?!\/api\/).*$/, (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Superhond server luistert op ${PORT}`);
});

module.exports = app;
