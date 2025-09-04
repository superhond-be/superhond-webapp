const express = require('express');
const { readJSON, writeJSON, uid } = require('../helpers');
const { render } = require('../tpl'); const { sendMail, logoAttachment } = require('../mailer');
const router = express.Router(); const FILE='course_memberships.json';

router.get('/', (req,res)=>{ let out=readJSON(FILE,[]); ['status','client_id','course_id'].forEach(k=>{ if(req.query[k]) out=out.filter(x=>String(x[k])===String(req.query[k])); }); res.json(out); });
router.post('/', (req,res)=>{ const list=readJSON(FILE,[]); const it={ id:uid(), course_id:req.body.course_id, client_id:req.body.client_id, dog_id:req.body.dog_id, status:'pending', source:req.body.source||null, created_at:Date.now(), approved_at:null, notes:req.body.notes||'' }; list.push(it); writeJSON(FILE,list); res.status(201).json(it); });

router.post('/:id/approve', async (req,res)=>{
  const list=readJSON(FILE,[]); const i=list.findIndex(x=>x.id===req.params.id); if(i===-1) return res.status(404).json({error:'not_found'});
  list[i].status='approved'; list[i].approved_at=Date.now(); writeJSON(FILE,list);

  try{
    const clients=readJSON('clients.json',[]); const courses=readJSON('courses.json',[]);
    const cl=clients.find(c=>c.id===list[i].client_id); const co=courses.find(c=>c.id===list[i].course_id);
    if(cl && co){
      const payload={ naam:cl.naam, lesNaam:co.naam, inschrijf_url:`${process.env.PUBLIC_BASE_URL||'http://localhost:3000'}/inschrijven.html?course=${co.id}` };
      const html=render('membership-approved.html',payload), text=render('membership-approved.txt',payload);
      await sendMail({ to:cl.email, subject:`Inschrijving goedgekeurd: ${co.naam}`, text, html, attachments:[logoAttachment()].filter(Boolean) });
    }
  }catch(e){ console.warn('MAIL failed', e.message); }

  res.json(list[i]);
});
router.post('/:id/reject', (req,res)=>{ const list=readJSON(FILE,[]); const i=list.findIndex(x=>x.id===req.params.id); if(i===-1) return res.status(404).json({error:'not_found'}); list[i].status='rejected'; writeJSON(FILE,list); res.json(list[i]); });

module.exports = router;
