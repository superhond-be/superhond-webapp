const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Public map voor HTML/JS bestanden
app.use(express.static('public'));

// ---- API Routes ----

// Basis settings (lestypes, themas, locaties, trainers)
app.use('/api/settings', require('./routes/settings'));

// Lessen (courses)
app.use('/api/courses', require('./routes/courses'));

// Sessies (datums/tijden)
app.use('/api/sessions', require('./routes/sessions'));

// Inschrijvingen (gekoppeld aan clients/dogs en strippenkaarten)
app.use('/api/enrollments', require('./routes/enrollments'));

// Strippenkaarten
app.use('/api/passes', require('./routes/passes'));

// Klanten (baasjes)
app.use('/api/clients', require('./routes/clients'));

// Honden
app.use('/api/dogs', require('./routes/dogs'));

// (optioneel) E-mail testroutes
try {
  app.use('/api/email-test', require('./routes/email.test'));
} catch (e) {
  console.warn('⚠️ Geen email.test.js gevonden (is optioneel).');
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Superhond server draait op http://localhost:${PORT}`);
});
