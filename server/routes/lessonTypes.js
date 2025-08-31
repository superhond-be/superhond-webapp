// src/server/routes/lessonTypes.js
import express from "express";
const router = express.Router();

/**
 * In-memory lestypes. Elke entry bepaalt ook het aantal strippen (credits) per kaart.
 * Later kun je dit natuurlijk uit een DB halen.
 */
const LESSON_TYPES = [
  { id: 1, code: "PUPPY9",   name: "Puppy – 9 lessen",   stripsPerCard: 9 },
  { id: 2, code: "PUBER6",   name: "Puber – 6 lessen",   stripsPerCard: 6 },
  { id: 3, code: "GEVORD8",  name: "Gevorderd – 8 lessen", stripsPerCard: 8 },
];

// Alle lestypes
router.get("/", (_req, res) => {
  res.json(LESSON_TYPES);
});

export default router;
export { LESSON_TYPES };
