import { Router } from "express";
import { store } from "./store.js"; // aangenomen bestaande in-memory store

const router = Router();

/** Kleine helpers */
const norm = (s) => (s ?? "").toString().toLowerCase().trim();
const has = (v) => v !== undefined && v !== null;

/** Bouw een samenvatting van passes en lessen voor een hond-id */
function summarizeForDog(dogId) {
  const passes = (store.passes ?? []).filter(p => p.dogId === dogId);
  const lessons = (store.lessons ?? []).filter(l => (l.dogIds ?? []).includes(dogId));

  // simpele voorbeelden
  const totalStrips = passes.reduce((a, p) => a + (p.totalStrips ?? 0), 0);
  const usedStrips  = passes.reduce((a, p) => a + (p.usedStrips  ?? 0), 0);
  const futureLessons = lessons.filter(l => has(l.date) && new Date(l.date) >= new Date()).length;
  const pastLessons   = lessons.length - futureLessons;

  return { passesCount: passes.length, totalStrips, usedStrips, futureLessons, pastLessons };
}

router.get("/", (req, res) => {
  const q = norm(req.query.q);
  if (!q) return res.json({ query: q, results: [] });

  const customers = store.customers ?? [];
  const dogs      = store.dogs ?? [];

  const custHits = customers
    .map(c => ({ c, key: [
        norm(c.name),
        norm(c.email),
        norm(c.phone),
        norm(c.address?.street),
        norm(c.address?.city)
      ].join(" ") }))
    .filter(x => x.key.includes(q))
    .map(({ c }) => {
      const ownedDogs = dogs.filter(d => d.ownerId === c.id);
      return {
        type: "customer",
        id: c.id,
        title: c.name,
        subtitle: c.email || c.phone || "",
        dogs: ownedDogs.map(d => ({
          id: d.id, name: d.name, breed: d.breed ?? "-"
        })),
      };
    });

  const dogHits = dogs
    .map(d => ({ d, key: [norm(d.name), norm(d.breed), norm(d.vetName)].join(" ") }))
    .filter(x => x.key.includes(q))
    .map(({ d }) => {
      const owner = customers.find(c => c.id === d.ownerId);
      const sum = summarizeForDog(d.id);
      return {
        type: "dog",
        id: d.id,
        title: d.name,
        subtitle: d.breed ?? "-",
        owner: owner ? { id: owner.id, name: owner.name, email: owner.email ?? "" } : null,
        photoUrl: d.photoUrl ?? null,
        stats: sum
      };
    });

  res.json({ query: q, results: [...custHits, ...dogHits] });
});

export default router;
