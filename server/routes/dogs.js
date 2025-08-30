// src/server/routes/dogs.js
import express from "express";
const router = express.Router();

// In-memory opslag voor honden
let DOGS = [];
let NEXT_DOG_ID = 1;

// Referentie naar de CUSTOMERS array (ingesteld vanuit index.js)
let CUSTOMERS_REF = null;
export function setCustomersRef(ref) {
  CUSTOMERS_REF = ref;
}

// ─────────────────────────────────────────────
// GET /api/dogs  (optioneel ?customerId=…)
// ─────────────────────────────────────────────
router.get("/", (req, res) => {
  const { customerId } = req.query;
  if (customerId) {
    const cid = Number(customerId);
    return res.json(DOGS.filter(d => d.ownerId === cid));
  }
  res.json(DOGS);
});

// ─────────────────────────────────────────────
// POST /api/dogs/:customerId   → hond koppelen aan klant
// Body: { name, breed, birthDate, sex, vaccStatus, vetPhone, vetName, bookletRef, emergencyPhone }
// ─────────────────────────────────────────────
router.post("/:customerId", (req, res) => {
  if (!CUSTOMERS_REF) {
    return res.status(500).json({ error: "Customers referentie niet ingesteld" });
  }

  const customerId = Number(req.params.customerId);
  const customer = CUSTOMERS_REF.find(c => c.id === customerId);

  if (!customer) {
    return res.status(404).json({ error: "Klant niet gevonden" });
  }

  const {
    name,
    breed = "",
    birthDate = "",
    sex = "-",
    vaccStatus = "",
    vetPhone = "",
    vetName = "",
    bookletRef = "",
    emergencyPhone = ""
  } = req.body || {};

  if (!name || String(name).trim() === "") {
    return res.status(400).json({ error: "Naam van de hond is verplicht" });
  }

  const dog = {
    id: NEXT_DOG_ID++,
    ownerId: customer.id,
    name: String(name).trim(),
    breed,
    birthDate,
    sex,                // "reutje", "teefje" of "-"
    vaccStatus,
    vetPhone,
    vetName,
    bookletRef,
    emergencyPhone,
    createdAt: new Date().toISOString()
  };

  DOGS.push(dog);

  // zorg dat de klant een dogs-array heeft en koppel de id
  customer.dogs = customer.dogs || [];
  customer.dogs.push(dog.id);

  return res.status(201).json(dog);
});

export default router;
