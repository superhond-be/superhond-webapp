// server/index.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const adminUsersRouter = require('./routes/admin-users');
const { count } = require('./store/adminStore');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());

// --- API ---
app.get('/api/admin/setup-status', (_req, res) => {
  const token = (process.env.SETUP_TOKEN || '').trim();
  res.json({
    ok: true,
    count: count(),              // <- telt echte admins in memory
    hasSetupToken: token.length > 0,
  });
});

app.use('/api/admin/users', adminUsersRouter);

// --- Static files ---
app.use(express.static(path.join(__dirname, '../public')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Superhond server luistert op ${PORT}`);
});
