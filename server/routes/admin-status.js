// server/routes/admin-status.js
const express = require('express');
const router = express.Router();
const store = require('../models/adminStore');

router.get('/', (_req, res) => {
  try {
    const count = store._unsafe_readAll().length;
    const hasSetupToken = Boolean(process.env.SETUP_TOKEN && String(process.env.SETUP_TOKEN).trim());
    res.json({ ok: true, count, hasSetupToken });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
