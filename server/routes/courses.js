const express = require('express');
const { readJSON, writeJSON, uid } = require('../helpers');
const router = express.Router(); const FILE='courses.json';

router.get('/', (_req,res)=> res.json(readJSON(FILE,[])));
router.post('/', (req,res)=>{ const list=readJSON(FILE,[]); const it={ id:uid(), ...req.body }; list.push(it); writeJSON(FILE,list); res.status(201).json(it); });

module.exports = router;
