const express = require('express');
const router = express.Router();

// LET OP: paden zijn vanaf routes/ naar server/helpers/
const { requireRole } = require('../server/helpers/auth');
const { ensureSetupToken } = require('../server/helpers/adminGuard');

// voorbeeldgebruik:
// router.post('/users', requireRole('superadmin'), (req, res) => { … });
// router.post('/first-admin', ensureSetupToken, (req, res) => { … });

module.exports = router;
