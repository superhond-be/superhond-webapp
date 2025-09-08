const express = require('express');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());

// Static files from /public
app.use(express.static(path.join(__dirname, '..', 'public')));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'superhond-webapp', time: new Date().toISOString() });
});

// API routes
const usersRouter = require('../routes/admin-users');
const lessonsRouter = require('../routes/lessons');
const bookingsRouter = require('../routes/bookings');
const importRouter = require('../routes/import');
const importEmailRouter = require('../routes/import-email');
const customersRouter = require('../routes/customers');
app.use('/api/users', usersRouter);
app.use('/api/lessons', lessonsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/import', importRouter);
app.use('/api/import', importEmailRouter); // POST /api/import/email
app.use('/api/customers', customersRouter);

// Fallback to index.html for root
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// 404 for API
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Superhond server running at http://localhost:${PORT}`);
});