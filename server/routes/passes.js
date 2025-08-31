 1 // server/routes/passes.js
 2 import express from "express";
 3 const router = express.Router();
 4 
 5 /**
 6  * In-memory aankopen / strippenkaarten.
 7  * purchase:
 8  *  { id, customerId, dogId, typeCode, totalStrips, usedStrips }
 9  */
10 const PURCHASES = [];
11 
12 /** Hulpfunctie: hoeveel strips hoort bij een lestype */
13 const STRIPS_PER_TYPE = {
14   PUPPY: 9,
15   PUBER: 5,
16   GEV: 10
17 };
18 
19 // Overzicht aankopen (optioneel filteren op klant of hond)
20 router.get("/", (req, res) => {
21   const { customerId, dogId } = req.query;
22   let out = PURCHASES.slice();
23   if (customerId) out = out.filter(p => String(p.customerId) === String(customerId));
24   if (dogId) out = out.filter(p => String(p.dogId) === String(dogId));
25   res.json(out);
26 });
27 
28 // Nieuwe strippenkaart registreren (koppelt aan klant + hond + lestype)
29 router.post("/", (req, res) => {
30   const { customerId, dogId, typeCode } = req.body || {};
31   if (!customerId || !dogId || !typeCode) {
32     return res.status(400).json({ error: "customerId, dogId en typeCode zijn verplicht" });
33   }
34   const total = STRIPS_PER_TYPE[typeCode];
35   if (!total) return res.status(400).json({ error: "Onbekend lestype" });
36 
37   const id = Date.now(); // eenvoudige ID
38   const purchase = { id, customerId, dogId, typeCode, totalStrips: total, usedStrips: 0 };
39   PURCHASES.push(purchase);
40   res.status(201).json(purchase);
41 });
42 
43 // Verbruik 1 strip voor een bepaalde aankoop (bijv. bij aanwezigheid)
44 router.post("/:id/consume", (req, res) => {
45   const id = Number(req.params.id);
46   const p = PURCHASES.find(x => x.id === id);
47   if (!p) return res.status(404).json({ error: "Aankoop niet gevonden" });
48 
49   if (p.usedStrips >= p.totalStrips) {
50     return res.status(409).json({ error: "Geen strips meer beschikbaar" });
51   }
52   p.usedStrips += 1;
53   res.json(p);
54 });
55 
56 // Reset (alleen voor testen)
57 router.post("/__reset", (_req, res) => {
58   PURCHASES.length = 0;
59   res.json({ ok: true });
60 });
61 
62 export default router;

  // server/routes/passes.js 
  import express from "express";
  const router = express.Router();
  
  /**
   * In-memory aankopen / strippenkaarten.
   * purchase:
   *  { id, customerId, dogId, typeCode, totalStrips, usedStrips }
   */
 const PURCHASES = [];
 
 /** Hulpfunctie: hoeveel strips hoort bij een lestype */
 const STRIPS_PER_TYPE = {
   PUPPY: 9,
   PUBER: 5,
   GEV: 10
 };
 
 // Overzicht aankopen (optioneel filteren op klant of hond)
 router.get("/", (req, res) => {
   const { customerId, dogId } = req.query;
   let out = PURCHASES.slice();
    if (customerId) out = out.filter(p => String(p.customerId) === String(customerId));
   if (dogId) out = out.filter(p => String(p.dogId) === String(dogId));
   res.json(out);
 });
 
 // Nieuwe strippenkaart registreren (koppelt aan klant + hond + lestype
 router.post("/", (req, res) => {
   const { customerId, dogId, typeCode } = req.body || {};
   if (!customerId || !dogId || !typeCode) {
     return res.status(400).json({ error: "customerId, dogId en typeCode zijn verplicht" });
   }
   const total = STRIPS_PER_TYPE[typeCode];
   if (!total) return res.status(400).json({ error: "Onbekend lestype" });
 
   const id = Date.now(); // eenvoudige ID
   const purchase = { id, customerId, dogId, typeCode, totalStrips: total, usedStrips: 0 };
   PURCHASES.push(purchase);
   res.status(201).json(purchase);
 });
 
 // Verbruik 1 strip voor een bepaalde aankoop (bijv. bij aanwezigheid)
44 router.post("/:id/consume", (req, res) => {
45   const id = Number(req.params.id);
46   const p = PURCHASES.find(x => x.id === id);
47   if (!p) return res.status(404).json({ error: "Aankoop niet gevonden" });
48 
49   if (p.usedStrips >= p.totalStrips) {
50     return res.status(409).json({ error: "Geen strips meer beschikbaar" });
51   }
52   p.usedStrips += 1;
53   res.json(p);
54 });
55 
56 // Reset (alleen voor testen)
57 router.post("/__reset", (_req, res) => {
58   PURCHASES.length = 0;
59   res.json({ ok: true });
60 });
61 
62 export default router;

import { Router } from "express";

const router = Router();

// In-memory strippenkaarten
// item: { id, customerId, lessonType, total, used }
let PASSES = [];
let NEXT_PASS_ID = 1;

// Mapping lestype -> aantal strippen
const LESSON_TYPE_PASSES = {
  "PUPPY – Puppy Pack": 9,
  "PUPPY – Starters": 8,
  "PUBER – Coachgroep": 5,
  "GEHOORZAAMHEID – Groep": 10,
};

// Helpers (exporteren zodat customers.js ze kan gebruiken)
export function getPassCountForLessonType(lessonType) {
  return LESSON_TYPE_PASSES[lessonType] ?? 0;
}

export function assignInitialPasses(customerId, lessonType) {
  const total = getPassCountForLessonType(lessonType);
  if (!total) return null;

  const pass = {
    id: NEXT_PASS_ID++,
    customerId,
    lessonType,
    total,
    used: 0,
  };
  PASSES.push(pass);
  return pass;
}

export function listPassesForCustomer(customerId) {
  return PASSES.filter(p => p.customerId === customerId);
}

export function usePass(customerId, count = 1) {
  // Zoek eerste kaart met nog strippen over
  const cards = PASSES.filter(p => p.customerId === customerId && p.used < p.total);
  if (!cards.length) return { ok: false, message: "Geen strippen beschikbaar" };

  let left = count;
  for (const card of cards) {
    const room = card.total - card.used;
    const take = Math.min(left, room);
    card.used += take;
    left -= take;
    if (left <= 0) break;
  }
  return { ok: left === 0, remainingToUse: left };
}

// --- Routes --- //

// Geef alle strippenkaarten van 1 klant
router.get("/:customerId", (req, res) => {
  const customerId = Number(req.params.customerId);
  return res.json(listPassesForCustomer(customerId));
});

// Handmatig toekennen (bijv. administratief)
router.post("/assign", (req, res) => {
  const { customerId, lessonType } = req.body || {};
  if (!customerId || !lessonType) {
    return res.status(400).json({ error: "customerId en lessonType zijn verplicht" });
  }
  const pass = assignInitialPasses(Number(customerId), lessonType);
  if (!pass) return res.status(400).json({ error: "Onbekend lestype of 0 strippen" });
  return res.status(201).json(pass);
});

// Strip(pen) gebruiken
router.post("/use", (req, res) => {
  const { customerId, count = 1 } = req.body || {};
  if (!customerId) return res.status(400).json({ error: "customerId is verplicht" });
  const result = usePass(Number(customerId), Number(count));
  if (!result.ok) return res.status(400).json({ error: result.message });
  return res.json({ ok: true });
});

export default router;
