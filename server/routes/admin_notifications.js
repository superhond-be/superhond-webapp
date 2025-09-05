const express = require('express');
const adminGuard = require('../adminGuard');
const Notifs = require('../helpers/notifications');
const router = express.Router();

router.get('/', adminGuard, (_req,res)=>{
  const items = Notifs.forAdmin();
  res.json({ ok:true, items });
});

router.post('/:id/seen', adminGuard, (req,res)=>{
  const all = Notifs.read();
  const i = all.findIndex(n=> n.id===req.params.id);
  if(i===-1) return res.status(404).json({error:'not_found'});
  all[i].seen_by_admin = true; Notifs.write(all);
  res.json({ ok:true });
});

module.exports = router;
