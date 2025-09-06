
// routes/admin-status.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Pad naar data/admins.json (routes/ staat naast data/)
const ADMINS_FILE = path.join(__dirname, '..', 'data', 'admins.json');

function readAdminsCount() {
  try {
    const raw = fs.readFileSync(ADMINS_FILE, 'utf8');
    const parsed = JSON.parse(raw || '[]');
    // bestand kan [] of {users:[...]} zijn – beide ondersteunen
    if (Array.isArray(parsed)) return parsed.length;
    if (parsed && Array.isArray(parsed.users)) return parsed.users.length;
    return 0;
  } catch {
    return 0;
  }
}

// GET /api/admin/status
router.get('/', (_req, res) => {
  const count = readAdminsCount();
  const hasSetupToken = !!(process.env.SETUP_TOKEN && String(process.env.SETUP_TOKEN).length > 0);
  res.json({ count, hasSetupToken });
});

module.exports = router;
