const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Only lightweight middleware that cannot throw
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(morgan('combined'));

// Static welcome
app.use(express.static(path.join(__dirname, '..', 'public')));

// About
app.get('/about', (req,res)=>{
  res.json({
    ok: true,
    targetUrl: process.env.TARGET_URL || '',
    logLevel: process.env.LOG_LEVEL || '',
    corsOrigin: process.env.CORS_ORIGIN || '*'
  });
});

// Health
app.get('/health', (req,res)=>{
  res.json({ ok: true, status: "healthy", time: new Date().toISOString() });
});

// Hook (JSON body parsing only for this route; no verify function)
app.post('/hook', express.json({ limit: '2mb' }), async (req,res)=>{
  const targetUrl = process.env.TARGET_URL;
  if (!targetUrl) return res.status(500).json({ ok:false, error:"TARGET_URL not set" });
  // For this ultra-safe build we just echo back the payload instead of forwarding
  res.json({ ok:true, forwarded:false, echo:req.body });
});

// Global error handler (last resort)
app.use((err, req, res, next) => {
  console.error("[ULTRASAFE ERROR]", err && (err.stack || err.message) || String(err));
  res.status(500).json({ ok:false, error:"Internal error" });
});

app.listen(PORT, ()=> {
  console.log("UltraSafe forwarder listening on", PORT);
});
