const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// Shared public (optioneel)
const sharedPublic = path.join(__dirname, '../public');
if (fs.existsSync(sharedPublic)) {
  app.use(express.static(sharedPublic));
}

// Load modules automatically
const modulesDir = path.join(__dirname, '../modules');
fs.readdirSync(modulesDir).forEach(modName => {
  const base = path.join(modulesDir, modName);
  const manifestPath = path.join(base, 'module.json');
  if (!fs.existsSync(manifestPath)) return;

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const publicDir = path.join(base, manifest.publicDir);
  if (fs.existsSync(publicDir)) {
    app.use(manifest.mountPath, express.static(publicDir));
  }
  const serverEntry = path.join(base, manifest.serverEntry);
  if (fs.existsSync(serverEntry)) {
    const router = require(serverEntry);
    app.use(manifest.apiPath, router);
  }
  console.log(`🔌 Module "${manifest.name}" v${manifest.version} geladen: static=${manifest.mountPath}, api=${manifest.apiPath}`);
});

// Health
app.get('/health', (req,res)=>res.json({status:'ok',at:new Date()}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server draait op http://localhost:${PORT}`));
