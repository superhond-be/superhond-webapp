const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function datapath(file){ return path.join(__dirname, '..', 'data', file); }
function readJSON(file, fallback=[]){ try{return JSON.parse(fs.readFileSync(datapath(file),'utf8'));}catch{return fallback;} }
function writeJSON(file, data){ fs.mkdirSync(path.dirname(datapath(file)),{recursive:true}); fs.writeFileSync(datapath(file), JSON.stringify(data,null,2)); }
function uid(){ return crypto.randomUUID(); }

// Clients
function findCustomer(id){ return readJSON('clients.json',[]).find(c=>c.id===id) || null; }
function findCustomerByEmail(email){ const e=(email||'').toLowerCase(); return readJSON('clients.json',[]).find(c=>(c.email||'').toLowerCase()===e) || null; }
// Dogs
function findDog(id){ return readJSON('dogs.json',[]).find(d=>d.id===id) || null; }
function findDogsByClient(client_id){ return readJSON('dogs.json',[]).filter(d=>d.client_id===client_id); }

// Passes
const PASS_FILE='passes.json', TYPES_FILE='pass_types.json', LEDGER_FILE='pass_ledger.json';
function pushLedger(entry){ const led=readJSON(LEDGER_FILE,[]); led.push({id:uid(),ts:Date.now(),...entry}); writeJSON(LEDGER_FILE,led); }
function findValidPass({email,type_id=null,at=Date.now()}) {
  const E=(email||'').toLowerCase();
  const list=readJSON(PASS_FILE,[]).filter(p=>p.active!==false && (p.email||'').toLowerCase()===E && p.remaining>0 && (!p.starts_at||p.starts_at<=at) && (!p.expires_at||p.expires_at>=at));
  if(!list.length) return null; return type_id? list.find(p=>p.type_id===type_id)||null : list[0];
}
function issuePass({email,type_id}){
  const t=readJSON(TYPES_FILE,[]).find(x=>x.id===type_id); if(!t) throw new Error('pass_type_not_found');
  const now=Date.now(); const pass={id:uid(),email:(email||'').toLowerCase(),type_id:t.id,remaining:Number(t.total_credits||0),starts_at:now,expires_at:now+Number(t.expiry_days||365)*86400000,active:true};
  const passes=readJSON(PASS_FILE,[]); passes.push(pass); writeJSON(PASS_FILE,passes);
  pushLedger({action:'issue',amount:pass.remaining,pass_id:pass.id,email:pass.email}); return pass;
}
function debitPass({pass_id,email,enrollment_id}){
  const E=(email||'').toLowerCase(); const passes=readJSON(PASS_FILE,[]); const i=passes.findIndex(p=>p.id===pass_id && (p.email||'').toLowerCase()===E);
  if(i===-1 || passes[i].remaining<=0) return false; passes[i].remaining-=1; writeJSON(PASS_FILE,passes);
  pushLedger({action:'debit',amount:1,pass_id,email:E,enrollment_id}); return true;
}
function refundPass({email,enrollment_id}){
  const E=(email||'').toLowerCase(); const led=readJSON(LEDGER_FILE,[]); const d=led.find(l=>l.action==='debit'&&l.email===E&&l.enrollment_id===enrollment_id); if(!d) return false;
  const passes=readJSON(PASS_FILE,[]); const i=passes.findIndex(p=>p.id===d.pass_id); if(i!==-1){ passes[i].remaining=(Number(passes[i].remaining)||0)+1; writeJSON(PASS_FILE,passes); }
  pushLedger({action:'refund',amount:1,pass_id:d.pass_id,email:E,enrollment_id}); return true;
}

module.exports = { datapath, readJSON, writeJSON, uid,
  findCustomer, findCustomerByEmail, findDog, findDogsByClient,
  PASS_FILE, TYPES_FILE, LEDGER_FILE, findValidPass, issuePass, debitPass, refundPass };
