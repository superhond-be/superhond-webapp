const express = require('express');
const { readJSON, writeJSON, uid } = require('../helpers');
const router = express.Router();

// Bestanden
const FILE_TYPES  = 'pass_types.json';   // definities (bv. 10-beurtenkaart)
const FILE_PASSES = 'passes.json';       // uitgegeven kaarten
const FILE_LEDGER = 'pass_ledger.json';  // transacties (debit/refund)

// Helpers
const now = () => Date.now();
const normEmail = (e) => (e || '').trim().toLowerCase();

const readTypes  = () => readJSON(FILE_TYPES, []);
const readPasses = () => readJSON(FILE_PASSES, []);
const readLedger = () => readJSON(FILE_LEDGER, []);
const writeTypes  = (x) => writeJSON(FILE_TYPES, x);
const writePasses = (x) => writeJSON(FILE_PASSES, x);
const writeLedger = (x) => writeJSON(FILE_LEDGER, x);

/* -------------------- TYPES -------------------- */

// GET /api/passes/types
router.get('/types', (_req, res) => res.json(readTypes()));

// POST /api/passes/types
// body: { naam, total_credits, expiry_days, allowed_course_type_ids? }
router.post('/types', (req, res) => {
  const list = readTypes();
  const item = {
    id: uid(),
    naam: req.body.naam || 'Strippenkaart',
    total_credits: Number(req.body.total_credits || 10),
    expiry_days: Number(req.body.expiry_days || 365),
    allowed_course_type_ids: Array.isArray(req.body.allowed_course_type_ids)
      ? req.body.allowed_course_type_ids : null
  };
  list.push(item); writeTypes(list);
  res.status(201).json(item);
});

/* -------------------- PASSEN -------------------- */

// GET /api/passes?email=...
router.get('/', (req, res) => {
  const email = normEmail(req.query.email || '');
  const passes = readPasses().filter(p => !email || p.email === email);
  res.json(passes);
});

// POST /api/passes/issue
// body: { email, type_id, starts_at?, expires_at?, note? }
router.post('/issue', (req, res) => {
  const email = normEmail(req.body.email);
  const type_id = req.body.type_id;
  if (!email || !type_id) {
    return res.status(400).json({ error: 'invalid', message: 'email en type_id zijn verplicht' });
  }
  const type = readTypes().find(t => t.id === type_id);
  if (!type) return res.status(404).json({ error: 'not_found', message: 'type_id onbekend' });

  const starts_at = req.body.starts_at || now();
  const expires_at = req.body.expires_at || (starts_at + (type.expiry_days || 365) * 86400000);

  const passes = readPasses();
  const pass = {
    id: uid(),
    email,
    type_id,
    remaining: type.total_credits,
    starts_at,
    expires_at,
    active: true,
    note: req.body.note || null
  };
  passes.push(pass); writePasses(passes);
  res.status(201).json(pass);
});

/* -------------------- LEDGER -------------------- */

// GET /api/passes/ledger?email=...&enrollment_id=...
router.get('/ledger', (req, res) => {
  const email = normEmail(req.query.email || '');
  const enrollment_id = req.query.enrollment_id;
  let log = readLedger();
  if (email) log = log.filter(x => x.email === email);
  if (enrollment_id) log = log.filter(x => x.enrollment_id === enrollment_id);
  res.json(log);
});

module.exports = router;
