const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
app.get('/', (req,res)=>res.redirect('/m/lessen/'));
const modulesDir = path.join(__dirname, '../modules');
if (fs.existsSync(modulesDir)) {
  fs.readdirSync(modulesDir).forEach(mod => {
    const mf = path.join(modulesDir, mod, 'module.json');
    if (!fs.existsSync(mf)) return;
    const man = JSON.parse(fs.readFileSync(mf,'utf8'));
    const pub = path.join(modulesDir, mod, man.publicDir);
    if (fs.existsSync(pub)) app.use(man.mountPath, express.static(pub));
    const entry = path.join(modulesDir, mod, man.serverEntry);
    if (fs.existsSync(entry)) app.use(man.apiPath, require(entry));
    console.log('Loaded '+man.name+' v'+man.version);
  });
}
app.get('/health',(req,res)=>res.json({status:'ok'}));
const PORT=process.env.PORT||3000;
app.listen(PORT,()=>console.log('Server on '+PORT));