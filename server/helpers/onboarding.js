// server/helpers/onboarding.js
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const SECRET = process.env.ONBOARDING_SECRET || 'dev_onboarding_secret';
const FILE = path.join(__dirname, '..', 'data', 'onboarding_tokens.json');

// lees/schrijf bestand
function read() {
  if (!fs.existsSync(FILE)) return [];
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}
function write(arr) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(arr, null, 2));
}

// uniek id
function uid(prefix='tok') {
  return prefix+'-'+Math.random().toString(36).slice(2,10)+Date.now().toString(36);
}

// token maken (met TTL in minuten)
function createToken(payload, ttlMinutes=60) {
  const id = uid('onb');
  const exp = Date.now() + ttlMinutes*60*1000;
  const token = jwt.sign({ ...payload, id }, SECRET, { expiresIn: ttlMinutes*60 });
  const arr = read();
  arr.push({ id, exp });
  write(arr);
  return token;
}

// token consumeren (eenmalig gebruiken)
function consumeToken(token) {
  try {
    const payload = jwt.verify(token, SECRET);
    const arr = read();
    const i = arr.findIndex(r => r.id === payload.id);
    if (i === -1) return null;
    const rec = arr[i];
    if (rec.exp < Date.now()) return null;
    arr.splice(i,1); // verbruikt
    write(arr);
    return payload;
  } catch(e) {
    return null;
  }
}

module.exports = { createToken, consumeToken };
