const express = require('express');
const { v4:uuid } = require('uuid');
const customerGuard = require('../customerGuard');

const { readCustomers, writeCustomers, findByEmail } = require('../helpers/customers');
const Dogs = require('../helpers/dogs');
const Credits = require('../helpers/credits');
const Sessions = require('../helpers/sessions');
const Enrolls = require('../helpers/publicEnrollments');

const Notifs = require('../helpers/notifications');
const { getPolicy } = require('../helpers/notification_policy');
const { shouldEmail } = require('../helpers/preferences');
const { mailSend } = require('../helpers/mailer_send');
const { emailTemplate } = require('../helpers/mailer_template');

const router = express.Router();

router.get('/me', customerGuard, (req,res)=>{
  const c = findByEmail(req.customer.email);
  res.json({ ok:true, customer: c || { email:req.customer.email } });
});

router.patch('/me', customerGuard, (req,res)=>{
  const arr = readCustomers(); const email=req.customer.email.toLowerCase();
  let i = arr.findIndex(x=>(x.email||'').toLowerCase()===email);
  const base = { email, naam:req.body.naam||'', tel:req.body.tel||'', adres:req.body.adres||{} };
  if(i===-1){ arr.push({ id: uuid(), ...base }); } else { arr[i] = { ...arr[i], ...base }; }
  writeCustomers(arr);
  res.json({ ok:true });
});

router.get('/dogs', customerGuard, (req,res)=>{
  const c = findByEmail(req.customer.email); const dogs = Dogs.read().filter(d=>d.eigenaar_id===c?.id);
  res.json({ ok:true, dogs });
});

router.post('/dogs', customerGuard, (req,res)=>{
  const c = findByEmail(req.customer.email); if(!c) return res.status(400).json({error:'no_customer'});
  const all=Dogs.read(); const rec={ id:uuid(), eigenaar_id:c.id, naam:req.body.naam, ras:req.body.ras||'', gebdatum:req.body.gebdatum||'', dierenarts:req.body.dierenarts||'' };
  all.push(rec); Dogs.write(all); res.json({ ok:true, dog:rec });
});

router.patch('/dogs/:id', customerGuard, (req,res)=>{
  const c = findByEmail(req.customer.email); if(!c) return res.status(400).json({error:'no_customer'});
  const all=Dogs.read(); const i=all.findIndex(d=>d.id===req.params.id && d.eigenaar_id===c.id);
  if(i===-1) return res.status(404).json({error:'not_found'});
  all[i] = { ...all[i], ...req.body }; Dogs.write(all);
  res.json({ ok:true });
});

router.get('/credits', customerGuard, (req,res)=>{
  const c = findByEmail(req.customer.email); if(!c) return res.json({ ok:true, credits:[] });
  const dogs = Dogs.read().filter(d=>d.eigenaar_id===c.id).map(d=>d.id);
  const credits = Credits.read().filter(cr=> dogs.includes(cr.dog_id));
  res.json({ ok:true, credits });
});

router.get('/sessions/open', customerGuard, (req,res)=>{
  const { course_id } = req.query || {};
  const sessions = Sessions.read().filter(s=>{
    const open = (s.status||'open')==='open' && (s.capacity-(s.enrolled||0))>0;
    const byCourse = course_id ? (s.course_id===course_id) : true;
    return open && byCourse;
  }).map(s=>({ ...s, seats_left: (s.capacity-(s.enrolled||0)) }));
  res.json({ ok:true, sessions });
});

router.post('/sessions/:session_id/enroll', customerGuard, async (req,res)=>{
  const c = findByEmail(req.customer.email); if(!c) return res.status(400).json({error:'no_customer'});
  const { dog_id, handler_name } = req.body || {};
  const sessions = Sessions.read(); const s = sessions.find(x=>x.id===req.params.session_id);
  if(!s) return res.status(404).json({error:'session_not_found'});
  if((s.capacity-(s.enrolled||0))<=0) return res.status(400).json({error:'full'});

  const credit = Credits.read().find(cr=> cr.dog_id===dog_id && cr.course_id===s.course_id && cr.approved===true && cr.remaining>0 && cr.valid_until && cr.valid_until>=Date.now());
  if(!credit) return res.status(400).json({error:'no_valid_credit'});

  credit.remaining -= 1; Credits.write(Credits.read().map(x=> x===credit?credit:x));

  const all = Enrolls.read();
  const rec = { id:uuid(), customer_id:c.id, hond_id:dog_id, session_id:s.id, status:'actief', handler_name:handler_name||'', klant:{ email:c.email }, created_at:new Date().toISOString() };
  all.push(rec); Enrolls.write(all);

  s.enrolled = (s.enrolled||0)+1; Sessions.write(sessions);

  const policy = getPolicy('lesson_signup') || { audience:'both', delivery:['dashboard'] };
  Notifs.create({ type:'lesson_signup', message:`Inschrijving bevestigd (${s.start_iso}).`, customer_id:c.id, dog_id, audience:policy.audience, delivery:policy.delivery });
  if(policy.delivery.includes('email') && shouldEmail(c.id,'lesson_signup')){
    await mailSend({
      to:c.email,
      subject:'📅 Je lesaanmelding is bevestigd',
      text:`Je bent ingeschreven voor ${s.start_iso}`,
      html: emailTemplate({ title:'📅 Je lesaanmelding is bevestigd', bodyHtml:`<p>Dag ${c.naam||''},</p><p>We hebben je ingeschreven voor <strong>${s.start_iso}</strong>.</p>` })
    });
  }

  res.json({ ok:true, enrollment: rec });
});

router.get('/enrollments', customerGuard, (req,res)=>{
  const c = findByEmail(req.customer.email); if(!c) return res.json({ ok:true, enrollments:[] });
  const enrolled = Enrolls.read().filter(e=>e.customer_id===c.id);
  const sessions = Sessions.read();
  const out = enrolled.map(e=>({ ...e, session: sessions.find(s=>s.id===e.session_id) || null }));
  res.json({ ok:true, enrollments: out });
});

router.post('/enrollments/:id/cancel', customerGuard, (req,res)=>{
  const MIN = Number(process.env.CANCEL_MIN_HOURS || 24);
  const c = findByEmail(req.customer.email); if(!c) return res.status(400).json({error:'no_customer'});
  const all = Enrolls.read(); const i = all.findIndex(e=> e.id===req.params.id && e.customer_id===c.id && e.status==='actief');
  if(i===-1) return res.status(404).json({error:'not_found'});

  const sessions = Sessions.read();
  const s = sessions.find(x=>x.id===all[i].session_id);
  if(!s) return res.status(404).json({error:'session_not_found'});

  const diffH = (new Date(s.start_iso).getTime() - Date.now()) / (1000*60*60);
  if(diffH < MIN) return res.status(400).json({error:'too_late_to_cancel', min_hours:MIN});

  all[i].status='geannuleerd'; Enrolls.write(all);
  return res.json({ ok:true });
});

router.get('/notifications', customerGuard, (req,res)=>{
  const c = findByEmail(req.customer.email); if(!c) return res.json({ ok:true, items:[] });
  const items = Notifs.forCustomer(c.id);
  res.json({ ok:true, items });
});

router.post('/notifications/:id/seen', customerGuard, (req,res)=>{
  const c = findByEmail(req.customer.email); if(!c) return res.status(400).json({error:'no_customer'});
  const all = Notifs.read();
  const i = all.findIndex(n=> n.id===req.params.id && n.customer_id===c.id);
  if(i===-1) return res.status(404).json({error:'not_found'});
  all[i].seen_by_customer = true; Notifs.write(all);
  res.json({ ok:true });
});

module.exports = router;
