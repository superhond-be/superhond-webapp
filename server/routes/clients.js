const express = require('express');
const { readJSON, writeJSON, uid } = require('../helpers');
const router = express.Router(); const FILE='clients.json';

router.get('/', (_req,res)=> res.json(readJSON(FILE,[])));
router.post('/', (req,res)=>{ const list=readJSON(FILE,[]); const it={ id:uid(), naam:req.body.naam||'', email:(req.body.email||'').toLowerCase(), telefoon:req.body.telefoon||'' }; list.push(it); writeJSON(FILE,list); res.status(201).json(it); });

module.exports = router;
