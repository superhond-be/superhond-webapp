const express = require('express');
const customerGuard = require('../customerGuard');
const { read: readEnrolls } = require('../helpers/publicEnrollments');
const { read: readSessions } = require('../helpers/sessions');
const router = express.Router();

function icsEscape(s=''){ return String(s).replace(/([,;])/g,'\\$1').replace(/\n/g,'\\n'); }
const fmt = (d)=> new Date(d).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');

router.get('/sessions/:id/ical', customerGuard, (req,res)=>{
  const enrolls = readEnrolls();
  const sessions = readSessions();
  const enr = enrolls.find(e => e.id===req.params.id && e.klant?.email===req.customer.email);
  if(!enr) return res.status(404).send('Not found');
  const s = sessions.find(x=>x.id===enr.session_id);
  if(!s) return res.status(404).send('No session');
  const start = new Date(s.start_iso);
  const end   = s.end_iso ? new Date(s.end_iso) : new Date(start.getTime() + (Number(s.duration_min||60)*60000));
  const title = `Superhond les — ${s.course_id || 'cursus'}`;
  const loc   = s.locatie?.naam ? `${s.locatie.naam} ${s.locatie.adres||''}` : 'Superhond';
  const desc  = `Inschrijving bevestigd.`;

  const ics = [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Superhond//NL','CALSCALE:GREGORIAN','METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${enr.id}@superhond`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${icsEscape(title)}`,
    `LOCATION:${icsEscape(loc)}`,
    `DESCRIPTION:${icsEscape(desc)}`,
    'END:VEVENT','END:VCALENDAR'
  ].join('\r\n');

  res.setHeader('Content-Type','text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="superhond_${enr.id}.ics"`);
  res.send(ics);
});

module.exports = router;
