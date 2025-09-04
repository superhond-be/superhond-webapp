const express = require('express');
const adminGuard = require('../adminGuard');
const { read, write, uid } = require('../helpers/sessions');

const router = express.Router();

/**
 * Model: {
 *  id, course_id, start_iso, end_iso,
 *  location_id, trainer_ids:[], capacity, enrolled:0, status:'open'|'vol'|'geannuleerd'
 * }
 */

// list alles of gefilterd
router.get('/', adminGuard, (req, res) => {
  const all = read();
  const { course_id } = req.query;
  res.json(course_id ? all.filter(s => s.course_id === course_id) : all);
});

// create
router.post('/', adminGuard, (req, res) => {
  const b = req.body || {};
  if (!b.course_id || !b.start_iso) {
    return res.status(400).json({ error: 'missing_fields' });
  }
  const rec = {
    id: uid(),
    course_id: b.course_id,
    start_iso: b.start_iso,                  // '2025-09-06T19:00:00+02:00'
    end_iso: b.end_iso || null,
    location_id: b.location_id || null,
    trainer_ids: Array.isArray(b.trainer_ids) ? b.trainer_ids : [],
    capacity: Number(b.capacity ?? 10),
    enrolled: Number(b.enrolled ?? 0),
    status: b.status || 'open'
  };
  const all = read(); all.push(rec); write(all);
  res.status(201).json(rec);
});

// update
router.put('/:id', adminGuard, (req, res) => {
  const all = read();
  const i = all.findIndex(s => s.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'not_found' });
  all[i] = { ...all[i], ...req.body, id: all[i].id };
  // auto-status 'vol'
  if (all[i].enrolled >= all[i].capacity) all[i].status = 'vol';
  write(all);
  res.json(all[i]);
});

// delete
router.delete('/:id', adminGuard, (req, res) => {
  const all = read();
  const i = all.findIndex(s => s.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'not_found' });
  const removed = all.splice(i, 1)[0];
  write(all);
  res.json({ ok: true, removed });
});

module.exports = router;
