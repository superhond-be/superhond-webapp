const { load, save, path } = require('./fsdb');
const FILE = path.join(__dirname,'..','data','dogs.json');
function read(){ return load(FILE) || []; }
function write(a){ save(FILE, a); }
module.exports = { read, write };
