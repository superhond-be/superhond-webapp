// server/index.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const adminUsersRouter = require('./routes/admin-users');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());

// --- API ENDPOINTS ---

// Admin status
app.get('/api/admin/setup-status', (req, res) => {
  const token = (process.env.SETUP_TOKEN || '').trim();
  const hasSetupToken = token.length > 0;

  // hier later database tellen → voorlopig altijd 0
  res.json({
    ok: true,
    count: 0,
    hasSetupToken
  });
});

// Admin users router
app.use('/api/admin/users', adminUsersRouter);

// --- FRONTEND BESTANDEN ---
app.use(express.static(path.join(__dirname, '../public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`Superhond server luistert op ${PORT}`);
});
