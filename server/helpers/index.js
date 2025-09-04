// server/helpers/index.js

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ---------- Basis helpers ----------
function readJSON(file, fallback = []) {
  const p = path.join(__dirname, '..', 'data', file);
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJSON(file, data) {
  const p = path.join(__dirname, '..', 'data', file);
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

function uid() {
  return crypto.randomUUID();
}

// ---------- Customers ----------
function findCustomer(id) {
  const list = readJSON('clients.json', []);
  return list.find(c => c.id === id) || null;
}

function findCustomerByEmail(email) {
  const list = readJSON('clients.json', []);
  return list.find(c => (c.email || '').toLowerCase() === email.toLowerCase()) || null;
}

// ---------- Dogs ----------
function findDog(id) {
  const list = readJSON('dogs.json', []);
  return list.find(d => d.id === id) || null;
}

function findDogsByClient(client_id) {
  const list = readJSON('dogs.json', []);
  return list.filter(d => d.client_id === client_id);
}

// ---------- Exports ----------
module.exports = {
  readJSON,
  writeJSON,
  uid,
  findCustomer,
  findCustomerByEmail,
  findDog,
  findDogsByClient
};
