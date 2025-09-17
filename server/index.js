import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Config
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, '..', 'db', 'data.json');
const SEED_FILE = path.join(__dirname, '..', 'db', 'seed.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Helper: load/save
function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.copyFileSync(SEED_FILE, DB_FILE);
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}
function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

// Routes
app.get('/api/version', (req,res)=>{
  const db = loadDB();
  res.json({ ok:true, version: db.version || 'unknown', time: new Date().toISOString() });
});

// CRUD factory
function crudRoutes(key) {
  app.get(`/api/${key}`, (req,res)=>{
    const db = loadDB();
    res.json(db[key] || []);
  });
  app.post(`/api/${key}`, (req,res)=>{
    const db = loadDB();
    const item = req.body;
    if (!item.id) item.id = `${key}_${Date.now()}`;
    db[key] = db[key] || [];
    db[key].push(item);
    saveDB(db);
    res.status(201).json(item);
  });
  app.put(`/api/${key}/:id`, (req,res)=>{
    const db = loadDB();
    const id = req.params.id;
    db[key] = db[key] || [];
    const i = db[key].findIndex(x => x.id === id);
    if (i === -1) return res.status(404).json({error:'Not found'});
    db[key][i] = { ...db[key][i], ...req.body, id };
    saveDB(db);
    res.json(db[key][i]);
  });
  app.delete(`/api/${key}/:id`, (req,res)=>{
    const db = loadDB();
    const id = req.params.id;
    db[key] = db[key] || [];
    const before = db[key].length;
    db[key] = db[key].filter(x => x.id !== id);
    saveDB(db);
    res.json({ ok:true, removed: before - db[key].length });
  });
}
['namen','types','locaties','themas','trainers'].forEach(crudRoutes);

// HTML convenience routes (so je kan /lessenbeheer direct openen)
app.get(['/','/lessenbeheer'], (req,res)=>{
  res.set('Cache-Control','no-store');
  res.sendFile(path.join(__dirname,'..','public','lessenbeheer.html'));
});

app.listen(PORT, ()=> console.log(`Lessenbeheer standalone running on :${PORT}`));