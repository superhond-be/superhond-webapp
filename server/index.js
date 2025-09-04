// server/index.js
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// --- middleware ---
app.use(cors());
app.use(express.json());            // JSON body parsing
app.use(express.urlencoded({ extended: true }));

// --- static files (frontend) ---
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- health check ---
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// --- admin API routes ---
app.use('/api/admin', require('./routes/admin'));  // <— belangrijk

// --- 404 voor onbekende API-routes ---
app.use('/api', (_req, res) => res.status(404).json({ error: 'not_found' }));

// --- server starten (Render gebruikt PORT) ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Superhond server luistert op ${PORT}`);
});
