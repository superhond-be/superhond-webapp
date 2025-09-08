const express = require('express');
const router = express.Router();
const storage = require('../server/storage');

const NAME = 'customers';
const all = () => storage.read(NAME, []);
const save = (list) => storage.write(NAME, list);

function upsertBy(predicate, attrs){
  const list = all();
  let item = list.find(predicate);
  if(item){
    Object.assign(item, attrs);
  }else{
    const id = list.length ? Math.max(...list.map(x=>x.id))+1 : 1;
    item = { id, ...attrs };
    list.push(item);
  }
  save(list);
  return item;
}

router.get('/', (_req,res)=> res.json(all()));

router.get('/:id', (req,res)=>{
  const id = Number(req.params.id);
  const item = all().find(x=>x.id===id);
  if(!item) return res.status(404).json({error:'Customer not found'});
  res.json(item);
});

router.post('/', (req,res)=>{
  const attrs = req.body || {};
  if(!attrs.name || !attrs.email) return res.status(400).json({error:'name en email vereist'});
  const list = all();
  const id = list.length ? Math.max(...list.map(x=>x.id))+1 : 1;
  const item = { id, requires_profile: true, ...attrs };
  list.push(item);
  save(list);
  res.status(201).json(item);
});

router.put('/:id', (req,res)=>{
  const id = Number(req.params.id);
  const list = all();
  const idx = list.findIndex(x=>x.id===id);
  if(idx===-1) return res.status(404).json({error:'Customer not found'});
  list[idx] = { ...list[idx], ...req.body, id };
  // auto-clear requires_profile if essential fields present
  const c = list[idx];
  if(c.phone && c.address && c.dogName) c.requires_profile = false;
  save(list);
  res.json(list[idx]);
});

router.post('/find-or-create', (req,res)=>{
  const { externalId, email, ...rest } = req.body || {};
  if(!externalId && !email) return res.status(400).json({error:'externalId of email vereist'});
  const pred = (x)=> (externalId ? x.externalId===externalId : false) || (email ? x.email===email : false);
  const item = upsertBy(pred, { externalId, email, ...rest });
  res.status(201).json(item);
});

module.exports = router;
