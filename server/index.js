// server/index.js  (relevante fragmenten)
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// statics
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

// ===== API routes =====
const adminUsersRoutes  = require('./routes/admin-users');   // bestaat al bij jullie
const adminStatusRoutes = require('./routes/admin-status');  // <— NIEUW

app.use('/api/admin', adminUsersRoutes);
app.use('/api/admin', adminStatusRoutes);

// health
app.get('/healthz', (_req, res) => res.json({ ok: true }));

// start (Render leest PORT uit env)
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Superhond server luistert op ${PORT}`));
