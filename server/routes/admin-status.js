// server/routes/admin-status.js
const express = require('express');
const router = express.Router();

// eenvoudige in-memory “datastore” (jullie hebben elders ook een data layer;
// hier volstaat het om te tellen hoeveel admin users er zijn in memory file)
const path = require('path');
const fs = require('fs');

const DB_FILE = path.join(__dirname, '..', 'data', 'admins.json');

// helper: lees admin users (array)
function readAdmins() {
  try {
    if (!fs.existsSync(DB_FILE)) return [];
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// GET /api/admin/status  -> { ok:true, count: <number>, hasSetupToken: <bool> }
router.get('/status', (req, res) => {
  try {
    const admins = readAdmins();
    const count = Array.isArray(admins) ? admins.length : 0;
    const hasSetupToken = !!process.env.SETUP_TOKEN && String(process.env.SETUP_TOKEN).trim() !== '';
    return res.json({ ok: true, count, hasSetupToken });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'status_failed', details: String(err.message || err) });
  }
});

module.exports = router;
