const express = require('express');
const { readJSON, writeJSON, uid } = require('../helpers');
const router = express.Router(); const FILE='dogs.json';

router.get('/', (req,res)=>{ const list=readJSON(FILE,[]); const f=req.query.client_id? list.filter(d=>d.client_id===req.query.client_id):list; res.json(f); });
router.post('/', (req,res)=>{ const list=readJSON(FILE,[]); const it={ id:uid(), naam:req.body.naam||'', ras:req.body.ras||'', geboortedatum:req.body.geboortedatum||null, client_id:req.body.client_id }; list.push(it); writeJSON(FILE,list); res.status(201).json(it); });

module.exports = router;
