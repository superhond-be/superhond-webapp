const { load, save, path } = require('./fsdb');
const FILE = path.join(__dirname,'..','data','preferences.json');
function read(){ return load(FILE) || []; }
function write(a){ save(FILE, a); }
function getForCustomer(customer_id){ const all=read(); return all.find(p=>p.customer_id===customer_id) || { customer_id, email_prefs:{} }; }
function setForCustomer(customer_id, email_prefs={}){ const all=read(); const i=all.findIndex(x=>x.customer_id===customer_id); const rec={ customer_id, email_prefs }; if(i===-1) all.push(rec); else all[i]=rec; write(all); return rec; }
function shouldEmail(customer_id,type){ const pref=getForCustomer(customer_id); const v=pref.email_prefs?.[type]; return (v===undefined)?true:!!v; }
module.exports = { read, write, getForCustomer, setForCustomer, shouldEmail };
