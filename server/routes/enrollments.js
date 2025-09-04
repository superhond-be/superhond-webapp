const express = require('express');
const { read, write, uid } = require('../helpers/enrollments');
const { read: readSessions, write: writeSessions } = require('../helpers/sessions');
const adminGuard = require('../adminGuard');

const router = express.Router();

/**
 * Model enrollment: {
 *   id, session_id, klant_id, hond_id, status:'actief'|'geannuleerd', created_at
 * }
 */

// lijst (admin ziet alles, klant later alleen eigen inschrijvingen)
router.get('/', adminGuard, (_req,res)=>{
  res.json(read());
});

// inschrijven
router.post('/', adminGuard, (req,res)=>{
  const b=req.body||{};
  if(!b.session_id || !b.klant_id || !b.hond_id){
    return res.status(400).json({error:'missing_fields'});
  }
  const sessions=readSessions();
  const s=sessions.find(x=>x.id===b.session_id);
  if(!s) return res.status(404).json({error:'session_not_found'});

  // check capaciteit
  const enrollments=read();
  const active=enrollments.filter(e=>e.session_id===s.id && e.status==='actief');
  if(active.length>=s.capacity){
    return res.status(400).json({error:'session_full'});
  }

  const rec={
    id: uid(),
    session_id: s.id,
    klant_id: b.klant_id,
    hond_id: b.hond_id,
    status:'actief',
    created_at: Date.now()
  };
  enrollments.push(rec); write(enrollments);

  // update session.enrolled
  s.enrolled = (s.enrolled||0)+1;
  if(s.enrolled>=s.capacity) s.status='vol';
  writeSessions(sessions);

  res.status(201).json(rec);
});

// annuleren
router.patch('/:id/cancel', adminGuard, (req,res)=>{
  const enrollments=read();
  const i=enrollments.findIndex(e=>e.id===req.params.id);
  if(i===-1) return res.status(404).json({error:'not_found'});
  enrollments[i].status='geannuleerd'; write(enrollments);

  // enrolled tellen opnieuw
  const sessions=readSessions();
  const s=sessions.find(x=>x.id===enrollments[i].session_id);
  if(s){
    const act=enrollments.filter(e=>e.session_id===s.id && e.status==='actief').length;
    s.enrolled=act;
    if(act<s.capacity) s.status='open';
    writeSessions(sessions);
  }

  res.json(enrollments[i]);
});

module.exports=router;
