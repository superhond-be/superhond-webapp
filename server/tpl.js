// server/tpl.js
const fs = require('fs');
const path = require('path');

// simpele placeholder vervanger {{veld}}
function renderFile(file, data){
  let out = fs.readFileSync(path.join(__dirname, 'templates', file), 'utf8');
  for (const [k,v] of Object.entries(data||{})){
    const re = new RegExp(`{{\\s*${k}\\s*}}`,'g');
    out = out.replace(re, v==null?'':String(v));
  }
  return out;
}

function render(file, data){
  return renderFile(file, data);
}

module.exports = { render };
