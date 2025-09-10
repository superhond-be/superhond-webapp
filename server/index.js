const path = require('path');
const express = require('express');
const session = require('express-session');
const adminUsers = require('../routes/admin-users');

const app = express();
app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-superhond',
  saveUninitialized: true,
  resave: false,
  cookie: { sameSite: 'lax' }
}));

app.use('/public', express.static(path.join(__dirname, '..', 'public')));
app.use('/api/admin', adminUsers);

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.get('/healthz', (_req, res) => res.json({ ok: true }));

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`Superhond server running on :${port}`);
});