import express from "express";
const router = express.Router();

// heel eenvoudige in-memory store (later DB)
let LESSON_TYPES = [
  { id: 1, name: "Puppy – Coachgroep", description: "Beginnende pups in kleine groep", active: true },
];
let NEXT_ID = 2;

// lijst
router.get("/", (_req, res) => res.json(LESSON_TYPES));

// toevoegen
router.post("/", (req, res) => {
  const { name, description = "", active = true } = req.body || {};
  if (!name) return res.status(400).json({ error: "Naam is verplicht" });
  const item = { id: NEXT_ID++, name, description, active: !!active };
  LESSON_TYPES.push(item);
  res.status(201).json(item);
});

export default router;
