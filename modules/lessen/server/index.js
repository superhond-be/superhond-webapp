const express = require('express');
const router = express.Router();

// In-memory store
const store = { lessen: [] };

router.get('/items', (req, res) => {
  res.json(store.lessen);
});

router.post('/items', express.json(), (req, res) => {
  const item = { id: Date.now(), ...req.body };
  store.lessen.push(item);
  res.status(201).json(item);
});

module.exports = router;
