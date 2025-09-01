// server/routes/summary.js  (ESM)
import express from "express";
import { store } from "../store.js";

const router = express.Router();

/**
 * GET /api/summary/customer/:customerId
 * Retourneert klant + honden + passes + lessen (gesplitst: verleden/toekomst)
 */
router.get("/customer/:customerId", (req, res) => {
  const id = Number(req.params.customerId);
  const customer = store.customers.find(c => c.id === id);
  if (!customer) return res.status(404).json({ error: "Customer not found" });

  const dogs = store.dogs.filter(d => d.ownerId === id);
  const passes = store.passes.filter(p => p.customerId === id);

  // lessen die aan de klant/hond gekoppeld zijn (eenvoudig gefilterd op dogId)
  const lessonsByDog = {};
  for (const d of dogs) {
    const dogLessons = store.lessons.filter(l => l.dogId === d.id);
    const now = new Date();
    const past = dogLessons.filter(l => new Date(l.date) < now);
    const future = dogLessons.filter(l => new Date(l.date) >= now);
    lessonsByDog[d.id] = { past, future };
  }

  res.json({ customer, dogs, passes, lessonsByDog, updatedAt: new Date().toISOString() });
});

/**
 * GET /api/summary/dog/:dogId
 * Compacte samenvatting op hond-niveau
 */
router.get("/dog/:dogId", (req, res) => {
  const id = Number(req.params.dogId);
  const dog = store.dogs.find(d => d.id === id);
  if (!dog) return res.status(404).json({ error: "Dog not found" });

  const owner = store.customers.find(c => c.id === dog.ownerId) || null;
  const passes = store.passes.filter(p => p.dogId === id);
  const lessons = store.lessons.filter(l => l.dogId === id);

  const now = new Date();
  const past = lessons.filter(l => new Date(l.date) < now);
  const future = lessons.filter(l => new Date(l.date) >= now);

  res.json({ dog, owner, passes, lessons: { past, future }, updatedAt: new Date().toISOString() });
});

export default router;
