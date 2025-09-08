const express = require('express');
const router = express.Router();
const storage = require('../server/storage');

const customers = require('./customers');
const lessons = require('./lessons');

const bookingsName = 'bookings';
const bookingsAll = () => storage.read(bookingsName, []);
const bookingsSave = (list) => storage.write(bookingsName, list);

// Map incoming payment/registration payload to our model
function mapPayload(body){
  // Expected example:
  // { externalId, customer:{ name, email, phone }, lessonId, amount, paidAt }
  const { externalId, customer, lessonId, amount, paidAt } = body || {};
  return {
    externalId,
    customer: customer || {},
    lessonId: Number(lessonId),
    amount: Number(amount || 0),
    paidAt: paidAt || new Date().toISOString(),
  };
}

router.post('/payment', (req,res)=>{
  try{
    const payload = mapPayload(req.body);
    if(!payload.externalId || !payload.lessonId || !payload.customer?.email){
      return res.status(400).json({ error: 'externalId, lessonId en customer.email zijn vereist' });
    }
    // upsert customer
    const app = require('express')(); // temporary to reuse customers router logic? we'll inline simpler
    // We'll manual upsert:
    const NAME = 'customers';
    const allCustomers = () => storage.read(NAME, []);
    const saveCustomers = (list) => storage.write(NAME, list);
    let list = allCustomers();
    let cust = list.find(c => c.externalId===payload.externalId || c.email===payload.customer.email);
    if(cust){
      Object.assign(cust, { ...payload.customer, externalId: payload.externalId, requires_profile: true });
    }else{
      const id = list.length ? Math.max(...list.map(x=>x.id))+1 : 1;
      cust = { id, externalId: payload.externalId, requires_profile: true, ...payload.customer };
      list.push(cust);
    }
    saveCustomers(list);

    // create booking (avoid duplicates)
    const blist = bookingsAll();
    const exists = blist.find(b => b.lessonId===payload.lessonId && b.klantId===cust.id);
    if(!exists){
      const bid = blist.length ? Math.max(...blist.map(b=>b.id))+1 : 1;
      blist.push({ id: bid, klantId: cust.id, lessonId: payload.lessonId, status: 'betaald' });
      bookingsSave(blist);
    }
    // return onboarding link suggestion
    const onboarding = `/onboarding.html?customerId=${cust.id}`;
    res.status(201).json({ ok:true, customer: cust, bookingCreated: !exists, onboarding });
  }catch(e){
    console.error('import/payment error', e);
    res.status(500).json({ error: 'import failed' });
  }
});

module.exports = router;
