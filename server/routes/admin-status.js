const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const hasSetupToken = !!process.env.SETUP_TOKEN;

  res.json({
    count: 0, // later vervangen door echte database telling
    hasSetupToken
  });
});

module.exports = router;
