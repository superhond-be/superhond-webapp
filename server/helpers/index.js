// server/helpers/index.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ---------- Basis ----------
function datapath(file) { return path.join(__dirname, '..', 'data', file); }

function readJSON(file, fallback = []) {
  const p = datapath(file);
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch { return fallback; }
}
function writeJSON(file, data) {
  const p = datapath(file);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}
function uid() { return crypto.randomUUID(); }

// ---------- Clients ----------
function findCustomer(id) {
  const list = readJSON('clients.json', []);
  return list.find(c => c.id === id) || null;
}
function findCustomerByEmail(email) {
  const list = readJSON('clients.json', []);
  const e = (email || '').toLowerCase();
  return list.find(c => (c.email || '').toLowerCase() === e) || null;
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

// ---------- Passes / Ledger ----------
const PASS_FILE   = 'passes.json';
const TYPES_FILE  = 'pass_types.json';
const LEDGER_FILE = 'pass_ledger.json';

// Zoek geldige strippenkaart voor e-mailadres (optioneel gefilterd op type)
function findValidPass({ email, type_id = null, at = Date.now() }) {
  const E = (email || '').toLowerCase();
  const passes = readJSON(PASS_FILE, []);
  const valid = passes.filter(p =>
    p.active !== false &&
    (p.email || '').toLowerCase() === E &&
    Number(p.remaining) > 0 &&
    (!p.starts_at || p.starts_at <= at) &&
    (!p.expires_at || p.expires_at >= at)
  );
  if (!valid.length) return null;
  if (type_id) return valid.find(p => p.type_id === type_id) || null;
  return valid[0];
}

// Schrijf een ledger-entry
function pushLedger(entry) {
  const led = readJSON(LEDGER_FILE, []);
  led.push({ id: uid(), ts: Date.now(), ...entry });
  writeJSON(LEDGER_FILE, led);
}

// Eén beurt afboeken
function debitPass({ pass_id, email, enrollment_id }) {
  const E = (email || '').toLowerCase();
  const passes = readJSON(PASS_FILE, []);
  const i = passes.findIndex(p => p.id === pass_id && (p.email || '').toLowerCase() === E);
  if (i === -1 || passes[i].remaining <= 0) return false;
  passes[i].remaining -= 1;
  writeJSON(PASS_FILE, passes);
  pushLedger({ action: 'debit', amount: 1, pass_id, email: E, enrollment_id });
  return true;
}

// Terugboeking als een inschrijving wordt geannuleerd/verwijderd
function refundPass({ email, enrollment_id }) {
  const E = (email || '').toLowerCase();
  const led = readJSON(LEDGER_FILE, []);
  // Vind de eerste (enige) debit voor deze inschrijving
  const debit = led.find(l => l.action === 'debit' && l.email === E && l.enrollment_id === enrollment_id);
  if (!debit) return false;

  const passes = readJSON(PASS_FILE, []);
  const i = passes.findIndex(p => p.id === debit.pass_id);
  if (i !== -1) {
    passes[i].remaining = Number(passes[i].remaining || 0) + 1;
    writeJSON(PASS_FILE, passes);
  }
  pushLedger({ action: 'refund', amount: 1, pass_id: debit.pass_id, email: E, enrollment_id });
  return true;
}

// Nieuwe strippenkaart uitgeven op basis van pass type (handig bij pakketten)
function issuePass({ email, type_id }) {
  const types = readJSON(TYPES_FILE, []);
  const t = types.find(x => x.id === type_id);
  if (!t) throw new Error('pass_type_not_found');

  const now = Date.now();
  const pass = {
    id: uid(),
    email: (email || '').toLowerCase(),
    type_id: t.id,
    remaining: Number(t.total_credits || 0),
    starts_at: now,
    expires_at: now + Number((t.expiry_days || 365)) * 86400000,
    active: true
  };
  const passes = readJSON(PASS_FILE, []);
  passes.push(pass); writeJSON(PASS_FILE, passes);
  pushLedger({ action: 'issue', amount: pass.remaining, pass_id: pass.id, email: pass.email, enrollment_id: null });
  return pass;
}

module.exports = {
  // basis
  readJSON, writeJSON, uid,
  // customers/dogs
  findCustomer, findCustomerByEmail, findDog, findDogsByClient,
  // passes
  findValidPass, debitPass, refundPass, issuePass,
  // bestanden (soms nuttig)
  PASS_FILE, TYPES_FILE, LEDGER_FILE
};
