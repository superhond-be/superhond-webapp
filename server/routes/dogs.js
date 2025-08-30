// server/routes/dogs.js
import express from "express";
const router = express.Router();

let CUSTOMERS_REF = null;
export function setCustomersRef(ref) { CUSTOMERS_REF = ref; }

const DOGS = []; // in-memory
let NEXT_DOG_ID = 1;

// alle honden (optioneel filter op customerId)
router.get("/", (req, res) => {
  const q = req.query.customerId ? Number(req.query.customerId) : null;
  const list = q ? DOGS.filter(d => d.ownerId === q) : DOGS;
  res.json(list);
});

// hond toevoegen aan klant
router.post("/:customerId", (req, res) => {
  if (!CUSTOMERS_REF) return res.status(500).json({ error: "customers not wired" });
  const customerId = Number(req.params.customerId);
  const customer = CUSTOMERS_REF.find(c => c.id === customerId);
  if (!customer) return res.status(404).json({ error: "customer not found" });

  const {
    name, breed, birthDate, sex,
    vetName, vetPhone, vaccineStatus, vaccineRef, emergencyPhone
  } = req.body || {};

  if (!name) return res.status(400).json({ error: "dog name required" });

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
    emergencyPhone: emergencyPhone || ""
  };

  DOGS.push(dog);
  customer.dogs.push(dog.id);

  res.status(201).json(dog);
});

export default router;
