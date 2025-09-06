// server/index.js
const path = require('path');
const express = require('express');
const session = require('express-session');

const app = express();

// --- Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Sessions (gebruik je ENV: SESSION_SECRET)
const SESSION_SECRET = process.env.SESSION_SECRET || 'devsecret';
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: 'lax',
      // zet secure: true als je via https draait op eigen domein
    },
  })
);

// --- Static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- Routers
// voorbeeld: admin users
const adminUsersRouter = require('../routes/admin-users');
app.use('/api/admin', adminUsersRouter);

// Healthcheck / status endpoints (optioneel, handig bij testen)
app.get('/api/status', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Fallback: alles wat niet /api is, serve index.html (SPA-achtig)
app.get(/^(?!\/api\/).*$/, (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Start server (Render zet PORT in env)
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Superhond server luistert op ${PORT}`);
});
const adminUsersRoutes = require("./routes/admin-users");
app.use("/api/admin/users", adminUsersRoutes);

module.exports = app;
