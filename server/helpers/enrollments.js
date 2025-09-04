// server/helpers/publicEnrollments.js
// Opslag van "public enrollments" (pending/actief/…)
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'public_enrollments.json');

function ensureDir() {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, '[]');
}

function read() {
  ensureDir();
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

function write(arr) {
  ensureDir();
  fs.writeFileSync(FILE, JSON.stringify(arr, null, 2));
}

function uid(prefix='enr') {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

/** Maak een pending inschrijving */
function addPending({ session_id, klant, hond }) {
  const arr = read();
  const rec = {
    id: uid('enr'),
    created_at: new Date().toISOString(),
    status: 'pending',
    session_id,
    klant: klant || {},
    hond: hond || {},
    mail_sent_at: null,
    active_since: null
  };
  arr.push(rec);
  write(arr);
  return rec;
}

/** Zet mail_sent_at op nu */
function markMailSent(id) {
  const arr = read();
  const i = arr.findIndex(e => e.id === id);
  if (i === -1) return null;
  arr[i].mail_sent_at = new Date().toISOString();
  write(arr);
  return arr[i];
}

/** Zet status actief + active_since */
function markActive(id) {
  const arr = read();
  const i = arr.findIndex(e => e.id === id);
  if (i === -1) return null;
  arr[i].status = 'actief';
  arr[i].active_since = new Date().toISOString();
  write(arr);
  return arr[i];
}

module.exports = {
  read,
  write,
  addPending,
  uid,
  markMailSent,
  markActive
};
