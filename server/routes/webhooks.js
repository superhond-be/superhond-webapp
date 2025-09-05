const express = require('express');
const { v4: uuid } = require('uuid');
const { readCustomers, writeCustomers } = require('../helpers/customers');
const Dogs = require('../helpers/dogs');
const Credits = require('../helpers/credits');
const Notifs = require('../helpers/notifications');
const { getPolicy } = require('../helpers/notification_policy');
const { shouldEmail } = require('../helpers/preferences');
const { mailSend } = require('../helpers/mailer_send');
const { emailTemplate } = require('../helpers/mailer_template');

const router = express.Router();
function months(n){ return n*30*24*60*60*1000; }
function parseBool(x){ return String(x||'').toLowerCase()==='true'; }

function upsertCustomer({ email, naam, tel, adres={} }){
  const all = readCustomers();
  const idx = all.findIndex(c => (c.email||'').toLowerCase()===String(email||'').toLowerCase());
  if(idx === -1){
    const rec = { id: uuid(), email: email.toLowerCase(), naam: naam||'', tel: tel||'', adres };
    all.push(rec); writeCustomers(all); return rec;
  } else {
    all[idx] = { ...all[idx], naam: naam||all[idx].naam, tel: tel||all[idx].tel, adres: Object.keys(adres||{}).length? adres : all[idx].adres };
    writeCustomers(all); return all[idx];
  }
}
function upsertDog({ eigenaar_id, naam, ras, gebdatum, dierenarts }){
  const all = Dogs.read();
  let i = all.findIndex(d => d.eigenaar_id===eigenaar_id && (d.naam||'').toLowerCase()===String(naam||'').toLowerCase());
  if(i === -1){
    const rec = { id: uuid(), eigenaar_id, naam, ras: ras||'', gebdatum: gebdatum||'', dierenarts: dierenarts||'' };
    all.push(rec); Dogs.write(all); return rec;
  } else {
    all[i] = { ...all[i], ras: ras||all[i].ras, gebdatum: gebdatum||all[i].gebdatum, dierenarts: dierenarts||all[i].dierenarts };
    Dogs.write(all); return all[i];
  }
}
function findCreditByExt(ext_ref){
  if(!ext_ref) return null;
  const all = Credits.read();
  return all.find(c => c.ext_ref === ext_ref) || null;
}
function createCredit({ customer_id, dog_id, course_id, total, months_valid, ext_ref, approved }){
  const all = Credits.read();
  const validUntil = Date.now() + months(months_valid || Number(process.env.DEFAULT_VALIDITY_MONTHS || 6));
  const rec = {
    id: uuid(),
    customer_id,
    dog_id,
    course_id,
    total: Number(total||0),
    remaining: Number(total||0),
    valid_until: validUntil,
    approved: !!approved,
    ext_ref: ext_ref || null,
    created_at: new Date().toISOString()
  };
  all.push(rec); Credits.write(all);
  return rec;
}
function authOK(req){
  const expected = process.env.WEBHOOK_TOKEN;
  const got = req.get('x-webhook-token') || req.query.token || (req.body && req.body.token);
  return expected && got && got === expected;
}

router.post('/booking', express.json(), async (req,res)=>{
  try{
    if(!authOK(req)) return res.status(401).json({ error:'unauthorized' });
    const body = req.body || {};
    const ext_ref = body.ext_ref || body.reference || null;

    const existing = findCreditByExt(ext_ref);
    if(existing) return res.json({ ok:true, idempotent:true, credit_id: existing.id });

    const klantInput = body.klant || {};
    if(!klantInput.email) return res.status(400).json({ error:'email_required' });

    const klant = upsertCustomer({ email: klantInput.email, naam: klantInput.naam, tel: klantInput.tel, adres: klantInput.adres });
    const hondInput = body.hond || {};
    const hond = upsertDog({ eigenaar_id: klant.id, naam: hondInput.naam || 'Onbekende hond', ras: hondInput.ras, gebdatum: hondInput.geboortedatum, dierenarts: hondInput.dierenarts });

    const course_id = body.course_id || 'course-001';
    const credits = Number(body.credits || 0);
    const months_valid = Number(body.valid_months || process.env.DEFAULT_VALIDITY_MONTHS || 6);
    const approveNow = parseBool(process.env.APPROVE_CREDITS_IMMEDIATELY);

    const credit = createCredit({ customer_id: klant.id, dog_id: hond.id, course_id, total: credits, months_valid, ext_ref, approved: approveNow });

    const policyType = approveNow ? 'credits_approved' : 'credit_added';
    const policy = getPolicy(policyType) || { audience:'customer', delivery:['dashboard'] };
    Notifs.create({
      type: policyType,
      message: approveNow
        ? `Credits goedgekeurd voor ${hond.naam} (${course_id})`
        : `Nieuwe credits geregistreerd (wachten op goedkeuring) voor ${hond.naam} (${course_id})`,
      customer_id: klant.id,
      dog_id: hond.id,
      audience: policy.audience,
      delivery: policy.delivery,
      email_to: klant.email
    });
    if(policy.delivery.includes('email') && shouldEmail(klant.id, policyType)){
      const title = approveNow ? '✅ Jouw credits zijn goedgekeurd' : '🎟️ Credits geregistreerd';
      const bodyHtml = approveNow
        ? `<p>Dag ${klant.naam||''},</p><p>Je credits voor <strong>${hond.naam}</strong> (${course_id}) zijn nu beschikbaar.</p><p><a href="/klant-portal.html" style="background:#1976d2;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Open mijn portaal</a></p>`
        : `<p>Dag ${klant.naam||''},</p><p>We hebben je credits ontvangen voor <strong>${hond.naam}</strong> (${course_id}). Na goedkeuring kun je lessen boeken.</p>`;
      await mailSend({ to: klant.email, subject: title, text: title, html: emailTemplate({ title, bodyHtml }) });
    }
    if(!approveNow){
      Notifs.create({ type: 'warning', message: `Goedkeuring nodig: ${klant.naam||klant.email} – ${hond.naam} (${course_id}), ${credit.total} credits`, customer_id: klant.id, dog_id: hond.id, audience: 'admin', delivery: ['dashboard'] });
    }

    res.json({ ok:true, customer_id: klant.id, dog_id: hond.id, credit_id: credit.id, approved: credit.approved });
  }catch(err){
    console.error('Webhook error:', err);
    Notifs.create({ type: 'system_error', message: `Webhook fout: ${err.message}`, audience: 'admin', delivery: ['dashboard'] });
    res.status(500).json({ error:'server_error' });
  }
});

module.exports = router;
