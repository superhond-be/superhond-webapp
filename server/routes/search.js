import { Router } from "express";
import { store } from "./store.js"; // aangenomen bestaande in-memory store





const router = Router();
// server/routes/store.js

// Klanten
export const customers = [
  { 
    id: 1, 
    name: "Paul Thijs", 
    email: "paul@example.com", 
    phone: "0476123456" 
  },
  { 
    id: 2, 
    name: "Sofie Thijs", 
    email: "sofie@example.com", 
    phone: "0476987654" 
  }
];

// Honden
export const dogs = [
  { 
    id: 1, 
    name: "Diva", 
    breed: "Dobermann", 
    ownerId: 1   // gekoppeld aan Paul
  },
  { 
    id: 2, 
    name: "Rocky", 
    breed: "Border Collie", 
    ownerId: 2   // gekoppeld aan Sofie
  }
];

// Strippenkaarten
export const passes = [
  { 
    id: 1, 
    dogId: 1,          // Diva
    type: "Puppycursus", 
    total: 9,          // totaal aantal lessen
    remaining: 9       // nog niet gebruikt
  },
  { 
    id: 2, 
    dogId: 2,          // Rocky
    type: "Pubercursus", 
    total: 5, 
    remaining: 5
  }
];

// Lessen (voorlopig leeg, je kunt later vullen)
export const lessons = [];

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
