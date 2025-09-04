const express = require('express');
const { readJSON, writeJSON, uid, findCustomerByEmail } = require('../helpers');
const router = express.Router(); const FILE='purchases.json';

router.post('/webhook', (req,res)=>{ const list=readJSON(FILE,[]); const it={ id:uid(), order_id:String(req.body.order_id||''), email:(req.body.email||'').toLowerCase(), sku:String(req.body.sku||''), status:'ready', token:uid(), created_at:Date.now() }; list.push(it); writeJSON(FILE,list); res.json({ ok:true, token:it.token }); });

router.get('/start/:token', (req,res)=>{ const it=readJSON(FILE,[]).find(x=>x.token===req.params.token && x.status==='ready'); if(!it) return res.status(404).json({error:'token_invalid'}); const map=readJSON('products.json',[]).find(p=>p.sku===it.sku); if(!map) return res.status(400).json({error:'unknown_sku'}); res.json({ email:it.email, sku:it.sku, map }); });

router.post('/complete/:token', (req,res)=>{
  const purchases=readJSON(FILE,[]); const idx=purchases.findIndex(x=>x.token===req.params.token && x.status==='ready'); if(idx===-1) return res.status(404).json({error:'token_invalid'});
  const purchase=purchases[idx]; const products=readJSON('products.json',[]); const map=products.find(p=>p.sku===purchase.sku); if(!map) return res.status(400).json({error:'unknown_sku'});

  // client + dog aanmaken/zoeken
  const clients=readJSON('clients.json',[]); let client=findCustomerByEmail(req.body.client?.email||purchase.email);
  if(!client){ client={ id:uid(), naam:req.body.client?.naam||'', email:(req.body.client?.email||purchase.email).toLowerCase(), telefoon:req.body.client?.telefoon||'' }; clients.push(client); writeJSON('clients.json',clients); }
  const dogs=readJSON('dogs.json',[]); let dog=dogs.find(d=>d.client_id===client.id && d.naam===(req.body.dog?.naam||'').trim());
  if(!dog){ dog={ id:uid(), naam:req.body.dog?.naam||'', ras:req.body.dog?.ras||'', geboortedatum:req.body.dog?.geboortedatum||null, client_id:client.id }; dogs.push(dog); writeJSON('dogs.json',dogs); }

  // membership pending
  const memberships=readJSON('course_memberships.json',[]); if(map.action==='enroll_course'){ memberships.push({ id:uid(), course_id:map.course_id, client_id:client.id, dog_id:dog.id, status:'pending', source:{order_id:purchase.order_id, sku:purchase.sku}, created_at:Date.now() }); writeJSON('course_memberships.json',memberships); }

  // als issue_pass: zet alleen record weg (uitgifte kun je ook hier doen als gewenst)
  if(map.action==='issue_pass'){ const pending=readJSON('pass_issues.json',[]); pending.push({ id:uid(), email:client.email, type_id:map.pass_type_id, source:{order_id:purchase.order_id, sku:purchase.sku}, created_at:Date.now() }); writeJSON('pass_issues.json',pending); }

  purchases[idx]={...purchase,status:'consumed',consumed_at:Date.now()}; writeJSON(FILE,purchases);
  res.json({ ok:true, client, dog, action: map.action });
});

module.exports = router;
