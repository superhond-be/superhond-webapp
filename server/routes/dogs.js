// server/routes/dogs.js
import express from "express";
import { CUSTOMERS } from "./customers.js";
const router = express.Router();

// In-memory
let NEXT_DOG_ID = 1;
export const DOGS = []; // { id, customerId, name, breed, birthDate, sex, vaccinationStatus, vaccinationBookRef, vetName, vetPhone, emergencyContact }

// Helper: hond voor klant aanmaken
export function createDogForCustomer(customerId, dogData) {
  const customer = CUSTOMERS.find(c => c.id === Number(customerId));
  if (!customer) throw new Error("Klant niet gevonden");

  const d = {
    id: NEXT_DOG_ID++,
    customerId: customer.id,
    name: dogData.name,
    breed: dogData.breed || "",
    birthDate: dogData.birthDate || "",
    sex: dogData.sex || "",
    vaccinationStatus: dogData.vaccinationStatus || "",
    vaccinationBookRef: dogData.vaccinationBookRef || "",
    vetName: dogData.vetName || "",
    vetPhone: dogData.vetPhone || "",
    emergencyContact: dogData.emergencyContact || ""
  };
  DOGS.push(d);
  customer.dogs = customer.dogs || [];
  customer.dogs.push({ id: d.id, name: d.name, breed: d.breed }); // korte weergave bij klant
  return d;
}

// Lijst (optioneel filter customerId)
router.get("/", (req, res) => {
  const cid = req.query.customerId ? Number(req.query.customerId) : null;
  const list = cid ? DOGS.filter(d => d.customerId === cid) : DOGS;
  res.json(list);
});

// (optioneel) hond toevoegen via /api/dogs/:customerId
router.post("/:customerId", (req, res) => {
  const customerId = Number(req.params.customerId);
  const { name, ...rest } = req.body || {};
  if (!name) return res.status(400).json({ error: "Hond naam is verplicht" });
  try {
    const d = createDogForCustomer(customerId, { name, ...rest });
    res.status(201).json(d);
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});

export default router;
