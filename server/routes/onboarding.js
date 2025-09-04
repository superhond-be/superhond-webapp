// server/routes/onboarding.js
const express = require('express');
const nodemailer = require('nodemailer');

const { createToken, consumeToken } = require('../helpers/onboarding');
const { read: readEnroll, write: writeEnroll } = require('../helpers/publicEnrollments');
const { readCustomers, writeCustomers, readDogs, writeDogs, uid } = require('../helpers/customers');

const router = express.Router();

const PUBLIC = process.env.PUBLIC_BASE_URL || 'https://superhond-webapp.onrender.com';
const LOGO_LIGHT = `${PUBLIC}/brand/logo.png`;
const LOGO_DARK  = `${PUBLIC}/brand/logo_dark.png`;

function mailer() {
  if (!process.env.SMTP_HOST) {
    return { sendMail: async (opts) => { console.log('DEV MAIL', opts); return true; } };
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
  });
}

/**
 * POST /api/onboarding/start
 * Body: { email, enrollment_id, naam? }
 * - maakt eenmalige token (24u) en stuurt mail met onboarding-link
 */
router.post('/start', async (req, res) => {
  try {
    const { email, enrollment_id, naam = '' } = req.body || {};
    if (!email || !enrollment_id) return res.status(400).json({ error: 'missing_fields' });

    // bestaat enrollment?
    const enrolls = readEnroll();
    const found = enrolls.find(e => e.id === enrollment_id);
    if (!found) return res.status(404).json({ error: 'enrollment_not_found' });

    const token = createToken({ email, enrollment_id }, 60 * 24); // 24 uur
    const link = `${PUBLIC}/onboarding.html?token=${token}`;

    const subject = 'Voltooi je inschrijving bij Superhond';

    const html = `
      <div style="font-family:system-ui,Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #eee;border-radius:8px;background:#fff;color:#222">
        <style>
          @media (prefers-color-scheme: dark) {
            body, div { background:#1e1e1e !important; color:#f4f4f4 !important; }
            a.sh-btn { background:#f4a000 !important; color:#222 !important; }
            .sh-muted { color:#bbb !important; }
          }
        </style>

        <div style="text-align:center;margin-bottom:20px">
          <picture>
            <source srcset="${LOGO_DARK}" media="(prefers-color-scheme: dark)">
            <img src="${LOGO_LIGHT}" alt="Superhond" style="max-height:60px">
          </picture>
        </div>

        <h2 style="color:#f4a000;margin:0 0 8px">Welkom bij Superhond!</h2>
        <p style="margin:0 0 10px">Beste ${naam || 'klant'},</p>
        <p style="margin:0 0 10px">
          Bedankt voor je inschrijving. Klik op de knop hieronder om je gegevens aan te vullen en je deelname te bevestigen.
        </p>

        <p style="text-align:center;margin:24px 0">
          <a href="${link}" class="sh-btn" style="background:#f4a000;color:#222;text-decoration:none;padding:14px 22px;border-radius:6px;font-weight:600;display:inline-block">
            Gegevens aanvullen
          </a>
        </p>

        <p class="sh-muted" style="font-size:12px;margin:0 0 10px;color:#666">
          Werkt de knop niet? Kopieer dan deze link in je browser:
        </p>
        <p style="font-size:12px;word-break:break-all;margin:0 0 16px">${link}</p>

        <hr style="margin:16px 0;border:0;border-top:1px solid #eee">
        <p class="sh-muted" style="font-size:12px;margin:0;color:#666">
          Deze link is 24 uur geldig. Met vriendelijke groeten,<br>Team Superhond
        </p>
      </div>
    `;

    const text = `Welkom bij Superhond!

Beste ${naam || 'klant'},

Bedankt voor je inschrijving. Voltooi je gegevens via deze link (24 uur geldig):
${link}

Met vriendelijke groeten,
Team Superhond`;

    const transp = mailer();
    const from = process.env.EMAIL_FROM || 'no-reply@superhond.be';
    await transp.sendMail({ to: email, from, subject, html, text });

    res.json({ ok: true, sent: true, link }); // link blijft handig voor debug
  } catch (e) {
    console.error('onboarding/start error', e);
    res.status(500).json({ error: 'mail_failed' });
  }
});

/**
 * POST /api/onboarding/complete
 * Body: {
 *   token,
 *   klant:{naam,tel?},
 *   hond:{naam,ras?,gebdatum?},
 *   adres:{straat?,bus?,postcode?,gemeente?},
 *   dierenarts?
 * }
 * - maakt/werkt klant + hond en zet enrollment 'actief'
 */
router.post('/complete', (req, res) => {
  const { token, klant, hond, dierenarts, adres } = req.body || {};
  if (!token || !klant || !hond) return res.status(400).json({ error: 'missing_fields' });

  const payload = consumeToken(token);
  if (!payload) return res.status(400).json({ error: 'invalid_or_expired_token' });

  // klantenbestand bijwerken (op email)
  const customers = readCustomers();
  let c = customers.find(x => (x.email || '').toLowerCase() === (payload.email || '').toLowerCase());
  if (!c) {
    c = { id: uid('cust'), naam: klant.naam, email: payload.email, tel: klant.tel || '', adres: adres || {} };
    customers.push(c);
  } else {
    c.naam = klant.naam || c.naam;
    c.tel = klant.tel || c.tel;
    c.adres = adres || c.adres || {};
  }
  writeCustomers(customers);

  // hond toevoegen/koppelen
  const dogs = readDogs();
  const d = { id: uid('dog'), eigenaar_id: c.id, naam: hond.naam, ras: hond.ras || '', gebdatum: hond.gebdatum || '', dierenarts: dierenarts || '' };
  dogs.push(d);
  writeDogs(dogs);

  // enrollment updaten → actief + koppelen aan klant/hond
  const enrolls = readEnroll();
  const i = enrolls.findIndex(e => e.id === payload.enrollment_id);
  if (i !== -1) {
    enrolls[i].status = 'actief';
    enrolls[i].klant_id = c.id;
    enrolls[i].hond_id = d.id;
    writeEnroll(enrolls);
  }

  res.json({ ok: true, klant: c, hond: d, enrollment_id: payload.enrollment_id });
});

module.exports = router;
