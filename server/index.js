const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// API routes
app.use('/api/klanten', require('./routes/klanten'));
app.use('/api/honden', require('./routes/honden'));
app.use('/api/lessen', require('./routes/lessen'));

// Fallback to index
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Superhond demo running on http://localhost:${PORT}`);
});
