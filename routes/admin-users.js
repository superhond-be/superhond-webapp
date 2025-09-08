
// Admin users route (protected)
const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const { authRequired } = require('./auth-middleware');

const router = express.Router();
const DATA_FILE = path.join(__dirname, '..', 'server', 'data', 'users.json');

async function readUsers(){
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw).users || [];
}

router.get('/', authRequired, async (req, res) => {
  const users = await readUsers();
  const safe = users.map(({passwordHash, ...u}) => u);
  res.json(safe);
});

module.exports = router;
