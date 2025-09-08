
const express = require('express');
const router = express.Router();
const storage = require('../server/storage');

function text(v){ return (v||'').toString(); }
function norm(s){ return text(s).trim(); }

// Structured parser (labels)
function parseStructured(raw){
  const t = text(raw);
  const rx = {
    name: /(naam|name)\s*[:\-]\s*([^\n\r]+)/i,
    email: /(e[-\s]?mail|mail)\s*[:\-]\s*([^\n\r\s]+@[^\n\r\s]+)/i,
    phone: /(tel\.?|phone|telefoon)\s*[:\-]\s*([+\d][\d\s\/\-\.]+)/i,
    type: /(type|les\s*type)\s*[:\-]\s*([^\n\r]+)/i,
    thema: /(thema|topic)\s*[:\-]\s*([^\n\r]+)/i,
    locatie: /(locatie|plaats|location)\s*[:\-]\s*([^\n\r]+)/i,
    datum: /(datum|date)\s*[:\-]\s*([0-9]{1,2}[\/\-\.\s][0-9]{1,2}[\/\-\.\s][0-9]{2,4})/i,
    tijd: /(tijd|time)\s*[:\-]\s*([0-9]{1,2}[:\.]?[0-9]{2})/i,
    lessonId: /(lesson\s*id|les\s*id|id)\s*[:\-]\s*([0-9]+)/i
  };
  function get(re){ const m=t.match(re); return m ? norm(m[2]) : ''; }
  return {
    name:get(rx.name), email:get(rx.email), phone:get(rx.phone),
    type:get(rx.type), thema:get(rx.thema), locatie:get(rx.locatie),
    datum:get(rx.datum), tijd:get(rx.tijd).replace('.',':'), lessonId:get(rx.lessonId)
  };
}

// Free-text parser (patterns)
function parseFree(raw){
  const t = text(raw);
  let out = {};
  // email
  const em = t.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  if(em) out.email = em[0];
  // phone (Belgian style)
  const ph = t.match(/(\+32\s?\d{1,2}[\s\/]?\d{2}[\s\/]?\d{2}[\s\/]?\d{2}|\b0\d{2,3}[\s\/]?\d{2}[\s\/]?\d{2}[\s\/]?\d{2}\b)/);
  if(ph) out.phone = ph[0];
  // name after "mijn naam is" or "ik heet"
  const nm = t.match(/(mijn naam is|ik heet)\s+([A-Z][^\n\r]+)/i);
  if(nm) out.name = nm[2].trim();
  // date dd/mm/yyyy or dd-mm or dd month
  const d1 = t.match(/(\d{1,2})[\/\-\s](\d{1,2})([\/\-\s](\d{2,4}))?/);
  if(d1){
    let dd=d1[1], mm=d1[2], yy=d1[4]||new Date().getFullYear();
    if(yy.length===2) yy='20'+yy;
    out.datum = `${yy}-${String(mm).padStart(2,'0')}-${String(dd).padStart(2,'0')}`;
  }
  const d2 = t.match(/(\d{1,2})\s+(januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december)/i);
  if(d2){
    const months = {januari:1,februari:2,maart:3,april:4,mei:5,juni:6,juli:7,augustus:8,september:9,oktober:10,november:11,december:12};
    const mm = months[d2[2].toLowerCase()];
    const yy = new Date().getFullYear();
    out.datum = `${yy}-${String(mm).padStart(2,'0')}-${String(d2[1]).padStart(2,'0')}`;
  }
  // time
  const tm = t.match(/(\d{1,2})[:u\.](\d{2})/i);
  if(tm) out.tijd = `${tm[1]}:${tm[2]}`;
  // locatie after "in" or "te"
  const loc = t.match(/\b(?:in|te)\s+([A-Z][a-z]+)\b/);
  if(loc) out.locatie = loc[1];
  return out;
}

router.post('/email',(req,res)=>{
  const { raw } = req.body || {};
  if(!raw) return res.status(400).json({error:'Missing raw email text'});

  let p = parseStructured(raw);
  const values = Object.values(p).filter(v=>v);
  if(values.length < 2){ // fallback if too few fields
    p = {...p, ...parseFree(raw)};
  }

  // normalize date to YYYY-MM-DD if not already
  if(p.datum && /^\d{1,2}[\/\.\-]\d{1,2}/.test(p.datum)){
    const parts = p.datum.replace(/[.\s]/g,'/').split('/').map(s=>s.trim());
    if(parts.length===3){
      let [a,b,c] = parts;
      if(a.length===4){ p.datum = `${a}-${String(b).padStart(2,'0')}-${String(c).padStart(2,'0')}`; }
      else{
        const year = c.length===2 ? ('20'+c) : c;
        p.datum = `${year}-${String(b).padStart(2,'0')}-${String(a).padStart(2,'0')}`;
      }
    }
  }

  // Upsert customer
  const CNAME = 'customers';
  const customers = storage.read(CNAME, []);
  let cust = customers.find(c => p.email && c.email && c.email.toLowerCase() === p.email.toLowerCase());
  if(cust){
    Object.assign(cust, { name: p.name || cust.name, phone: p.phone || cust.phone });
  }else{
    const id = customers.length ? Math.max(...customers.map(x=>x.id)) + 1 : 1;
    cust = { id, name: p.name || 'Onbekend', email: p.email || '', phone: p.phone || '', requires_profile: true };
    customers.push(cust);
  }
  storage.write(CNAME, customers);

  // Find lesson
  const LNAME = 'lessons';
  const lessons = storage.read(LNAME, []);
  let lesson=null;
  if(p.lessonId){
    lesson=lessons.find(l=>String(l.id)===String(p.lessonId));
  }
  if(!lesson){
    lesson=lessons.find(l=>
      (!p.datum || l.datum===p.datum) &&
      (!p.tijd || (l.tijd||'').startsWith(p.tijd)) &&
      (!p.locatie || (l.locatie||'').toLowerCase()===p.locatie.toLowerCase())
    );
  }
  if(!lesson){
    return res.status(422).json({error:'Geen passende les gevonden', parsed:p});
  }

  // Create booking
  const BNAME = 'bookings';
  const bookings = storage.read(BNAME, []);
  let existing = bookings.find(b=>b.klantId===cust.id && b.lessonId===lesson.id);
  if(!existing){
    const bid = bookings.length ? Math.max(...bookings.map(b=>b.id))+1 : 1;
    existing = { id: bid, klantId: cust.id, lessonId: lesson.id, status: 'geboekt' };
    bookings.push(existing);
    storage.write(BNAME, bookings);
  }

  res.status(201).json({ ok:true, customer:cust, lesson, booking:existing, parsed:p });
});

module.exports = router;
