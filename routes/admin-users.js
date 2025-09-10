// Placeholder router (to be implemented later)
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json([{ id: 1, name: 'Demo Admin', email: 'admin@superhond.be', role: 'Owner' }]);
});

module.exports = router;