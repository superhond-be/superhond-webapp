const { v4:uuid } = require('uuid');
const { load, save, path } = require('./fsdb');
const FILE = path.join(__dirname,'..','data','notifications.json');

function read(){ return load(FILE) || []; }
function write(a){ save(FILE, a); }

function create({ type, message, customer_id, dog_id, audience='customer', delivery='dashboard', email_to=null }){
  const all = read();
  const rec = {
    id: uuid(),
    type, message, customer_id, dog_id, audience, delivery, email_to,
    seen_by_customer: false,
    seen_by_admin: false,
    created_at: new Date().toISOString()
  };
  all.push(rec); write(all); return rec;
}

function forCustomer(customer_id){ return read().filter(n=> n.customer_id===customer_id && (n.audience==='customer'||n.audience==='both')); }
function forAdmin(){ return read().filter(n=> (n.audience==='admin'||n.audience==='both')); }

module.exports = { read, write, create, forCustomer, forAdmin };
