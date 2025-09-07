// server/routes/admin-status.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE  = path.join(DATA_DIR, 'admins.json');

// ===== helpers =====
function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '[]', 'utf8');
}
function readAdmins() {
  ensureStore();
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return [];
  }
}

// GET /api/admin/status  -> { ok:true, count, hasSetupToken }
router.get('/status', (_req, res) => {
  try {
    const admins = readAdmins();
    const count = Array.isArray(admins) ? admins.length : 0;
    const hasSetupToken = !!(process.env.SETUP_TOKEN && String(process.env.SETUP_TOKEN).trim());
    res.json({ ok: true, count, hasSetupToken });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'status_failed', details: String(err?.message || err) });
  }
});

module.exports = router;
