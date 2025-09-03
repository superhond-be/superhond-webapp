const express = require('express');
const { readJSON, writeJSON, uid } = require('../helpers');
const { render } = require('../tpl');
const { sendMail, logoAttachment } = require('../mailer');
const router = express.Router();

router.get('/', (_req,res)=> res.json(readJSON('sessions.json', [])) );

router.post('/', (req,res)=>{
  const list = readJSON('sessions.json', []);
  const item = { id: uid(), geannuleerd:false, ...req.body };
  list.push(item); writeJSON('sessions.json', list);
  res.status(201).json(item);
});

router.put('/:id', async (req,res)=>{
  const sessions = readJSON('sessions.json', []);
  const i = sessions.findIndex(s => s.id === req.params.id);
  if (i === -1) return res.status(404).json({error:'Not found'});

  sessions[i] = { ...sessions[i], ...req.body };
  writeJSON('sessions.json', sessions);
  const updated = sessions[i];

  // Bij annuleren → mail iedereen (aangemeld + wachtlijst)
  if (req.body.geannuleerd === true){
    const enrollments = readJSON('enrollments.json', []);
    const courses = readJSON('courses.json', []);
    const course = courses.find(c => c.id === updated.sjabloon_id);
    const payloadBase = {
      lesNaam: course?.naam||'Les',
      datum: updated.datum, tijd: updated.tijd,
      locatie: course?.locatie_naam||'-', trainer: course?.trainer_naam||'-', manage_url:'#'
    };
    const targets = enrollments.filter(e => e.sessie_id === updated.id && (e.status==='aangemeld' || e.status==='wachtlijst'));
    for (const e of targets){
      const payload = { ...payloadBase, naam: e.naam };
      const html = render('session-cancelled.html', payload);
      const text = render('session-cancelled.txt',  payload);
      try {
        await sendMail({ to: e.email, subject: 'Sessie geannuleerd', text, html,
          attachments:[logoAttachment()].filter(Boolean) });
      } catch(err){ console.error('MAIL session-cancel failed for', e.email, err?.message); }
    }
  }

  res.json(updated);
});

router.delete('/:id', (req,res)=>{
  const out = readJSON('sessions.json', []).filter(x => x.id !== req.params.id);
  writeJSON('sessions.json', out);
  res.json({ ok:true });
});

module.exports = router;
