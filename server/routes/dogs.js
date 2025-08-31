// server/routes/dogs.js
import express from "express";
const router = express.Router();

// We krijgen een referentie naar CUSTOMERS uit customers.js
let CUSTOMERS_REF = null;
export function setCustomersRef(ref) { CUSTOMERS_REF = ref; }

// In-memory honden
const DOGS = [];
let NEXT_DOG_ID = 1;

/**
 * GET /api/dogs?customerId=1  (optioneel filteren)
 */
router.get("/", (req, res) => {
  const q = req.query.customerId ? Number(req.query.customerId) : null;
  const list = q ? DOGS.filter(d => d.ownerId === q) : DOGS;
  res.json(list);
});

/**
 * POST /api/dogs/:customerId
 * Body: { name, breed?, birthDate?, sex?, vetName?, vetPhone?, vaccineStatus?, vaccineRef?, emergencyPhone? }
 */
router.post("/:customerId", (req, res) => {
  if (!CUSTOMERS_REF) return res.status(500).json({ error: "customers not wired" });

  const customerId = Number(req.params.customerId);
  const customer = CUSTOMERS_REF.find(c => c.id === customerId);
  if (!customer) return res.status(404).json({ error: "Klant niet gevonden" });

  const {
    name, breed, birthDate, sex,
    vetName, vetPhone, vaccineStatus, vaccineRef, emergencyPhone
  } = req.body || {};

  if (!name) return res.status(400).json({ error: "Naam hond is verplicht" });

  const dog = {
    id: NEXT_DOG_ID++,
    ownerId: customerId,
    name: name || "",
    breed: breed || "",
    birthDate: birthDate || "",
    sex: sex || "",
    vetName: vetName || "",
    vetPhone: vetPhone || "",
    vaccineStatus: vaccineStatus || "",
    vaccineRef: vaccineRef || "",
    emergencyPhone: emergencyPhone || "",
    createdAt: new Date().toISOString(),
  };

  DOGS.push(dog);
  customer.dogs.push(dog.id);

  res.status(201).json(dog);
});

export default router;
