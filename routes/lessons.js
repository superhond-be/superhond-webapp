
const express = require('express');
const router = express.Router();

let lessons = [
  { id: 1, type: 'Puppy', theme: 'Wandelen', location: 'Retie', date: '2025-09-20', time: '10:00', trainer: 'Sofie' },
  { id: 2, type: 'Puber', theme: 'Sociaal leren', location: 'Mol', date: '2025-09-21', time: '11:00', trainer: 'Paul' },
  { id: 3, type: 'Basis', theme: 'Basisoefeningen', location: 'Retie', date: '2025-09-22', time: '18:30', trainer: 'Sofie' }
];
let nextId = 4;

router.get('/', (_req, res) => res.json({ ok: true, items: lessons }));
router.post('/', (req, res) => {
  const item = { id: nextId++, ...req.body };
  lessons.push(item);
  res.json({ ok: true, item });
});

module.exports = router;
