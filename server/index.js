const express = require('express');
const app = express();

// Render geeft de poort door via environment variable
const PORT = process.env.PORT || 10000;

// Eenvoudige testroute
app.get('/', (req, res) => {
  res.send('🚀 Superhond server is running on Render!');
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Superhond server running at http://localhost:${PORT}`);
});
