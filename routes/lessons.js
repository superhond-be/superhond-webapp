// routes/lessons.js
const express = require('express');
const router = express.Router();

let lessons = [
  { id: 1, type: 'Puppy', theme: 'Wandelen', location: 'Retie', date: '2025-09-20', time: '10:00', trainer: 'Sofie' },
  { id: 2, type: 'Puber', theme: 'Sociaal leren', location: 'Mol', date: '2025-09-21', time: '11:00', trainer: 'Paul' },
  { id: 3, type: 'Basis', theme: 'Basisoefeningen', location: 'Retie', date: '2025-09-22', time: '18:30', trainer: 'Sofie' }
];

let nextId = 4;

function validateLesson(b) {
  const required = ['type','theme','location','date','time','trainer'];
  const missing = required.filter(k => !b[k]);
  if (missing.length) return `Ontbrekende velden: ${missing.join(', ')}`;
  const allowedTypes = ['Puppy','Puber','Basis'];
  if (!allowedTypes.includes(b.type)) return `Ongeldig type: ${b.type}`;
  return null;
}

router.get('/', (req, res) => {
  let data = [...lessons];
  const { type, location, dateFrom, dateTo } = req.query;
  if (type) data = data.filter(x => x.type.toLowerCase() === String(type).toLowerCase());
  if (location) data = data.filter(x => x.location.toLowerCase() === String(location).toLowerCase());
  if (dateFrom) data = data.filter(x => x.date >= dateFrom);
  if (dateTo) data = data.filter(x => x.date <= dateTo);
  res.json({ ok: true, count: data.length, items: data });
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const it = lessons.find(x => x.id === id);
  if (!it) return res.status(404).json({ ok:false, error: 'Les niet gevonden' });
  res.json({ ok:true, item: it });
});

router.post('/', (req, res) => {
  const err = validateLesson(req.body || {});
  if (err) return res.status(400).json({ ok:false, error: err });
  const item = { id: nextId++, ...req.body };
  lessons.push(item);
  res.status(201).json({ ok:true, item });
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = lessons.findIndex(x => x.id === id);
  if (idx === -1) return res.status(404).json({ ok:false, error: 'Les niet gevonden' });
  const updated = { ...lessons[idx], ...req.body, id };
  const err = validateLesson(updated);
  if (err) return res.status(400).json({ ok:false, error: err });
  lessons[idx] = updated;
  res.json({ ok:true, item: lessons[idx] });
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = lessons.findIndex(x => x.id === id);
  if (idx === -1) return res.status(404).json({ ok:false, error: 'Les niet gevonden' });
  const removed = lessons.splice(idx, 1)[0];
  res.json({ ok:true, removed });
});

module.exports = router;
