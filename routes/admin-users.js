const express = require('express');
const router = express.Router();

// In-memory demo data
let users = [
  { id: 1, name: 'Jan Jansen', email: 'jan@example.com', role: 'Trainer' },
  { id: 2, name: 'Piet Peeters', email: 'piet@example.com', role: 'Admin' },
];

// GET /api/users
router.get('/', (req, res) => {
  res.json(users);
});

// GET /api/users/:id
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const user = users.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// POST /api/users
router.post('/', (req, res) => {
  const { name, email, role } = req.body || {};
  if (!name || !email) return res.status(400).json({ error: 'name and email are required' });
  const id = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
  const user = { id, name, email, role: role || 'Trainer' };
  users.push(user);
  res.status(201).json(user);
});

// PUT /api/users/:id
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  users[idx] = { ...users[idx], ...req.body, id };
  res.json(users[idx]);
});

// DELETE /api/users/:id
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const exists = users.some(u => u.id === id);
  if (!exists) return res.status(404).json({ error: 'User not found' });
  users = users.filter(u => u.id !== id);
  res.status(204).send();
});

module.exports = router;
