const express = require('express');
const { readJSON, writeJSON, uid } = require('../helpers');
const router = express.Router(); const FILE='sessions.json';

router.get('/', (_req,res)=> res.json(readJSON(FILE,[])));
router.post('/', (req,res)=>{ const list=readJSON(FILE,[]); const it={ id:uid(), geannuleerd:false, ...req.body }; list.push(it); writeJSON(FILE,list); res.status(201).json(it); });
router.post('/:id/cancel', (req,res)=>{ const list=readJSON(FILE,[]); const i=list.findIndex(s=>s.id===req.params.id); if(i===-1) return res.status(404).json({error:'not_found'}); list[i].geannuleerd=true; writeJSON(FILE,list); res.json(list[i]); });

module.exports = router;
