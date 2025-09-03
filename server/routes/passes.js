// server/routes/passes.js
const express = require('express');
const router = express.Router();

// Test endpoint
// GET /api/passes/test
router.get('/test', (req, res) => {
  res.json({ ok: true, message: "passes.js werkt!" });
});

module.exports = router;
