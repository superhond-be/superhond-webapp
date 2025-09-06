// server/index.js
const path = require('path');
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// statics
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api', require('./routes/admin'));

// health
app.get('/healthz', (_req, res) => res.json({ ok: true }));

// server/index.js (relevante regel)
app.use('/api/admin', require('./routes/admin-users')); // NIEUW

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Superhond server luistert op ${PORT}`);
});
