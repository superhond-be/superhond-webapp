// server/index.js
const path = require('path');
const express = require('express');
const session = require('express-session');

const app = express();

// Basis security headers (simpel)
app.disable('x-powered-by');

// Body parsing voor eventuele andere routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessies (simple MemoryStore volstaat voor deze MVP op Render)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 's3ss10n-2025!superhond',
    resave: false,
    saveUninitialized: true,
    cookie: { sameSite: 'lax' }
  })
);

// Static files (publieke site)
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

// API routes
app.use('/api/admin/users', require('./routes/admin-users'));
app.use('/api/admin/status', require('./routes/admin-status'));

// Healthcheck / root
app.get('/', (_req, res) => {
  res.redirect('/public/index.html');
});

// Start
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Superhond server luistert op ${PORT}`);
});
