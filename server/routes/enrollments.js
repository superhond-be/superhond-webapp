const express = require('express');
const { readJSON, writeJSON, uid } = require('../helpers');
const { render } = require('../tpl');
const { sendMail, logoAttachment } = require('../mailer');
const router = express.Router();

const FILE_TYPES  = 'pass_types.json';
const FILE_PASSES = 'passes.json';
const FILE_LEDGER = 'pass_ledger.json';

function readTypes(){ return readJSON(FILE_TYPES, []); }
function readPasses(){ return readJSON(FILE_PASSES, []); }
function readLedger(){ return readJSON(FILE_LEDGER, []); }
function writePasses(x){ writeJSON(FILE_PASSES, x); }
function writeLedger(x){ writeJSON(FILE_LEDGER, x); }

function normEmail(e){ return (e||'').trim().toLowerCase(); }

function sessionCapacity(sessId){
  const sessions = readJSON('sessions.json', []);
  const courses  = readJSON('courses.json', []);
  const se = sessions.find(s=>s.id===sessId);
  if (!se) return { cap: 0, session: null, course: null };
  const course = courses.find(c=>c.id===se.sjabloon_id);
  return { cap: course?.max ?? 0, session: se, course };
}

// ==== Strippenkaart helpers ====

// Bepaalt of course een strippenkaart vereist en zo ja welk type (optioneel)
// Verwacht in course: requires_pass (bool), pass_type_id (optioneel)
function coursePassPolicy(course){
  return {
    required: !!course?.requires_pass,
    type_id: course?.pass_type_id || null
  };
}

// Zoek een geldige pas voor email (en optioneel specifiek type_id)
function findValidPass({ email, type_id }){
  const passes = readPasses().filter(p=>p.active && p.email===email && p.remaining>0 && p.expires_at> Date.now());
  if (!passes.length) return null;
  if (type_id) return passes.find(p=>p.type_id===type_id) || null;
  return passes[0]; // eerste beste
}

// Boek 1 strip af + schrijf ledger
function debitOne({ pass_id, email, enrollment_id }){
  const passes = readPasses();
  const i = passes.findIndex(p=>p.id===pass_id);
  if (i===-1 || passes[i].remaining<=0) return false;
  passes[i].remaining -= 1;
  writePasses(passes);

  const ledger = readLedger();
  ledger.push({
    id: uid(),
    ts: Date.now(),
    email,
    pass_id,
    enrollment_id,
    action: 'debit',
    amount: 1
  });
  writeLedger(ledger);
  return true;
}

// Refund (alleen als er eerder een debit was voor deze enrollment)
function refundIfDebited({ email, enrollment_id }){
  const ledger = readLedger();
  const debit = ledger.find(x=>x.email===email && x.enrollment_id===enrollment_id && x.action==='debit');
  if (!debit) return false;

  // credit terugzetten
  const passes = readPasses();
  const i = passes.findIndex(p=>p.id===debit.pass_id);
  if (i!==-1){
    passes[i].remaining += 1;
    writePasses(passes);
  }
  ledger.push({
    id: uid(),
    ts: Date.now(),
    email,
    pass_id: debit.pass_id,
    enrollment_id,
    action: 'refund',
    amount: 1
  });
  writeLedger(ledger);
  return true;
}

// ==== E-mail helpers (ongewijzigd) ====
async function mailConfirmOrWaitlist({status, email, payload}){
  const html = status==='aangemeld' ? render('confirm.html', payload) : render('waitlist.html', payload);
  const text = status==='aangemeld' ? render('confirm.txt',  payload) : render('waitlist.txt',  payload);
  const subject = status==='aangemeld' ? 'Je inschrijving is bevestigd' : 'Je staat op de wachtlijst';
  await sendMail({ to: email, subject, text, html, attachments:[logoAttachment()].filter(Boolean) });
}
async function mailCancelled({email, payload}){
  const html = render('cancel.html', payload);
  const text = render('cancel.txt',  payload);
  await sendMail({ to: email, subject: 'Je afmelding is bevestigd', text, html, attachments:[logoAttachment()].filter(Boolean) });
}
async function mailPromoted({email, payload}){
  const html = render('promoted.html', payload);
  const text = render('promoted.txt',  payload);
  await sendMail({ to: email, subject: 'Je bent doorgeschoven naar bevestigd', text, html, attachments:[logoAttachment()].filter(Boolean) });
}

// ==== Routes ====
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
  let status = activeCount < cap ? 'aangemeld' : 'wachtlijst';

  // Als course een strippenkaart vereist en we zouden 'aangemeld' maken → eerst controleren/boeken
  const policy = coursePassPolicy(course);
  let usedPassId = null;
  if (status==='aangemeld' && policy.required){
    const mustType = policy.type_id || null;
    const pass = findValidPass({ email, type_id: mustType });
    if (!pass){
      return res.status(402).json({
        error:'no_pass',
        message:'Geen geldige strippenkaart gevonden (onvoldoende beurten of vervallen).',
        required_type_id: mustType
      });
    }
    if (!debitOne({ pass_id: pass.id, email, enrollment_id: 'PENDING' })){
      return res.status(402).json({ error:'no_credits', message:'Onvoldoende beurten op strippenkaart.' });
    }
    usedPassId = pass.id;
  }

  // Definitief aanmaken
  const item = { id: uid(), created_at: Date.now(), status, ...req.body, email, naam };
  list.push(item); writeJSON('enrollments.json', list);

  // Ledger bij "pending" debit corrigeren met echt enrollment_id (kleine fix)
  if (usedPassId){
    const ledger = readLedger();
    const pending = ledger.find(x=>x.enrollment_id==='PENDING' && x.pass_id===usedPassId && x.email===email && x.action==='debit');
    if (pending){ pending.enrollment_id = item.id; writeLedger(ledger); }
  }

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

  const { session, course, cap } = sessionCapacity(list[i].sessie_id);
  const payloadBase = { lesNaam: course?.naam||'Les', datum: session?.datum, tijd: session?.tijd,
    locatie: course?.locatie_naam||'-', trainer: course?.trainer_naam||'-', manage_url:'#' };

  if (req.body.status === 'afgemeld'){
    // Refund strip (indien eerder aangemeld en afgetrokken)
    refundIfDebited({ email: before.email, enrollment_id: before.id });
    try { await mailCancelled({ email: before.email, payload: { ...payloadBase, naam: before.naam } }); } catch(e){ console.error('MAIL cancel failed', e?.message); }

    // Promotie wachtlijst?
    const activeCount = list.filter(e=>e.sessie_id===before.sessie_id && e.status==='aangemeld').length;
    if (activeCount < cap){
      const wait = list
        .filter(e=>e.sessie_id===before.sessie_id && e.status==='wachtlijst')
        .sort((a,b)=> (a.created_at||0)-(b.created_at||0));
      if (wait.length){
        // ➜ promotie: check strippenkaart als nodig
        const policy = coursePassPolicy(course);
        if (policy.required){
          const pass = findValidPass({ email: normEmail(wait[0].email), type_id: policy.type_id||null });
          if (!pass) {
            // geen pass → niet promoten, laat op wachtlijst
          } else {
            if (debitOne({ pass_id: pass.id, email: normEmail(wait[0].email), enrollment_id: wait[0].id })){
              wait[0].status = 'aangemeld';
              writeJSON('enrollments.json', list);
              try { await mailPromoted({ email: wait[0].email, payload: { ...payloadBase, naam: wait[0].naam } }); } catch(e){ console.error('MAIL promoted failed', e?.message); }
            }
          }
        } else {
          // geen pass nodig → direct promoten
          wait[0].status = 'aangemeld';
          writeJSON('enrollments.json', list);
          try { await mailPromoted({ email: wait[0].email, payload: { ...payloadBase, naam: wait[0].naam } }); } catch(e){ console.error('MAIL promoted failed', e?.message); }
        }
      }
    }
  }

  res.json(list[i]);
});

// Verwijderen → evt. refund en promotie
router.delete('/:id', async (req,res)=>{
  const list = readJSON('enrollments.json', []);
  const rec  = list.find(x => x.id === req.params.id);
  const out  = list.filter(x => x.id !== req.params.id);
  writeJSON('enrollments.json', out);

  if (rec && rec.status === 'aangemeld'){
    // Refund bij verwijderen
    refundIfDebited({ email: rec.email, enrollment_id: rec.id });

    const { session, course, cap } = sessionCapacity(rec.sessie_id);
    const activeCount = out.filter(e=>e.sessie_id===rec.sessie_id && e.status==='aangemeld').length;
    if (activeCount < cap){
      const wait = out
        .filter(e=>e.sessie_id===rec.sessie_id && e.status==='wachtlijst')
        .sort((a,b)=> (a.created_at||0)-(b.created_at||0));
      if (wait.length){
        const policy = coursePassPolicy(course);
        if (policy.required){
          const pass = findValidPass({ email: normEmail(wait[0].email), type_id: policy.type_id||null });
          if (pass && debitOne({ pass_id: pass.id, email: normEmail(wait[0].email), enrollment_id: wait[0].id })){
            wait[0].status = 'aangemeld';
            writeJSON('enrollments.json', out);
            try { await mailPromoted({ email: wait[0].email, payload: { lesNaam: course?.naam||'Les', datum: session?.datum, tijd: session?.tijd, locatie: course?.locatie_naam||'-', trainer: course?.trainer_naam||'-', naam: wait[0].naam, manage_url:'#' } }); } catch(e){ console.error('MAIL promoted failed', e?.message); }
          }
        } else {
          wait[0].status = 'aangemeld';
          writeJSON('enrollments.json', out);
          try { await mailPromoted({ email: wait[0].email, payload: { lesNaam: course?.naam||'Les', datum: session?.datum, tijd: session?.tijd, locatie: course?.locatie_naam||'-', trainer: course?.trainer_naam||'-', naam: wait[0].naam, manage_url:'#' } }); } catch(e){ console.error('MAIL promoted failed', e?.message); }
        }
      }
    }
  }

  res.json({ ok:true });
});

module.exports = router;
