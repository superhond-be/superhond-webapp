// server/helpers/admins.js
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, '../../data/admins.json');

function ensureDbFile() {
  if (!fs.existsSync(path.dirname(DB_FILE))) {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [] }, null, 2));
  }
}

function readDb() {
  ensureDbFile();
  const raw = fs.readFileSync(DB_FILE, 'utf8');
  return JSON.parse(raw || '{"users":[]}');
}

function writeDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

async function listAdmins() {
  const db = readDb();
  // geef geen wachtwoorden terug
  return db.users.map(({ password, ...rest }) => rest);
}

async function createAdmin({ name, email, password, role }) {
  const db = readDb();
  const emailNorm = String(email).trim().toLowerCase();
  if (db.users.find(u => u.email.toLowerCase() === emailNorm)) {
    const err = new Error('email_exists');
    err.code = 'email_exists';
    throw err;
  }
  const hash = await bcrypt.hash(password, 10);
  const user = {
    id: 'adm_' + Math.random().toString(36).slice(2, 10),
    name: name?.trim() || '',
    email: emailNorm,
    role: role || 'admin',
    createdAt: new Date().toISOString(),
    password: hash
  };
  db.users.push(user);
  writeDb(db);
  // zonder wachtwoord teruggeven
  const { password: _pw, ...safe } = user;
  return safe;
}

module.exports = {
  listAdmins,
  createAdmin,
};
