// server/routes/admin.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const adminsFile = path.join(__dirname, '..', '..', 'data', 'admins.json');

// hulpfunctie: lees admin-lijst (maakt file als die nog niet bestaat)
function readAdmins() {
  if (!fs.existsSync(adminsFile)) {
    fs.writeFileSync(adminsFile, JSON.stringify([]), 'utf8');
    return [];
  }
  try {
    const raw = fs.readFileSync(adminsFile, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    console.error('Kan admins.json niet lezen:', e);
    return [];
  }
}

// GET /api/admin/status — aantal admins + setup-token status
router.get('/status', (req, res) => {
  const admins = readAdmins();
  const count = admins.length;

  // Setup-token wordt als "gezet" beschouwd als ENV bestaat en niet leeg is
  const hasSetupToken = Boolean(
    (process.env.SETUP_TOKEN || process.env.SETUP || '').toString().trim()
  );

  res.json({ count, hasSetupToken });
});

// (Optioneel) GET /api/admin — lijst van admins (alleen naam & e-mail)
router.get('/', (req, res) => {
  const admins = readAdmins().map(a => ({
    name: a.name || a.naam || '',
    email: a.email || ''
  }));
  res.json({ admins });
});

module.exports = router;
