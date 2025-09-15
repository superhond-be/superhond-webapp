const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// Debug logger
app.use((req,res,next)=>{ console.log('→', req.method, req.url); next(); });

// Root always redirects to lessons module
app.get('/', (req, res) => res.redirect('/m/lessen/'));

// Auto-mount modules (UI + API)
const modulesDir = path.join(__dirname, '../modules');
if (fs.existsSync(modulesDir)) {
  fs.readdirSync(modulesDir).forEach(mod => {
    const base = path.join(modulesDir, mod);
    const mf = path.join(base, 'module.json');
    if (!fs.existsSync(mf)) return;
    const manifest = JSON.parse(fs.readFileSync(mf, 'utf8'));

    const pub = path.join(base, manifest.publicDir || 'public');
    if (fs.existsSync(pub)) app.use(manifest.mountPath, express.static(pub));

    const entry = path.join(base, manifest.serverEntry || 'server/index.js');
    if (fs.existsSync(entry)) app.use(manifest.apiPath, require(entry));

    console.log(`🔌 Loaded ${manifest.name} v${manifest.version} | static: ${manifest.mountPath} | api: ${manifest.apiPath}`);
  });
}

// Debug/health endpoints
app.get('/__routes', (req,res)=>{
  const list = fs.existsSync(modulesDir) ? fs.readdirSync(modulesDir) : [];
  res.json({ modules: list });
});
app.get('/health', (req,res)=>res.json({status:'ok', at:new Date()}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log(`✅ Server on http://localhost:${PORT}`));
