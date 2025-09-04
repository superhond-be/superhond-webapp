const express = require('express');
const { readJSON, writeJSON, uid } = require('../helpers');
const router = express.Router();

const ALLOWED = new Set(['lestypes','themas','locaties','trainers']);

function fileFor(list){
  switch(list){
    case 'lestypes': return 'lestypes.json';
    case 'themas': return 'themas.json';
    case 'locaties': return 'locaties.json';
    case 'trainers': return 'trainers.json';
    default: return null;
  }
}

router.get('/:list', (req,res)=>{
  const f = fileFor(req.params.list);
  if (!f) return res.status(400).json({error:'invalid_list'});
  res.json(readJSON(f, []));
});

router.post('/:list', (req,res)=>{
  const f = fileFor(req.params.list);
  if (!f) return res.status(400).json({error:'invalid_list'});
  const list = readJSON(f, []);
  const item = { id: uid(), ...req.body, naam: (req.body.naam||'').trim() };
  if (!item.naam) return res.status(422).json({error:'naam_required'});
  list.push(item); writeJSON(f, list);
  res.status(201).json(item);
});

router.put('/:list/:id', (req,res)=>{
  const f = fileFor(req.params.list);
  if (!f) return res.status(400).json({error:'invalid_list'});
  const list = readJSON(f, []);
  const i = list.findIndex(x=>x.id===req.params.id);
  if (i === -1) return res.status(404).json({error:'not_found'});
  const naam = ('naam' in req.body) ? (req.body.naam||'').trim() : list[i].naam;
  if (!naam) return res.status(422).json({error:'naam_required'});
  list[i] = { ...list[i], ...req.body, naam };
  writeJSON(f, list);
  res.json(list[i]);
});

router.delete('/:list/:id', (req,res)=>{
  const f = fileFor(req.params.list);
  if (!f) return res.status(400).json({error:'invalid_list'});
  // blokkeren als in gebruik
  if (req.params.list !== 'trainers'){ // trainers mogen meerdere per course zijn
    const courses = readJSON('courses.json', []);
    const inUse = courses.some(c => (
      c.lestype_id === req.params.id ||
      c.thema_id === req.params.id ||
      c.locatie_id === req.params.id
    ));
    if (inUse) return res.status(409).json({error:'in_use', message:'Item is gekoppeld aan een les.'});
  }
  // voor trainers: check array
  if (req.params.list === 'trainers'){
    const courses = readJSON('courses.json', []);
    const inUse = courses.some(c => Array.isArray(c.trainer_ids) && c.trainer_ids.includes(req.params.id));
    if (inUse) return res.status(409).json({error:'in_use', message:'Trainer is gekoppeld aan een les.'});
  }

  const list = readJSON(f, []);
  const out = list.filter(x=>x.id!==req.params.id);
  writeJSON(f, out);
  res.json({ok:true});
});

module.exports = router;
