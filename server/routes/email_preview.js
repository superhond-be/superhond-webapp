const express = require('express');
const adminGuard = require('../adminGuard');
const { emailTemplate } = require('../helpers/mailer_template');

const router = express.Router();

router.get('/', adminGuard, (req,res)=>{
  const type = req.query.type || 'credits_approved';
  const naam = req.query.naam || 'Paul';
  const hondNaam = req.query.hond || 'Fido';
  const cursusNaam = req.query.cursus || 'Puppycursus';
  const datum = req.query.datum || new Date().toLocaleDateString();
  const link = req.query.link || '/klant-portal.html';

  let html='';
  if(type==='onboarding_mail'){
    html=emailTemplate({ title:'Welkom bij Superhond!', bodyHtml:`<p>Dag ${naam},</p><p>Je bent aangemeld voor <strong>${cursusNaam}</strong>.</p><p><a href="${link}" style="background:#1976d2;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Start onboarding</a></p>` });
  } else if(type==='credits_approved'){
    html=emailTemplate({ title:'✅ Jouw credits zijn goedgekeurd', bodyHtml:`<p>Dag ${naam},</p><p>Je credits voor <strong>${cursusNaam}</strong> zijn nu beschikbaar.</p><p><a href="${link}" style="background:#1976d2;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Ga naar mijn portaal</a></p>` });
  } else if(type==='lesson_signup'){
    html=emailTemplate({ title:'📅 Je lesaanmelding is bevestigd', bodyHtml:`<p>Dag ${naam},</p><p>We hebben je ingeschreven voor <strong>${datum}</strong> (${cursusNaam}) met ${hondNaam}.</p>` });
  } else if(type==='lesson_cancelled'){
    html=emailTemplate({ title:'❌ Les geannuleerd', bodyHtml:`<p>Dag ${naam},</p><p>De les op <strong>${datum}</strong> (${cursusNaam}) is geannuleerd.</p><p>Je credits blijven geldig; kies gerust een andere datum.</p>` });
  } else if(type==='dog_birthday'){
    html=emailTemplate({ title:`🎂 Gefeliciteerd met ${hondNaam}!`, bodyHtml:`<p>Dag ${naam},</p><p>Vandaag is <strong>${hondNaam}</strong> jarig! 🎉</p><p>Een poot van het Superhond-team!</p>` });
  } else {
    html=emailTemplate({ title:'Superhond', bodyHtml:`<p>Dag ${naam},</p><p>Testbericht.</p>` });
  }

  res.send(html);
});

module.exports = router;
