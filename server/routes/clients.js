const express = require('express');
const { readJSON, writeJSON, uid } = require('../helpers');
const router = express.Router();

const FILE = 'clients.json';

router.get('/', (_req,res) => {
  res.json(readJSON(FILE, []));
});

router.post('/', (req,res) => {
  const list = readJSON(FILE, []);
  const item = {
    id: uid(),
    naam: (req.body.naam||'').trim(),
    email: (req.body.email||'').trim().toLowerCase(),
    telefoon: req.body.telefoon||''
  };
  if (!item.naam || !item.email) {
    return res.status(422).json({error:'validation', fields:['naam','email']});
  }
  list.push(item);
  writeJSON(FILE, list);
  res.status(201).json(item);
});

router.put('/:id', (req,res) => {
  const list = readJSON(FILE, []);
  const i = list.findIndex(x=>x.id===req.params.id);
  if (i===-1) return res.status(404).json({error:'not_found'});
  list[i] = { ...list[i], ...req.body };
  writeJSON(FILE, list);
  res.json(list[i]);
});

router.delete('/:id', (req,res) => {
  const out = readJSON(FILE, []).filter(x=>x.id!==req.params.id);
  writeJSON(FILE, out);
  res.json({ok:true});
});

module.exports = router;
