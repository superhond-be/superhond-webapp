// Placeholder Express server (to be completed later)
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// API routes (to implement)
app.use('/api/admin-users', require('../routes/admin-users'));

app.listen(PORT, () => console.log(`[superhond] Server running on http://localhost:${PORT}`));