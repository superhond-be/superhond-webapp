const express = require('express');
const { readJSON, writeJSON, uid } = require('../helpers');
const router = express.Router();

function crud(name){ const file=`${name}.json`;
  router.get(`/${name}`, (_req,res)=> res.json(readJSON(file,[])));
  router.post(`/${name}`, (req,res)=>{ const list=readJSON(file,[]); const it={ id:uid(), ...req.body }; list.push(it); writeJSON(file,list); res.status(201).json(it); });
  router.delete(`/${name}/:id`, (req,res)=>{ const list=readJSON(file,[]).filter(x=>x.id!==req.params.id); writeJSON(file,list); res.json({ok:true}); });
}
['locaties','themas','lestypes','trainers'].forEach(crud);

module.exports = router;
