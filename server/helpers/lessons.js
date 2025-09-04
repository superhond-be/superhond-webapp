const fs = require('fs');
const path = require('path');

const TYPES_FILE = path.join(__dirname, '..', 'data', 'lesson_types.json');
const COURSES_FILE = path.join(__dirname, '..', 'data', 'courses.json');

function readJson(file) {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function uid(p='id'){ return `${p}-${Date.now()}` }

module.exports = {
  // LES-TYPES
  getTypes: () => readJson(TYPES_FILE),
  saveTypes: (arr) => writeJson(TYPES_FILE, arr),

  // COURSES
  getCourses: () => readJson(COURSES_FILE),
  saveCourses: (arr) => writeJson(COURSES_FILE, arr),

  uid
};
