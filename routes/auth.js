const express = require('express');
const jwt = require('jsonwebtoken');
const storage = require('../server/storage');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'superhond-dev-secret';
const TOKEN_TTL = '12h';

function sign(payload){
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const admins = storage.read('admins', []);
  const admin = admins.find(a => a.email === email && a.password === password);
  if(!admin) return res.status(401).json({ error: 'Ongeldige inlog' });
  const token = sign({ sub: `admin:${admin.id}`, role: 'admin', email: admin.email, name: admin.name });
  res.json({ token, user: { id: admin.id, name: admin.name, email: admin.email }, role: 'admin' });
});

// eenvoudige klant-login op e-mail (magic link simulatie)
router.post('/login-customer', (req, res) => {
  const { email } = req.body || {};
  if(!email) return res.status(400).json({ error: 'email vereist' });
  const customers = storage.read('customers', []);
  let customer = customers.find(c => c.email && c.email.toLowerCase() === String(email).toLowerCase());
  if(!customer){
    const id = customers.length ? Math.max(...customers.map(x=>x.id)) + 1 : 1;
    customer = { id, name: email.split('@')[0], email, requires_profile: true };
    customers.push(customer);
    storage.write('customers', customers);
  }
  const token = sign({ sub: `customer:${customer.id}`, role: 'customer', email: customer.email, customerId: customer.id });
  res.json({ token, customer: { id: customer.id, name: customer.name, email: customer.email }, role: 'customer' });
});

module.exports = router;
