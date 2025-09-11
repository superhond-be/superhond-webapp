// server/index.js
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
module.exports = app;        // (optioneel, maar correct)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static map
const publicDir = path.join(__dirname, '..', 'public');
fs.mkdirSync(publicDir, { recursive: true });
console.log('[BOOT] publicDir =', publicDir, 'index exists?', fs.existsSync(path.join(publicDir,'index.html')));

// Static files en root
app.use(express.static(publicDir));
app.get('/', (_req, res) => res.sendFile(path.join(publicDir, 'index.html')));

// v15 import endpoints (laat staan als je ze al hebt)
app.use('/api/import', require('./routes/import'));

// Health
app.get('/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Superhond server running at http://localhost:${PORT}`));
