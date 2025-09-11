const express = require('express');
const path = require('path');

const app = express();

// Public map statisch beschikbaar maken
app.use(express.static(path.join(__dirname, '../public')));

// Healthcheck route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server draait op http://localhost:${PORT}`);
});
