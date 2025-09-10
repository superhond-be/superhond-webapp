const express = require('express');
const app = express();

// Render geeft de poort door via environment variable
const PORT = process.env.PORT || 10000;

// Eenvoudige testroute
app.get('/', (req, res) => {
  res.send('🚀 Superhond server is running on Render!');
});

// Healthcheck route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// About route
app.get('/about', (req, res) => {
  res.json({
    app: 'Superhond Webapp',
    version: 'v14',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Selftest route
app.get('/selftest', (req, res) => {
  res.json({
    status: 'ok',
    env: {
      PORT: process.env.PORT || null,
      NODE_ENV: process.env.NODE_ENV || null,
      TARGET_URL: process.env.TARGET_URL ? '✅' : '❌',
      SH_SHARED_SECRET: process.env.SH_SHARED_SECRET ? '✅' : '❌'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Superhond server running at http://localhost:${PORT}`);
});
