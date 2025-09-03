const express = require('express');
const { readJSON, writeJSON, uid } = require('../helpers');
const { render } = require('../tpl');
const { sendMail, logoAttachment } = require('../mailer');
const router = express.Router();

function normEmail(e){ return (e||'').trim().toLowerCase(); }

function sessionCapacity(sessId){
  const sessions = readJSON('sessions.json', []);
  const courses  = readJSON('courses.json', []);
  const se = sessions.find(s=>s.id===sessId);
  if (!se) return { cap: 0, session: null, course: null };
  const course = courses.find(c=>c.id===se.sjabloon_id);
  return { cap: course?.max ?? 0, session: se, course };
}

async function mailConfirmOrWaitlist({status, email, payload}){
  if (status === 'aangemeld'){
    const html = render('confirm.html', payload);
    const text = render('confirm.txt',  payload);
    await sendMail({ to: email, subject: 'Je inschrijving is bevestigd', text, html,
      attachments:[logoAttachment()].filter(Boolean) });
  } else {
    const html = render('waitlist.html', payload);
    const text = render('waitlist.txt',  payload);
    await sendMail({ to: email, subject: 'Je staat op de wachtlijst', text, html,
      attachments:[logoAttachment()].filter(Boolean) });
  }
}

async function mailCancelled({email, payload}){
  const html = render('cancel.html', payload);
  const text = render('cancel.txt',  payload);
  await sendMail({ to: email, subject: 'Je afmelding is bevestigd', text, html,
    attachments:[logoAttachment()].filter(Boolean) });
}

async function mailPromoted({email, payload}){
  const html = render('promoted.html', payload);
  const text = render('promoted.txt',  payload);
  await sendMail({ to: email, subject: 'Je bent doorgeschoven naar bevestigd', text, html,
    attachments:[logoAttachment()].filter(Boolean) });
}

router.get('/', (_req,res)=> res.json(readJSON('enrollments.json', [])) );

// Aanmelden
router.post('/', async (req,res)=>{
  const list = readJSON('enrollments.json', []);
  const sessie_id = req.body.sessie_id;
  const email = normEmail(req.body.email);
  const naam  = (req.body.naam||'').trim();

  // Dubbel voorkomen
  const dup = list.find(e => e.sessie_id===sessie_id && normEmail(e.email)===email && (e.status==='aangemeld' || e.status==='wachtlijst'));
  if (dup) return res.status(409).json({ error:'duplicate', message:'Deze deelnemer is al ingeschreven (of staat op wachtlijst) voor deze sessie.' });

  // Capaciteit
  const { cap, session, course } = sessionCapacity(sessie_id);
  const activeCount = list.filter(e=>e.sessie_id===sessie_id && e.status==='aangemeld').length;
  const status = activeCount < cap ? 'aangemeld' : 'wachtlijst';

  const item = { id: uid(), created_at: Date.now(), status, ...req.body, email, naam };
  list.push(item); writeJSON('enrollments.json', list);

  // Mail
  const payload = {
    naam, lesNaam: course?.naam||'Les', datum: session?.datum, tijd: session?.tijd,
    locatie: course?.locatie_naam||'-', trainer: course?.trainer_naam||'-', manage_url:'#'
  };
  try { await mailConfirmOrWaitlist({status, email, payload}); } catch(e){ console.error('MAIL post failed', e?.message); }

  res.status(201).json(item);
});

// Wijzigen (bv. afmelden)
router.put('/:id', async (req,res)=>{
  const list = readJSON('enrollments.json', []);
  const i = list.findIndex(x => x.id === req.params.id);
  if (i === -1) return res.status(404).json({error:'Not found'});

  const before = { ...list[i] };
  list[i] = { ...list[i], ...req.body };
  writeJSON('enrollments.json', list);

  // Bij afmelding → mail + promotie wachtlijst
  if (req.body.status === 'afgemeld'){
    const { session, course, cap } = sessionCapacity(list[i].sessie_id);
    const payload = { naam: before.naam, lesNaam: course?.naam||'Les', datum: session?.datum, tijd: session?.tijd,
      locatie: course?.locatie_naam||'-', trainer: course?.trainer_naam||'-', manage_url:'#' };
    try { await mailCancelled({ email: before.email, payload }); } catch(e){ console.error('MAIL cancel failed', e?.message); }

    const activeCount = list.filter(e=>e.sessie_id===before.sessie_id && e.status==='aangemeld').length;
    if (activeCount < cap){
      const wait = list
        .filter(e=>e.sessie_id===before.sessie_id && e.status==='wachtlijst')
        .sort((a,b)=> (a.created_at||0)-(b.created_at||0));
      if (wait.length){
        wait[0].status = 'aangemeld';
        writeJSON('enrollments.json', list);
        try {
          await mailPromoted({ email: wait[0].email, payload: { ...payload, naam: wait[0].naam } });
        } catch(e){ console.error('MAIL promoted failed', e?.message); }
      }
    }
  }

  res.json(list[i]);
});

// Verwijderen → evt. promotie
router.delete('/:id', async (req,res)=>{
  const list = readJSON('enrollments.json', []);
  const rec  = list.find(x => x.id === req.params.id);
  const out  = list.filter(x => x.id !== req.params.id);
  writeJSON('enrollments.json', out);

  if (rec && rec.status === 'aangemeld'){
    const { session, course, cap } = sessionCapacity(rec.sessie_id);
    const activeCount = out.filter(e=>e.sessie_id===rec.sessie_id && e.status==='aangemeld').length;
    if (activeCount < cap){
      const wait = out
        .filter(e=>e.sessie_id===rec.sessie_id && e.status==='wachtlijst')
        .sort((a,b)=> (a.created_at||0)-(b.created_at||0));
      if (wait.length){
        wait[0].status = 'aangemeld';
        writeJSON('enrollments.json', out);
        const payload = { naam: wait[0].naam, lesNaam: course?.naam||'Les', datum: session?.datum, tijd: session?.tijd,
          locatie: course?.locatie_naam||'-', trainer: course?.trainer_naam||'-', manage_url:'#' };
        try { await mailPromoted({ email: wait[0].email, payload }); } catch(e){ console.error('MAIL promoted failed', e?.message); }
      }
    }
  }

  res.json({ ok:true });
});

module.exports = router;
