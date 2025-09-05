const fs = require('fs');
const path = require('path');
function load(file){ if(!fs.existsSync(file)) return null; return JSON.parse(fs.readFileSync(file,'utf8')); }
function save(file, data){ fs.mkdirSync(path.dirname(file), { recursive:true }); fs.writeFileSync(file, JSON.stringify(data, null, 2)); }
module.exports = { load, save, path };
