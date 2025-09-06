// server/helpers/adminStore.js
const fs = require('fs');
const path = require('path');
const DB = path.join(__dirname, '../../data/admins.json');

function readAll() {
  try {
    return JSON.parse(fs.readFileSync(DB, 'utf8'));
  } catch {
    return [];
  }
}
function writeAll(list) {
  fs.mkdirSync(path.dirname(DB), { recursive: true });
  fs.writeFileSync(DB, JSON.stringify(list, null, 2), 'utf8');
}

async function getAllAdmins() {
  return readAll();
}

async function getAdminByEmail(email) {
  const all = readAll();
  return all.find(a => (a.email || '').toLowerCase() === (email || '').toLowerCase()) || null;
}

async function createAdmin({ id, name, email, role, passwordHash }) {
  const all = readAll();
  if (all.find(a => a.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('email_exists');
  }
  const createdAt = new Date().toISOString();
  const user = { id, name, email, role, passwordHash, createdAt };
  all.push(user);
  writeAll(all);
  return user;
}

module.exports = {
  getAllAdmins,
  getAdminByEmail,
  createAdmin,
};
