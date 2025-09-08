const express = require('express');
const router = express.Router();
const storage = require('../server/storage');

function all(){ return storage.read('lessons', []); }
function save(list){ return storage.write('lessons', list); }

// GET list (optionele filters: type, locatie)
router.get('/', (req, res) => {
  const { type, locatie } = req.query;
  let list = all();
  if (type) list = list.filter(x => String(x.type).toLowerCase() === String(type).toLowerCase());
  if (locatie) list = list.filter(x => String(x.locatie).toLowerCase() === String(locatie).toLowerCase());
  res.json(list);
});

// GET by id
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const item = all().find(x => x.id === id);
  if (!item) return res.status(404).json({ error: 'Lesson not found' });
  res.json(item);
});

// POST create
router.post('/', (req, res) => {
  const { type, thema, locatie, trainer, datum, tijd, credits } = req.body || {};
  if (!type || !thema || !locatie || !trainer) {
    return res.status(400).json({ error: 'type, thema, locatie en trainer zijn vereist' });
  }
  const list = all();
  const id = list.length ? Math.max(...list.map(x => x.id)) + 1 : 1;
  const item = { id, type, thema, locatie, trainer, datum, tijd, credits: Number(credits ?? 1) };
  list.push(item);
  save(list);
  res.status(201).json(item);
});

// PUT update
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const list = all();
  const idx = list.findIndex(x => x.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Lesson not found' });
  list[idx] = { ...list[idx], ...req.body, id };
  save(list);
  res.json(list[idx]);
});

// DELETE
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const list = all();
  if (!list.some(x => x.id === id)) return res.status(404).json({ error: 'Lesson not found' });
  save(list.filter(x => x.id !== id));
  res.status(204).send();
});

module.exports = router;
