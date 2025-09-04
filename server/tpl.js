const fs = require('fs'); const path = require('path');
function render(file, data={}){
  let out = fs.readFileSync(path.join(__dirname,'templates',file),'utf8');
  for(const [k,v] of Object.entries(data)){
    out = out.replace(new RegExp(`{{\\s*${k}\\s*}}`,'g'), v==null?'':String(v));
  }
  return out;
}
module.exports = { render };
