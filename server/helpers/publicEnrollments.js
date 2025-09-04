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

/**
 * Maak een pending inschrijving (bv. vanuit public POST /api/public/enroll)
 * shape:
 *  {
 *    id, created_at, status:'pending',
 *    session_id, klant:{naam,email,tel}, hond:{naam,ras?,gebdatum?}
 *  }
 */
function addPending({ session_id, klant, hond }) {
  const arr = read();
  const rec = {
    id: uid('enr'),
    created_at: new Date().toISOString(),
    status: 'pending',
    session_id,
    klant: klant || {},
    hond: hond || {}
  };
  arr.push(rec);
  write(arr);
  return rec;
}

module.exports = {
  read,
  write,
  addPending,
  uid
};
