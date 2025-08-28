import express from "express";
const router = express.Router();

let classes = []; // tijdelijk in geheugen

// Nieuwe klas aanmaken
router.post("/", (req, res) => {
  const newClass = {
    id: classes.length + 1,
    name: req.body.name,
    level: req.body.level || "BEGINNER",
    defaultCapacity: req.body.defaultCapacity || 15,
    active: true
  };
  classes.push(newClass);
  res.status(201).json(newClass);
});

// Alle klassen ophalen
router.get("/", (_req, res) => {
  res.json(classes);
});

export default router;

// POST /api/classes (maak één klas)
router.post("/", (req, res) => {
  const { name, level, description, defaultCapacity = 15, locationId = null, active = true } = req.body || {};
  if (!name) return res.status(400).json({ error: "Naam is verplicht" });

  const klass = {
    id: Date.now().toString(),
    name, level, description, defaultCapacity, locationId, active
  };

  // TODO: bewaar in DB; voorlopig in-memory
  classes.push(klass);
  res.status(201).json(klass);
});

import express from "express";
import { classes } from "../data/store.js";
const router = express.Router();

const nextId = () => (classes.length ? Math.max(...classes.map(c => c.id)) + 1 : 1);

// Lijst
router.get("/", (_req, res) => res.json(classes));

// Detail
router.get("/:id", (req, res) => {
  const cls = classes.find(c => c.id === Number(req.params.id));
  if (!cls) return res.status(404).json({ error: "Klas niet gevonden" });
  res.json(cls);
});

// Aanmaken
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

// Bijwerken
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
