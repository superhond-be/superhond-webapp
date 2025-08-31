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
