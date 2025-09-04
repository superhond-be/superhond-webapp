const express = require('express');
const { readJSON, writeJSON, uid, issuePass } = require('../helpers');
const router = express.Router();

router.get('/types', (_req,res)=> res.json(readJSON('pass_types.json',[])));
router.post('/types', (req,res)=>{ const list=readJSON('pass_types.json',[]); const it={ id:uid(), naam:req.body.naam, total_credits:Number(req.body.total_credits||0), expiry_days:Number(req.body.expiry_days||365) }; list.push(it); writeJSON('pass_types.json',list); res.status(201).json(it); });

router.get('/', (_req,res)=> res.json(readJSON('passes.json',[])));
router.post('/', (req,res)=>{ try{ const pass=issuePass({ email:req.body.email, type_id:req.body.type_id }); res.status(201).json(pass); }catch(e){ res.status(400).json({error:e.message}); } });

module.exports = router;
