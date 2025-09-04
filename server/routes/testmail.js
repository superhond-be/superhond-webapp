const express = require('express');
const { render } = require('../tpl');
const { sendMail, logoAttachment } = require('../mailer');
const router = express.Router();

// POST /api/test/mail
// body: { to: "jouw@email.be", type: "confirm|waitlist|cancel|promoted|session-cancelled" }
router.post('/mail', async (req,res) => {
  const { to, type } = req.body;
  if (!to || !type) return res.status(400).json({ error: 'to en type zijn verplicht' });

  const payload = {
    naam: "Testklant",
    hond: "Rex",
    lesNaam: "Puppy Start",
    datum: "2025-09-15",
    tijd: "19:00",
    locatie: "Terrein Retie",
    trainer: "Sofie Thijs",
    manage_url: "#"
  };

  let html, text, subject;
  switch(type){
    case 'confirm':
      html = render('confirm.html', payload);
      text = render('confirm.txt', payload);
      subject = "Je inschrijving is bevestigd";
      break;
    case 'waitlist':
      html = render('waitlist.html', payload);
      text = render('waitlist.txt', payload);
      subject = "Je staat op de wachtlijst";
      break;
    case 'cancel':
      html = render('cancel.html', payload);
      text = render('cancel.txt', payload);
      subject = "Je afmelding is bevestigd";
      break;
    case 'promoted':
      html = render('promoted.html', payload);
      text = render('promoted.txt', payload);
      subject = "Je bent doorgeschoven naar bevestigd";
      break;
    case 'session-cancelled':
      html = render('session-cancelled.html', payload);
      text = render('session-cancelled.txt', payload);
      subject = "De sessie is geannuleerd";
      break;
    default:
      return res.status(400).json({ error: 'onbekend type' });
  }

  try {
    await sendMail({ to, subject, text, html, attachments:[logoAttachment()].filter(Boolean) });
    res.json({ ok:true, to, type });
  } catch(e){
    console.error('MAIL send failed', e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
