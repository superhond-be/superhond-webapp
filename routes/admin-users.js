const express = require('express');
const router = express.Router();
const storage = require('../server/storage');

function all(){ return storage.read('users', []); }
function save(list){ return storage.write('users', list); }

router.get('/', (_req, res) => {
  res.json(all());
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const user = all().find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.post('/', (req, res) => {
  const { name, email, role } = req.body || {};
  if (!name || !email) return res.status(400).json({ error: 'name and email are required' });
  const list = all();
  const id = list.length ? Math.max(...list.map(u => u.id)) + 1 : 1;
  const user = { id, name, email, role: role || 'Trainer' };
  list.push(user);
  save(list);
  res.status(201).json(user);
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const list = all();
  const idx = list.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  list[idx] = { ...list[idx], ...req.body, id };
  save(list);
  res.json(list[idx]);
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const list = all();
  const exists = list.some(u => u.id === id);
  if (!exists) return res.status(404).json({ error: 'User not found' });
  const filtered = list.filter(u => u.id !== id);
  save(filtered);
  res.status(204).send();
});

module.exports = router;
