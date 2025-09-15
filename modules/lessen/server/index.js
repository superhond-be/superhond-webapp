const express = require('express');
const router = express.Router();
const man = require('../module.json');
const store = {items:[]};
router.get('/version',(req,res)=>res.json({name:man.name,version:man.version}));
router.get('/items',(req,res)=>res.json(store.items));
router.post('/items', express.json(), (req,res)=>{
  const item = {id:Date.now(),...req.body};
  store.items.push(item);
  res.status(201).json(item);
});
module.exports=router;