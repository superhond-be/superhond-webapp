const express = require('express');
const { readJSON, writeJSON, uid } = require('../helpers');
const router = express.Router();

const FILE = 'dogs.json';

router.get('/', (req,res) => {
  const client_id = req.query.client_id;
  let list = readJSON(FILE, []);
  if (client_id) list = list.filter(d=>d.client_id===client_id);
  res.json(list);
});

router.post('/', (req,res) => {
  const list = readJSON(FILE, []);
  const item = {
    id: uid(),
    naam: (req.body.naam||'').trim(),
    ras: req.body.ras||'',
    geboortedatum: req.body.geboortedatum||null,
    client_id: req.body.client_id
  };
  if (!item.naam || !item.client_id) {
    return res.status(422).json({error:'validation', fields:['naam','client_id']});
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
