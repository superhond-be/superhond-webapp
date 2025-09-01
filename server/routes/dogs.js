import express from "express";
const router = express.Router();

let DOGS = [];
let NEXT_DOG_ID = 1;

/** GET /api/dogs?customerId=... */
router.get("/", (req, res) => {
  const customerId = req.query.customerId ? Number(req.query.customerId) : null;
  const list = customerId
    ? DOGS.filter((d) => d.ownerId === customerId)
    : DOGS;
  res.json(list);
});

/** GET /api/dogs/:id */
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const item = DOGS.find((d) => d.id === id);
  if (!item) return res.status(404).json({ error: "Dog not found" });
  res.json(item);
});

/**
 * POST /api/dogs
 * body: {
 *   ownerId?, name, breed, sex, birthdate,
 *   vetName?, vetPhone?, vaccineStatus?, bookRef?, photoUrl?
 * }
 */
router.post("/", (req, res) => {
  const {
    ownerId,
    name,
    breed,
    sex,
    birthdate,
    vetName,
    vetPhone,
    vaccineStatus,
    bookRef,
    photoUrl,
  } = req.body || {};
  if (!name) return res.status(400).json({ error: "name is required" });

  const dog = {
    id: NEXT_DOG_ID++,
    ownerId: Number.isFinite(Number(ownerId)) ? Number(ownerId) : null,
    name,
    breed: breed || "",
    sex: sex || "",
    birthdate: birthdate || "",
    vetName: vetName || "",
    vetPhone: vetPhone || "",
    vaccineStatus: vaccineStatus || "",
    bookRef: bookRef || "",
    photoUrl: photoUrl || "",
    createdAt: new Date().toISOString(),
  };
  DOGS.push(dog);
  res.status(201).json(dog);
});

export default router;
