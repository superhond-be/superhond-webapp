const express = require('express');
const { createToken } = require('../helpers/onboarding');
const nodemailer = require('nodemailer');

const { read: readEnroll } = require('../helpers/publicEnrollments');

const router = express.Router();

function mailer() {
  if (!process.env.SMTP_HOST) {
    return { sendMail: async (opts)=> console.log('DEV MAIL', opts) };
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

// START: maakt token + stuurt mail
router.post('/start', (req,res)=>{
  const { email, enrollment_id, naam='' } = req.body||{};
  if(!email || !enrollment_id) return res.status(400).json({error:'missing_fields'});

  const t = createToken({ email, enrollment_id }, 60*24);
  const publicBase = process.env.PUBLIC_BASE_URL || '';
  const link = `${publicBase}/onboarding.html?token=${t}`;

  const subject = 'Voltooi je inschrijving bij Superhond';
  const html = `
    <p>Beste ${naam||'klant'},</p>
    <p>Bedankt voor je inschrijving! Klik op de onderstaande link om je gegevens aan te vullen en je deelname te bevestigen:</p>
    <p><a href="${link}" style="font-size:18px">${link}</a></p>
    <p>Deze link is 24 uur geldig.</p>
  `;

  const from = process.env.EMAIL_FROM || 'no-reply@superhond.be';
  const transp = mailer();

  transp.sendMail({ to: email, from, subject, html })
    .then(()=> res.json({ ok:true, sent:true, link }))
    .catch(err=>{
      console.error('MAIL error',err);
      res.status(500).json({error:'mail_failed', link});
    });
});

module.exports = router;
