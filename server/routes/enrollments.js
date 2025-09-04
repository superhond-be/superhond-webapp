const express = require('express');
const { readJSON, writeJSON, uid } = require('../helpers');
const { render } = require('../tpl');
const { sendMail, logoAttachment } = require('../mailer');
const router = express.Router();

// ---- Files
const FILE_TYPES   = 'pass_types.json';
const FILE_PASSES  = 'passes.json';
const FILE_LEDGER  = 'pass_ledger.json';
const FILE_CLIENTS = 'clients.json';
const FILE_DOGS    = 'dogs.json';

// ---- Readers/Writers
const readTypes   = () => readJSON(FILE_TYPES, []);
const readPasses  = () => readJSON(FILE_PASSES, []);
const readLedger  = () => readJSON(FILE_LEDGER, []);
const writePasses = (x) => writeJSON(FILE_PASSES, x);
const writeLedger = (x) => writeJSON(FILE_LEDGER, x);

function getClient(id){ return readJSON(FILE_CLIENTS, []).find(c=>c.id===id) || null; }
function getDog(id){ return readJSON(FILE_DOGS, []).find(d=>d.id===id) || null; }

function sessionCapacity(sessId){
  const sessions = readJSON('sessions.json', []);
  const courses  = readJSON('courses.json', []);
  const se = sessions.find(s=>s.id===sessId);
  if (!se) return { cap: 0, session: null, course: null };
  const course = courses.find(c=>c.id===se.sjabloon_id);
  return { cap: course?.max ?? 0, session: se, course };
}

// ---- Strippenkaart helpers
function findValidPass({ email, type_id }){
  const now = Date.now();
  const passes = readPasses().filter(p=>p.active && p.email===email && p.remaining>0 && p.expires_at>now);
  if (!passes.length) return null;
  if (type_id) return passes.find(p=>p.type_id===type_id) || null;
  return passes[0];
}
function debitOne({ pass_id, email, enrollment_id }){
  const passes = readPasses();
  const i = passes.findIndex(p=>p.id===pass_id);
  if (i===-1 || passes[i].remaining<=0) return false;
  passes[i].remaining -= 1; writePasses(passes);
  const led = readLedger();
  led.push({ id: uid(), ts: Date.now(), email, pass_id, enrollment_id, action:'debit', amount:1 });
  writeLedger(led); return true;
}
function refundIfDebited({ email, enrollment_id }){
  const led = readLedger();
  const debit = led.find(x=>x.email===email && x.enrollment_id===enrollment_id && x.action==='debit');
  if (!debit) return false;
  const passes = readPasses();
  const i = passes.findIndex(p=>p.id===debit.pass_id);
  if (i!==-1){ passes[i].remaining += 1; writePasses(passes); }
  led.push({ id: uid(), ts: Date.now(), email, pass_id: debit.pass_id, enrollment_id, action:'refund', amount:1 });
  writeLedger(led); return true;
}

// ---- E-mail helpers
async function mailConfirmOrWaitlist({status, to, payload}){
  const html = status==='aangemeld' ? render('confirm.html', payload) : render('waitlist.html', payload);
  const text = status==='aangemeld' ? render('confirm.txt',  payload) : render('waitlist.txt',  payload);
  const subject = status==='aangemeld' ? 'Je inschrijving is bevestigd' : 'Je staat op de wachtlijst';
  await sendMail({ to, subject, text, html, attachments:[logoAttachment()].filter(Boolean) });
}
async function mailCancelled({to, payload}){
  const html = render('cancel.html', payload);
  const text = render('cancel.txt',  payload);
  await sendMail({ to, subject: 'Je afmelding is bevestigd', text, html, attachments:[logoAttachment()].filter(Boolean) });
}
async function mailPromoted({to, payload}){
  const html = render('promoted.html', payload);
  const text = render('promoted.txt',  payload);
  await sendMail({ to, subject: 'Je bent doorgeschoven naar bevestigd', text, html, attachments:[logoAttachment()].filter(Boolean) });
}

// ---- Utils
function coursePassPolicy(course){ return { required: !!course?.requires_pass, type_id: course?.pass_type_id || null }; }

// ================= ROUTES =================
router.get('/', (_req,res)=> res.json(readJSON('enrollments.json', [])) );

// Aanmelden (nu met client_id + dog_id)
router.post('/', async (req,res)=>{
  const list = readJSON('enrollments.json', []);
  const sessie_id = req.body.sessie_id;
  const client_id = req.body.client_id;
  const dog_id    = req.body.dog_id;

  // Validaties: sessie/klant/hond
  const { cap, session, course } = sessionCapacity(sessie_id);
  if (!session || !course) return res.status(404).json({ error:'invalid_session' });

  const client = getClient(client_id);
  if (!client) return res.status(422).json({ error:'invalid_client', message:'Client bestaat niet' });

  const dog = getDog(dog_id);
  if (!dog || dog.client_id !== client_id)
    return res.status(422).json({ error:'invalid_dog', message:'Hond bestaat niet of hoort niet bij de client' });

  // Dubbel voorkomen voor dezelfde sessie/klant/hond
  const dup = list.find(e => e.sessie_id===sessie_id && e.client_id===client_id && e.dog_id===dog_id && (e.status==='aangemeld' || e.status==='wachtlijst'));
  if (dup) return res.status(409).json({ error:'duplicate', message:'Deze combinatie client/hond is al ingeschreven (of wachtlijst) voor deze sessie.' });

  // Capaciteit → status
  const activeCount = list.filter(e=>e.sessie_id===sessie_id && e.status==='aangemeld').length;
  let status = activeCount < cap ? 'aangemeld' : 'wachtlijst';

  // Strippenkaart check bij directe aanmelding
  const policy = coursePassPolicy(course);
  let usedPassId = null;
  if (status==='aangemeld' && policy.required){
    const pass = findValidPass({ email: (client.email||'').toLowerCase(), type_id: policy.type_id||null });
    if (!pass) return res.status(402).json({ error:'no_pass', message:'Geen geldige strippenkaart gevonden of onvoldoende beurten.' });
    if (!debitOne({ pass_id: pass.id, email: (client.email||'').toLowerCase(), enrollment_id: 'PENDING' }))
      return res.status(402).json({ error:'no_credits', message:'Onvoldoende beurten op strippenkaart.' });
    usedPassId = pass.id;
  }

  // Definitief opslaan
  const item = { id: uid(), created_at: Date.now(), status, sessie_id, client_id, dog_id };
  list.push(item); writeJSON('enrollments.json', list);

  // Ledger: koppel PENDING naar echte inschrijving
  if (usedPassId){
    const led = readLedger();
    const p = led.find(x=>x.enrollment_id==='PENDING' && x.pass_id===usedPassId && x.email===(client.email||'').toLowerCase() && x.action==='debit');
    if (p){ p.enrollment_id = item.id; writeLedger(led); }
  }

  // Mail payload
  const payload = {
    naam: client.naam,
    hond: dog.naam,
    lesNaam: course?.naam||'Les',
    datum: session?.datum, tijd: session?.tijd,
    locatie: course?.locatie_naam||'-',
    trainer: course?.trainer_naam||'-',
    manage_url: '#'
  };
  try { await mailConfirmOrWaitlist({ status, to: client.email, payload }); } catch(e){ console.error('MAIL post failed', e?.message); }

  // Optioneel verrijkte response
  res.status(201).json({ ...item, client: { id: client.id, naam: client.naam, email: client.email }, dog: { id: dog.id, naam: dog.naam } });
});

// Bijwerken (bv. afmelden)
router.put('/:id', async (req,res)=>{
  const list = readJSON('enrollments.json', []);
  const i = list.findIndex(x => x.id === req.params.id);
  if (i === -1) return res.status(404).json({error:'not_found'});

  const before = { ...list[i] };
  list[i] = { ...list[i], ...req.body };
  writeJSON('enrollments.json', list);

  const { session, course, cap } = sessionCapacity(list[i].sessie_id);
  const client = getClient(before.client_id);
  const dog    = getDog(before.dog_id);
  const payloadBase = {
    lesNaam: course?.naam||'Les', datum: session?.datum, tijd: session?.tijd,
    locatie: course?.locatie_naam||'-', trainer: course?.trainer_naam||'-'
  };

  if (req.body.status === 'afgemeld'){
    // Refund strip
    refundIfDebited({ email: (client?.email||'').toLowerCase(), enrollment_id: before.id });
    try { await mailCancelled({ to: client?.email, payload: { ...payloadBase, naam: client?.naam, hond: dog?.naam, manage_url:'#' } }); } catch(e){ console.error('MAIL cancel failed', e?.message); }

    // Promotie van wachtlijst indien plaats vrij
    const activeCount = list.filter(e=>e.sessie_id===before.sessie_id && e.status==='aangemeld').length;
    if (activeCount < cap){
      const wait = list
        .filter(e=>e.sessie_id===before.sessie_id && e.status==='wachtlijst')
        .sort((a,b)=> (a.created_at||0)-(b.created_at||0));
      if (wait.length){
        const w = wait[0];
        const wClient = getClient(w.client_id);
        const policy = coursePassPolicy(course);
        if (policy.required){
          const pass = findValidPass({ email: (wClient?.email||'').toLowerCase(), type_id: policy.type_id||null });
          if (pass && debitOne({ pass_id: pass.id, email: (wClient?.email||'').toLowerCase(), enrollment_id: w.id })){
            w.status = 'aangemeld'; writeJSON('enrollments.json', list);
            try { await mailPromoted({ to: wClient?.email, payload: { ...payloadBase, naam: wClient?.naam, manage_url:'#' } }); } catch(e){ console.error('MAIL promoted failed', e?.message); }
          }
        } else {
          w.status = 'aangemeld'; writeJSON('enrollments.json', list);
          try { await mailPromoted({ to: wClient?.email, payload: { ...payloadBase, naam: wClient?.naam, manage_url:'#' } }); } catch(e){ console.error('MAIL promoted failed', e?.message); }
        }
      }
    }
  }

  res.json(list[i]);
});

// Verwijderen (refund + evt promotie)
router.delete('/:id', async (req,res)=>{
  const list = readJSON('enrollments.json', []);
  const rec  = list.find(x => x.id === req.params.id);
  const out  = list.filter(x => x.id !== req.params.id);
  writeJSON('enrollments.json', out);

  if (rec && rec.status === 'aangemeld'){
    const { session, course, cap } = sessionCapacity(rec.sessie_id);
    const client = getClient(rec.client_id);

    // Refund
    refundIfDebited({ email: (client?.email||'').toLowerCase(), enrollment_id: rec.id });

    // Promotie
    const activeCount = out.filter(e=>e.sessie_id===rec.sessie_id && e.status==='aangemeld').length;
    if (activeCount < cap){
      const wait = out
        .filter(e=>e.sessie_id===rec.sessie_id && e.status==='wachtlijst')
        .sort((a,b)=> (a.created_at||0)-(b.created_at||0));
      if (wait.length){
        const w = wait[0];
        const wClient = getClient(w.client_id);
        const policy = coursePassPolicy(course);
        if (policy.required){
          const pass = findValidPass({ email: (wClient?.email||'').toLowerCase(), type_id: policy.type_id||null });
          if (pass && debitOne({ pass_id: pass.id, email: (wClient?.email||'').toLowerCase(), enrollment_id: w.id })){
            w.status = 'aangemeld'; writeJSON('enrollments.json', out);
            try {
              await mailPromoted({ to: wClient?.email, payload: {
                lesNaam: course?.naam||'Les', datum: session?.datum, tijd: session?.tijd,
                locatie: course?.locatie_naam||'-', trainer: course?.trainer_naam||'-',
                naam: wClient?.naam, manage_url:'#'
              }});
            } catch(e){ console.error('MAIL promoted failed', e?.message); }
          }
        } else {
          w.status = 'aangemeld'; writeJSON('enrollments.json', out);
          try {
            await mailPromoted({ to: wClient?.email, payload: {
              lesNaam: course?.naam||'Les', datum: session?.datum, tijd: session?.tijd,
              locatie: course?.locatie_naam||'-', trainer: course?.trainer_naam||'-',
              naam: wClient?.naam, manage_url:'#'
            }});
          } catch(e){ console.error('MAIL promoted failed', e?.message); }
        }
      }
    }
  }

  res.json({ ok:true });
});

module.exports = router;
