// server/helpers/customers.js
// Eenvoudige JSON-opslag voor klanten en honden
const fs = require('fs');
const path = require('path');

const FILE_CUSTOMERS = path.join(__dirname, '..', 'data', 'customers.json');
const FILE_DOGS      = path.join(__dirname, '..', 'data', 'dogs.json');

function ensure(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (!fs.existsSync(file)) fs.writeFileSync(file, '[]');
}

function readCustomers() {
  ensure(FILE_CUSTOMERS);
  return JSON.parse(fs.readFileSync(FILE_CUSTOMERS, 'utf8'));
}
function writeCustomers(arr) {
  ensure(FILE_CUSTOMERS);
  fs.writeFileSync(FILE_CUSTOMERS, JSON.stringify(arr, null, 2));
}

function readDogs() {
  ensure(FILE_DOGS);
  return JSON.parse(fs.readFileSync(FILE_DOGS, 'utf8'));
}
function writeDogs(arr) {
  ensure(FILE_DOGS);
  fs.writeFileSync(FILE_DOGS, JSON.stringify(arr, null, 2));
}

function uid(prefix='id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

module.exports = {
  readCustomers,
  writeCustomers,
  readDogs,
  writeDogs,
  uid
};
