// server/models/adminStore.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const FILE = path.join(DATA_DIR, 'admin-users.json');

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, JSON.stringify({ users: [] }, null, 2));
}

function readAll() {
  ensureFile();
  const raw = fs.readFileSync(FILE, 'utf8');
  const obj = JSON.parse(raw || '{"users":[]}');
  return Array.isArray(obj.users) ? obj.users : [];
}

function writeAll(users) {
  ensureFile();
  fs.writeFileSync(FILE, JSON.stringify({ users }, null, 2));
}

function id() {
  // eenvoudige unieke id
  return 'adm_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function hashPassword(plain) {
  // veilig zonder externe lib
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(plain, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`; // opbouw: salt:hash
}

function create({ name, email, password, role }) {
  const users = readAll();

  if (users.find(u => u.email.toLowerCase() === String(email).toLowerCase())) {
    const err = new Error('E-mail bestaat al.');
    err.code = 'DUPLICATE';
    throw err;
  }

  const user = {
    id: id(),
    name: name?.trim() || '',
    email: String(email).trim(),
    role: role === 'superadmin' ? 'superadmin' : 'admin',
    passwordHash: hashPassword(String(password)),
    createdAt: new Date().toISOString()
  };

  users.push(user);
  writeAll(users);
  // verberg hash naar buiten
  const { passwordHash, ...safe } = user;
  return safe;
}

module.exports = {
  getAll: () => readAll().map(({ passwordHash, ...u }) => u),
  create,
  _unsafe_readAll: readAll, // handig voor status (enkel intern gebruikt)
};
