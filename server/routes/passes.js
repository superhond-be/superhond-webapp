// server/routes/passes.js
const express = require('express');
const { readJSON, writeJSON, uid } = require('../helpers');
const router = express.Router();

// JSON-bestanden
const FILE_TYPES  = 'pass_types.json';   // definities van types
const FILE_PASSES = 'passes.json';       // uitgegeven passen (per e-mail)
const FILE_LEDGER = 'pass_ledger.json';  // transactielog (aftrek/refund)

// Helpers
function now(){ return Date.now(); }
function readTypes(){ return readJSON(FILE_TYPES, []); }
function readPasses(){ return readJSON(FILE_PASSES, []); }
function readLedger(){ return readJSON(FILE_LEDGER, []); }
function writeTypes(x){ writeJSON(FILE_TYPES, x); }
function writePasses(x){ writeJSON(FILE_PASSES, x); }
function writeLedger(x){ writeJSON(FILE_LEDGER, x); }

function normEmail(e){ return (e||'').trim().toLowerCase(); }

// ===== Types =====

// GET /api/passes/types
router.get('/types', (_req,res)=> res.json(readTypes()));

// POST /api/passes/types
// body: { naam, total_credits, expiry_days, allowed_course_type_ids? (array) }
router.post('/types', (req,res)=>{
  const list = readTypes();
  const item = {
    id: uid(),
    naam: req.body.naam || 'Strippenkaart',
    total_credits: Number(req.body.total_credits || 10),
    expiry_days: Number(req.body.expiry_days || 365),
    allowed_course_type_ids: Array.isArray(req.body.allowed_course_type_ids) ? req.body.allowed_course_type_ids : null
  };
  list.push(item); writeTypes(list);
  res.status(201).json(item);
});

// ===== Passes (uitgeven / saldo) =====

// GET /api/passes?email=...
router.get('/', (req,res)=>{
  const email = normEmail(req.query.email||'');
  const passes = readPasses().filter(p => !email || p.email === email);
  res.json(passes);
});

// POST /api/passes/issue
// body: { email, type_id, starts_at? (ts), expires_at? (ts), note? }
router.post('/issue', (req,res)=>{
  const email = normEmail(req.body.email);
  const type_id = req.body.type_id;
  const types = readTypes();
  const t = types.find(x=>x.id===type_id);
  if (!email || !t) return res.status(400).json({error:'invalid', message:'email of type_id ongeldig'});

  const starts_at = req.body.starts_at || now();
  const expires_at = req.body.expires_at || (starts_at + (t.expiry_days||365)*24*60*60*1000);

  const passes = readPasses();
  const pass = {
    id: uid(),
    email,
    type_id,
    remaining: t.total_credits,
    starts_at,
    expires_at,
    active: true,
    note: req.body.note || null
  };
  passes.push(pass); writePasses(passes);
  res.status(201).json(pass);
});

// ===== Ledger (alle transacties) =====

// GET /api/passes/ledger?email=...&enrollment_id=...
router.get('/ledger', (req,res)=>{
  const email = normEmail(req.query.email||'');
  const enrollment_id = req.query.enrollment_id;
  let log = readLedger();
  if (email) log = log.filter(x=>x.email===email);
  if (enrollment_id) log = log.filter(x=>x.enrollment_id===enrollment_id);
  res.json(log);
});

module.exports = router;
