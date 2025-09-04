// server/customers.js

const { readJSON } = require('./helpers');

const FILE = 'clients.json';

// Vind klant op ID
function findCustomer(id) {
  const list = readJSON(FILE, []);
  return list.find(c => c.id === id) || null;
}

// Vind klant op e-mail
function findCustomerByEmail(email) {
  const list = readJSON(FILE, []);
  return list.find(c => (c.email || '').toLowerCase() === email.toLowerCase()) || null;
}

module.exports = {
  findCustomer,
  findCustomerByEmail
};
