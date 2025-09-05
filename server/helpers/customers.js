const { load, save, path } = require('./fsdb');
const FILE = path.join(__dirname,'..','data','customers.json');
function readCustomers(){ return load(FILE) || []; }
function writeCustomers(a){ save(FILE, a); }
function findByEmail(email){ return readCustomers().find(c => (c.email||'').toLowerCase()===String(email||'').toLowerCase()); }
module.exports = { readCustomers, writeCustomers, findByEmail };
