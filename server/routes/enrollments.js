const express = require('express');
const { readJSON, writeJSON, uid, findCustomer, findDog, findValidPass, debitPass, refundPass } = require('../helpers');
const router = express.Router(); const FILE='enrollments.json';

router.get('/', (_req,res)=> res.json(readJSON(FILE,[])));

router.post('/', (req,res)=>{
  const { sessie_id, client_id, dog_id } = req.body;
  const sessions=readJSON('sessions.json',[]); const session=sessions.find(s=>s.id===sessie_id);
  if(!session) return res.status(404).json({error:'invalid_session'});
  const course=readJSON('courses.json',[]).find(c=>c.id===session.sjabloon_id);
  if(!course) return res.status(404).json({error:'invalid_course'});

  const client=findCustomer(client_id); const dog=findDog(dog_id);
  if(!client||!dog) return res.status(404).json({error:'client_or_dog_missing'});

  // membership approved vereist?
  const mems=readJSON('course_memberships.json',[]).find(m=>m.client_id===client_id && m.dog_id===dog_id && m.course_id===course.id && m.status==='approved');
  if(!mems) return res.status(403).json({error:'membership_required', message:'Aanvraag nog niet goedgekeurd.'});

  // capacity check
  const all=readJSON(FILE,[]); const count=all.filter(e=>e.sessie_id===sessie_id && e.status==='aangemeld').length;
  if(count >= Number(session.capaciteit||course.max||999)) return res.status(409).json({error:'capacity_full'});

  // pass policy (optioneel via course.requires_pass/type_id)
  let usedPass=null;
  if (course.requires_pass && course.pass_type_id){
    const pass=findValidPass({ email: client.email, type_id: course.pass_type_id });
    if(!pass) return res.status(402).json({error:'no_pass',message:'Geen geldige strippenkaart.'});
    if(!debitPass({ pass_id:pass.id, email:client.email, enrollment_id:'PENDING' })) return res.status(402).json({error:'no_credits',message:'Onvoldoende beurten.'});
    usedPass=pass.id;
  }

  const enr={ id:uid(), sessie_id, client_id, dog_id, status:'aangemeld', created_at:Date.now() };
  all.push(enr); writeJSON(FILE,all);
  res.status(201).json({ ...enr, client, dog, course });

  // (ledger bevat al 'PENDING'; je kunt optioneel een update doen om enrollment_id te koppelen)
});

router.delete('/:id', (req,res)=>{
  const list=readJSON(FILE,[]); const i=list.findIndex(x=>x.id===req.params.id); if(i===-1) return res.status(404).json({error:'not_found'});
  const enr=list[i]; list.splice(i,1); writeJSON(FILE,list);
  const client=readJSON('clients.json',[]).find(c=>c.id===enr.client_id);
  if(client) refundPass({ email:client.email, enrollment_id: enr.id });
  res.json({ ok:true });
});

module.exports = router;
