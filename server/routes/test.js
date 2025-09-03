// server/routes/test.js
const express = require('express');
const { readJSON, writeJSON, uid } = require('../helpers');
const router = express.Router();

// GET /api/test/read
router.get('/read', (req, res) => {
  const data = readJSON('courses.json', []);
  res.json({ ok: true, count: data.length, data });
});

// POST /api/test/write
router.post('/write', (req, res) => {
  const file = 'test.json';
  const content = { id: uid(), ts: Date.now(), body: req.body };
  const arr = readJSON(file, []);
  arr.push(content);
  writeJSON(file, arr);
  res.json({ ok: true, saved: content });
});

module.exports = router;
