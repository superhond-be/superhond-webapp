const express = require('express');
const adminGuard = require('../adminGuard');
const { read: readCredits } = require('../helpers/credits');
const Dogs = require('../helpers/dogs');
const { readCustomers } = require('../helpers/customers');

const router = express.Router();

router.get('/expiring-credits', adminGuard, (_req,res)=>{
  const all = readCredits();
  const dogs = Dogs.read();
  const customers = readCustomers();

  const now = Date.now();
  const expiring = all.filter(c=>{
    if(!c.valid_until) return false;
    const daysLeft = Math.ceil((c.valid_until - now) / (1000*60*60*24));
    return c.approved && c.remaining>0 && daysLeft>0 && daysLeft<=14;
  }).map(c=>{
    const dog = dogs.find(d=>d.id===c.dog_id);
    const cust = customers.find(k=>k.id===dog?.eigenaar_id);
    const daysLeft = Math.ceil((c.valid_until - now) / (1000*60*60*24));
    return {
      dog: dog?.naam || c.dog_id,
      klant: cust?.naam || '-',
      email: cust?.email || '-',
      course_id: c.course_id,
      remaining: c.remaining,
      valid_until: c.valid_until,
      daysLeft
    };
  });

  res.json({ ok:true, expiring });
});

module.exports = router;
