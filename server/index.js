
// Express server with auth (JWT) and static hosting
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes
app.use('/api/auth', require('../routes/auth'));
app.use('/api/admin-users', require('../routes/admin-users'));

// Fallback: 404 for API not matched
app.use('/api', (req,res)=> res.status(404).json({message:'Niet gevonden'}));

app.listen(PORT, () => console.log(`[superhond] Server running on http://localhost:${PORT}`));
