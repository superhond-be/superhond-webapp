// server/routes/publicEnroll_admin.js
const express = require('express');
const adminGuard = require('../adminGuard');
const { read: readPE, write: writePE } = require('../helpers/publicEnrollments');

const router = express.Router();

// lijst voor admins
router.get('/', adminGuard, (_req,res)=> res.json(readPE()));

// annuleren
router.patch('/:id/cancel', adminGuard, (req,res)=>{
  const arr=readPE();
  const i=arr.findIndex(e=>e.id===req.params.id);
  if(i===-1) return res.status(404).json({error:'not_found'});
  arr[i].status='geannuleerd'; writePE(arr);
  res.json({ok:true});
});

module.exports = router;
