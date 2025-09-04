const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'enrollments.json');

function read() {
  if (!fs.existsSync(FILE)) return [];
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}
function write(arr) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(arr, null, 2));
}
const uid = (p='enr') => `${p}-${Date.now()}`;

module.exports = { read, write, uid };
