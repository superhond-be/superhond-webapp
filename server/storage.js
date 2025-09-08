const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

function filePath(name){ return path.join(DATA_DIR, name + '.json'); }

function read(name, fallback){
  const p = filePath(name);
  try {
    if(!fs.existsSync(p)) return fallback ?? [];
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw || 'null') ?? fallback ?? [];
  } catch(e){
    console.error('[storage] read failed:', name, e.message);
    return fallback ?? [];
  }
}

function write(name, value){
  const p = filePath(name);
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(p, JSON.stringify(value, null, 2), 'utf8');
  return value;
}

module.exports = { read, write };
