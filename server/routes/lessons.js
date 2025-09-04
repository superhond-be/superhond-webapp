const express = require('express');
const router = express.Router();
const adminGuard = require('../adminGuard');          // vereist login
const { getTypes, saveTypes, getCourses, saveCourses, uid } = require('../helpers/lessons');

// ------- LES-TYPES (CRUD) -------
router.get('/types', adminGuard, (_req, res) => res.json(getTypes()));

router.post('/types', adminGuard, (req, res) => {
  const t = req.body || {};
  if (!t.naam) return res.status(400).json({ error: 'missing_name' });
  const types = getTypes();
  const rec = {
    id: uid('type'),
    naam: t.naam,
    beschrijving: t.beschrijving || '',
    aantal_lessen: Number(t.aantal_lessen || 6),
    lesduur_min: Number(t.lesduur_min || 60),
    geldigheid_dagen: Number(t.geldigheid_dagen || 90),
    max_deelnemers: Number(t.max_deelnemers || 8)
  };
  types.push(rec); saveTypes(types);
  res.status(201).json(rec);
});

router.put('/types/:id', adminGuard, (req, res) => {
  const types = getTypes();
  const i = types.findIndex(x => x.id === req.params.id);
  if (i === -1) return res.status(404).json({ error:'not_found' });
  types[i] = { ...types[i], ...req.body, id: types[i].id };
  saveTypes(types);
  res.json(types[i]);
});

router.delete('/types/:id', adminGuard, (req, res) => {
  const types = getTypes();
  const i = types.findIndex(x => x.id === req.params.id);
  if (i === -1) return res.status(404).json({ error:'not_found' });
  const removed = types.splice(i,1)[0];
  saveTypes(types);
  res.json({ ok:true, removed });
});

// ------- CURSUSSEN/LESSEN (CRUD) -------
// Een cursus erft standaardvelden van het gekozen type:
router.get('/courses', adminGuard, (_req,res)=> res.json(getCourses()));

router.post('/courses', adminGuard, (req, res) => {
  const c = req.body || {};
  if (!c.naam || !c.type_id) return res.status(400).json({ error:'missing_fields' });

  const types = getTypes();
  const type = types.find(t => t.id === c.type_id);
  if (!type) return res.status(400).json({ error:'invalid_type' });

  const rec = {
    id: uid('course'),
    type_id: type.id,
    naam: c.naam,
    // erfenis van type, overschrijfbaar via body:
    beschrijving: c.beschrijving ?? type.beschrijving,
    aantal_lessen: Number(c.aantal_lessen ?? type.aantal_lessen),
    lesduur_min: Number(c.lesduur_min ?? type.lesduur_min),
    geldigheid_dagen: Number(c.geldigheid_dagen ?? type.geldigheid_dagen),
    max_deelnemers: Number(c.max_deelnemers ?? type.max_deelnemers),

    // extra velden
    thema: c.thema || '',                  // bv. "Rustige wandeling"
    trainers: Array.isArray(c.trainers) ? c.trainers : [], // bv. ['trainer-001']
    actief: c.actief !== false
  };
  const courses = getCourses(); courses.push(rec); saveCourses(courses);
  res.status(201).json(rec);
});

router.put('/courses/:id', adminGuard, (req, res) => {
  const courses = getCourses();
  const i = courses.findIndex(x => x.id === req.params.id);
  if (i === -1) return res.status(404).json({ error:'not_found' });
  courses[i] = { ...courses[i], ...req.body, id: courses[i].id };
  saveCourses(courses);
  res.json(courses[i]);
});

router.delete('/courses/:id', adminGuard, (req, res) => {
  const courses = getCourses();
  const i = courses.findIndex(x => x.id === req.params.id);
  if (i === -1) return res.status(404).json({ error:'not_found' });
  const removed = courses.splice(i,1)[0];
  saveCourses(courses);
  res.json({ ok:true, removed });
});

module.exports = router;
