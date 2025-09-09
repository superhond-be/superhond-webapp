
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
const lessonsRouter = require('./routes/lessons');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;
const TARGET_URL = process.env.TARGET_URL || 'https://httpbin.org/post';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const LOG_LEVEL = process.env.LOG_LEVEL || 'debug';
const SH_SHARED_SECRET = process.env.SH_SHARED_SECRET || '';

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', CORS_ORIGIN);
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-SH-Shared-Secret');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// Root = admin UI (fallback if missing)
app.get('/', (_req, res) => {
  const ui = path.join(__dirname, 'public', 'lessenbeheer.html');
  if (fs.existsSync(ui)) return res.sendFile(ui);
  res.send('<h1>Lessenbeheer UI niet gevonden</h1><p>Controleer of public/lessenbeheer.html aanwezig is.</p>');
});

app.get('/selftest-info', (_req, res) => {
  res.type('html').send('<h1>Superhond Forwarder SelfTest</h1><p>/selftest doet een test-forward in 1 klik.</p>');
});

app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/about', (_req, res) => res.json({
  targetUrl: TARGET_URL, corsOrigin: CORS_ORIGIN, logLevel: LOG_LEVEL, sharedSecretSet: Boolean(SH_SHARED_SECRET)
}));

app.get('/selftest', async (_req, res) => {
  try {
    const r = await fetch(TARGET_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ping: 'selftest', ts: Date.now() }) });
    const sample = await r.text();
    res.json({ ok: r.ok, upstreamStatus: r.status, sample: sample.slice(0, 160) });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.post('/hook', (req, res) => res.json({ ok: true, received: req.body }));

app.use('/lessons', lessonsRouter);

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
