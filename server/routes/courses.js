const express = require('express');
const { readJSON, writeJSON, uid } = require('../helpers');
const router = express.Router();

function existsIn(listFile, id){
  if (!id) return false;
  const arr = readJSON(listFile, []);
  return arr.some(x=>x.id===id);
}

function validateCourse(body){
  const errors = [];
  const name = (body.naam||'').trim();
  if (!name) errors.push('naam');
  if (!existsIn('lestypes.json', body.lestype_id)) errors.push('lestype_id');
  if (!existsIn('themas.json', body.thema_id)) errors.push('thema_id');
  if (!existsIn('locaties.json', body.locatie_id)) errors.push('locatie_id');
  if (!Array.isArray(body.trainer_ids) || body.trainer_ids.length===0) errors.push('trainer_ids');
  else {
    const trainers = readJSON('trainers.json', []);
    const ok = body.trainer_ids.every(id => trainers.some(t=>t.id===id));
    if (!ok) errors.push('trainer_ids');
  }
  const max = Number(body.max||0);
  if (!Number.isInteger(max) || max<=0) errors.push('max');

  // optioneel
  if (body.requires_pass && body.pass_type_id){
    const types = readJSON('pass_types.json', []);
    if (!types.some(t=>t.id===body.pass_type_id)) errors.push('pass_type_id');
  }
  return errors;
}

router.get('/', (req,res)=> res.json(readJSON('courses.json', [])) );

router.post('/', (req,res)=>{
  const errors = validateCourse(req.body);
  if (errors.length) return res.status(422).json({error:'validation', fields:errors});

  const list = readJSON('courses.json', []);
  const item = {
    id: uid(),
    naam: (req.body.naam||'').trim(),
    beschrijving: req.body.beschrijving || '',
    lestype_id: req.body.lestype_id,
    thema_id: req.body.thema_id,
    locatie_id: req.body.locatie_id,
    trainer_ids: req.body.trainer_ids,

    aantal_lessen: Number(req.body.aantal_lessen||0) || null,
    lesuur: req.body.lesuur || null,
    geldigheid: Number(req.body.geldigheid||0) || null,
    max: Number(req.body.max),

    requires_pass: !!req.body.requires_pass,
    pass_type_id: req.body.pass_type_id || null
  };
  list.push(item); writeJSON('courses.json', list);
  res.status(201).json(item);
});

router.put('/:id', (req,res)=>{
  const list = readJSON('courses.json', []);
  const i = list.findIndex(x=>x.id===req.params.id);
  if (i===-1) return res.status(404).json({error:'not_found'});

  const candidate = { ...list[i], ...req.body };
  const errors = validateCourse(candidate);
  if (errors.length) return res.status(422).json({error:'validation', fields:errors});

  list[i] = {
    ...list[i],
    ...req.body,
    naam: ('naam'in req.body) ? (req.body.naam||'').trim() : list[i].naam,
    max: ('max'in req.body) ? Number(req.body.max) : list[i].max
  };
  writeJSON('courses.json', list);
  res.json(list[i]);
});

router.delete('/:id', (req,res)=>{
  const sessions = readJSON('sessions.json', []);
  const hasSessions = sessions.some(s=>s.sjabloon_id===req.params.id);
  if (hasSessions) return res.status(409).json({error:'in_use', message:'Er bestaan sessies voor deze les.'});

  const out = readJSON('courses.json', []).filter(x=>x.id!==req.params.id);
  writeJSON('courses.json', out);
  res.json({ok:true});
});

module.exports = router;
