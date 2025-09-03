// server/routes/email.test.js
const express = require('express');
const { render } = require('../tpl');
const { sendMail, logoAttachment } = require('../mailer');
const router = express.Router();

function commonData() {
  return {
    naam: 'Sofie',
    lesNaam: 'Puppystart',
    datum: '3 september 2025',
    tijd: '19:00',
    locatie: 'Terrein Retie',
    trainer: 'Sofie Thijs',
    manage_url: 'https://superhond.be/mijn-inschrijving'
  };
}

// POST /api/email-test/confirm
router.post('/confirm', async (req, res) => {
  const data = commonData();
  const html = render('confirm.html', data);
  const text = render('confirm.txt', data);
  await sendMail({
    to: req.body.to || 'test@example.com',
    subject: 'Je inschrijving is bevestigd',
    text, html,
    attachments: [logoAttachment()].filter(Boolean)
  });
  res.json({ ok: true });
});

// POST /api/email-test/waitlist
router.post('/waitlist', async (req, res) => {
  const data = commonData();
  const html = render('waitlist.html', data);
  const text = render('waitlist.txt', data);
  await sendMail({
    to: req.body.to || 'test@example.com',
    subject: 'Je staat op de wachtlijst',
    text, html,
    attachments: [logoAttachment()].filter(Boolean)
  });
  res.json({ ok: true });
});

// POST /api/email-test/promoted
router.post('/promoted', async (req, res) => {
  const data = commonData();
  const html = render('promoted.html', data);
  const text = render('promoted.txt', data);
  await sendMail({
    to: req.body.to || 'test@example.com',
    subject: 'Je bent doorgeschoven naar bevestigd',
    text, html,
    attachments: [logoAttachment()].filter(Boolean)
  });
  res.json({ ok: true });
});

// POST /api/email-test/cancel
router.post('/cancel', async (req, res) => {
  const data = commonData();
  const html = render('cancel.html', data);
  const text = render('cancel.txt', data);
  await sendMail({
    to: req.body.to || 'test@example.com',
    subject: 'Je afmelding is bevestigd',
    text, html,
    attachments: [logoAttachment()].filter(Boolean)
  });
  res.json({ ok: true });
});

// POST /api/email-test/session-cancelled
router.post('/session-cancelled', async (req, res) => {
  const data = commonData();
  const html = render('session-cancelled.html', data);
  const text = render('session-cancelled.txt', data);
  await sendMail({
    to: req.body.to || 'test@example.com',
    subject: 'Sessie geannuleerd',
    text, html,
    attachments: [logoAttachment()].filter(Boolean)
  });
  res.json({ ok: true });
});

module.exports = router;
