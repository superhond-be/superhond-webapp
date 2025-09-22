const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.get('/', (req, res) => {
  const p = path.join(__dirname, '..', 'data', 'honden.json');
  const raw = fs.readFileSync(p, 'utf-8');
  res.json(JSON.parse(raw));
});

module.exports = router;
