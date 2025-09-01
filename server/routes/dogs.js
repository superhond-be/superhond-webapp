// server/routes/dogs.js (ESM)
import express from "express";
import { store, nextId } from "../store.js";

const router = express.Router();

/**
 * GET /api/dogs
 * Optioneel: ?customerId=...  → filter per eigenaar
 */
router.get("/", (req, res) => {
  const customerId = req.query.customerId ? Number(req.query.customerId) : null;
  if (customerId) {
    return res.json(store.dogs.filter((d) => d.ownerId === customerId));
  }
  res.json(store.dogs);
});

/** GET /api/dogs/:id */
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const dog = store.dogs.find((d) => d.id === id);
  if (!dog) return res.status(404).json({ error: "Dog not found" });
  res.json(dog);
});

/**
 * POST /api/dogs
 * body: {
 *   ownerId (vereist),
 *   name (vereist),
 *   breed?, birthdate?, sex?, vaccineStatus?, bookRef?,
 *   vetName?, vetPhone?, emergencyPhone?, photoUrl?
 * }
 */
router.post("/", (req, res) => {
  const {
    ownerId,
    name,
    breed,
    birthdate,
    sex,
    vaccineStatus,
    bookRef,
    vetName,
    vetPhone,
    emergencyPhone,
    photoUrl
  } = req.body || {};

  if (!Number.isFinite(Number(ownerId))) {
    return res.status(400).json({ error: "ownerId is required" });
  }
  if (!name) return res.status(400).json({ error: "name is required" });

  const owner = store.customers.find((c) => c.id === Number(ownerId));
  if (!owner) return res.status(404).json({ error: "Owner (customer) not found" });

  const dog = {
    id: nextId(store.dogs),
    ownerId: Number(ownerId),
    name: String(name).trim(),
    breed: (breed || "").trim(),
    birthdate: (birthdate || "").trim(),
    sex: (sex || "").trim(),
    vaccineStatus: (vaccineStatus || "").trim(),
    bookRef: (bookRef || "").trim(),
    vetName: (vetName || "").trim(),
    vetPhone: (vetPhone || "").trim(),
    emergencyPhone: (emergencyPhone || "").trim(),
    photoUrl: (photoUrl || "").trim(),
    createdAt: new Date().toISOString()
  };

  store.dogs.push(dog);
  res.status(201).json(dog);
});

/**
 * PUT /api/dogs/:id  (partiële update)
 */
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const dog = store.dogs.find((d) => d.id === id);
  if (!dog) return res.status(404).json({ error: "Dog not found" });

  const b = req.body || {};
  if (b.ownerId !== undefined) {
    const owner = store.customers.find((c) => c.id === Number(b.ownerId));
    if (!owner) return res.status(404).json({ error: "New owner not found" });
    dog.ownerId = Number(b.ownerId);
  }

  const fields = [
    "name",
    "breed",
    "birthdate",
    "sex",
    "vaccineStatus",
    "bookRef",
    "vetName",
    "vetPhone",
    "emergencyPhone",
    "photoUrl"
  ];
  for (const f of fields) {
    if (b[f] !== undefined) dog[f] = String(b[f]).trim();
  }

  res.json(dog);
});

/** DELETE /api/dogs/:id */
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const before = store.dogs.length;
  store.dogs = store.dogs.filter((d) => d.id !== id);
  if (store.dogs.length === before) {
    return res.status(404).json({ error: "Dog not found" });
  }
  // gekoppelde passes opruimen (dogId)
  store.passes = store.passes.filter((p) => p.dogId !== id);
  res.json({ message: "Dog (and related passes) removed" });
});

export default router;
