// server/index.js
const express = require('express');
const path = require('path');

const app = express();

// parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// static files
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

// API routes
const adminUsersRoutes  = require('./routes/admin-users');
const adminStatusRoutes = require('./routes/admin-status');

app.use('/api/admin', adminUsersRoutes);
app.use('/api/admin', adminStatusRoutes);

// eenvoudige homepage/health
app.get('/healthz', (_req, res) => res.json({ ok: true }));
app.get('/', (_req, res) => {
  res.redirect('/public/dashboard.html');
});

// start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Superhond server luistert op ${PORT}`);
});
