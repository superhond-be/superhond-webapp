const express = require('express');
const customerGuard = require('../customerGuard');
const { readCustomers } = require('../helpers/customers');
const { getForCustomer, setForCustomer } = require('../helpers/preferences');

const router = express.Router();

function getCustomerByEmail(email){
  const arr = readCustomers();
  return arr.find(c => (c.email||'').toLowerCase()===String(email||'').toLowerCase()) || null;
}

router.get('/', customerGuard, (req,res)=>{
  const c = getCustomerByEmail(req.customer.email);
  if(!c) return res.json({ ok:true, email_prefs:{} });
  const pref = getForCustomer(c.id);
  res.json({ ok:true, email_prefs: pref.email_prefs || {} });
});

router.patch('/', customerGuard, (req,res)=>{
  const c = getCustomerByEmail(req.customer.email);
  if(!c) return res.status(404).json({error:'customer_not_found'});
  const { email_prefs={} } = req.body || {};
  const saved = setForCustomer(c.id, email_prefs);
  res.json({ ok:true, email_prefs: saved.email_prefs });
});

module.exports = router;
