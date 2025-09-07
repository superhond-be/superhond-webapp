// server/index.js
const path = require('path');
const express = require('express');
const session = require('express-session');

const app = express();

// simpele security hardening
app.disable('x-powered-by');

// body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// sessions (MemoryStore volstaat hier op Render free tier)
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { sameSite: 'lax' }
}));

// API-routes
app.use('/api/admin/users', require('./routes/admin-users'));

// statische site (public/)
app.use(express.static(path.join(__dirname, '..', 'public')));

// start
const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`Superhond server luistert op ${port}`));
