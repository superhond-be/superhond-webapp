require('express-async-errors');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rate = require('rate-limiter-flexible');
const path = require('path');
const logger = require('../services/logger');
const { verifySignature, checkSharedSecret, passesFilters } = require('../services/filter');
const { forwardJson } = require('../services/forward');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '2mb', verify: (req, res, buf) => { req.rawBody = buf.toString('utf8'); } }));
app.use(morgan('combined'));

// Rate limiter
const ratePoints = parseInt(process.env.RATE_LIMIT_PER_MIN || '120', 10);
const rl = new rate.RateLimiterMemory({ points: ratePoints, duration: 60 });

app.use(async (req,res,next) => {
  try {
    await rl.consume(req.ip);
    return next();
  } catch {
    return res.status(429).json({ ok:false, error:"Too many requests" });
  }
});

// Static welcome
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

app.get('/about', (req,res)=>{
  res.json({
    logLevel: process.env.LOG_LEVEL || 'info',
    targetUrl: process.env.TARGET_URL || '',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    allowedSources: process.env.ALLOWED_SOURCES || '',
    filterTopics: process.env.FILTER_TOPICS || ''
  });
});

app.get('/health', (req,res)=>{
  const token = process.env.HEALTH_TOKEN || '';
  const got = req.get('X-Health-Token') || '';
  if (token && token !== got) return res.status(401).json({ ok:false });
  res.json({ ok:true, status:"healthy", time: new Date().toISOString() });
});

// Intake endpoint
app.post('/hook', async (req,res)=>{
  const targetUrl = process.env.TARGET_URL;
  if (!targetUrl) return res.status(500).json({ ok:false, error:"TARGET_URL not set" });

  // Shared secret gate
  if (!checkSharedSecret(req)) return res.status(401).json({ ok:false, error:"Bad shared secret" });

  // Signature verification
  if (!verifySignature(req, req.rawBody || '')) return res.status(401).json({ ok:false, error:"Bad signature" });

  const payload = req.body || {};

  // Filters
  if (!passesFilters(req, payload)) {
    return res.status(202).json({ ok:true, forwarded:false, reason:"filtered_out" });
  }

  // Forward
  const keepHeaders = String(process.env.KEEP_HEADERS || '').split(',').map(h => h.trim()).filter(Boolean);
  const hdrs = {};
  keepHeaders.forEach(k => hdrs[k] = req.get(k));

  try {
    const result = await forwardJson(targetUrl, payload, hdrs);
    logger.info("Forwarded", { status: result.status });
    return res.status(200).json({ ok:true, forwarded:true, upstreamStatus: result.status, upstreamBody: result.body });
  } catch (err) {
    logger.error("Forward failed", err.message);
    return res.status(502).json({ ok:false, error:"Upstream error", detail: String(err.message || err) });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ ok:false, error:"Internal error" });
});

app.listen(PORT, ()=> {
  logger.info(`Forwarder listening on ${PORT}`);
});
