// server/helpers.js
const fs = require('fs');
const path = require('path');

// Pad naar je data-map
function file(p) {
  return path.join(__dirname, './data', p);
}

// JSON lezen
function readJSON(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file(p), 'utf8'));
  } catch {
    return fallback;
  }
}

// JSON schrijven
function writeJSON(p, data) {
  fs.writeFileSync(file(p), JSON.stringify(data, null, 2));
}

// Eenvoudig uniek ID
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

module.exports = { readJSON, writeJSON, uid };
