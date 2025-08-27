import express from "express";
const router = express.Router();

/**
 * KLASSEN = les-types (vb. Puppy, Pubers)
 * - name: "Puppy"
 * - description: vrije tekst
 * - maxLessons: aantal credits/lessen in het pakket (bv. 9)
 * - validityMonths: hoe lang geldig (bv. 6 maanden)
 */
let classes = [
  { id: 1, name: "Puppy",  description: "Basistraining voor pups",            maxLessons: 9, validityMonths: 6 },
  { id: 2, name: "Pubers", description: "Vervolg voor jonge honden (pubers)", maxLessons: 8, validityMonths: 3 }
];

const nextId = () => (classes.length ? Math.max(...classes.map(c => c.id)) + 1 : 1);

// Alle klassen
router.get("/", (_req, res) => {
  res.json(classes);
});

// Eén klas
router.get("/:id", (req, res) => {
  const cls = classes.find(c => c.id === Number(req.params.id));
  if (!cls) return res.status(404).json({ error: "Klas niet gevonden" });
  res.json(cls);
});

// Nieuwe klas
router.post("/", (req, res) => {
  const { name, description = "", maxLessons, validityMonths } = req.body || {};
  if (!name || maxLessons == null || validityMonths == null) {
    return res.status(400).json({ error: "Vereist: name, maxLessons, validityMonths" });
  }
  const created = {
    id: nextId(),
    name,
    description,
    maxLessons: Number(maxLessons),
    validityMonths: Number(validityMonths)
  };
  classes.push(created);
  res.status(201).json(created);
});

// Bijwerken (gedeeltelijk)
router.put("/:id", (req, res) => {
  const i = classes.findIndex(c => c.id === Number(req.params.id));
  if (i === -1) return res.status(404).json({ error: "Klas niet gevonden" });
  const { name, description, maxLessons, validityMonths } = req.body || {};
  classes[i] = {
    ...classes[i],
    ...(name !== undefined ? { name } : {}),
    ...(description !== undefined ? { description } : {}),
    ...(maxLessons !== undefined ? { maxLessons: Number(maxLessons) } : {}),
    ...(validityMonths !== undefined ? { validityMonths: Number(validityMonths) } : {}),
  };
  res.json(classes[i]);
});

// Verwijderen
router.delete("/:id", (req, res) => {
  const i = classes.findIndex(c => c.id === Number(req.params.id));
  if (i === -1) return res.status(404).json({ error: "Klas niet gevonden" });
  const removed = classes.splice(i, 1)[0];
  res.json({ ok: true, removedId: removed.id });
});

export default router;
