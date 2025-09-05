const fs = require('fs'); const path = require('path');
const FILE = path.join(__dirname,'..','data','notification_policy.json');
let cache=null;
function loadPolicy(){ if(!cache){ cache = JSON.parse(fs.readFileSync(FILE,'utf8')); } return cache; }
function getPolicy(type){ return loadPolicy().find(p=>p.type===type) || null; }
module.exports = { loadPolicy, getPolicy };
