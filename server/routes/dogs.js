import express from "express";

const router = express.Router();

// ---- In-memory honden (optioneel) ----
const DOGS = [];

// We laten index.js een referentie doorgeven naar de CUSTOMERS array
let CUSTOMERS_REF = null;
export function setCustomersRef(ref) {
  CUSTOMERS_REF = ref;
}

// ---- Alle honden ----
router.get("/", (_req, res) => {
  res.json(DOGS);
});

// ---- Hond toevoegen aan een klant ----
// POST /api/dogs/:customerId
// body: { name, breed }
router.post("/:customerId", (req, res) => {
  const customerId = Number(req.params.customerId);
  const { name, breed } = req.body || {};

  if (!name) return res.status(400).json({ error: "Naam van de hond is verplicht" });

  // 1) altijd toevoegen aan centrale DOGS-lijst (handig voor overzicht)
  const dogId = (DOGS.at(-1)?.id ?? 0) + 1;
  const newDog = { id: dogId, name, breed: breed || "" , ownerId: customerId };
  DOGS.push(newDog);

  // 2) indien klantenreferentie bekend is, ook koppelen aan die klant
  if (CUSTOMERS_REF) {
    const customer = CUSTOMERS_REF.find(c => c.id === customerId);
    if (!customer) return res.status(404).json({ error: "Klant niet gevonden" });
    if (!Array.isArray(customer.dogs)) customer.dogs = [];
    customer.dogs.push({ id: dogId, name, breed: breed || "" });
  }

  res.status(201).json(newDog);
});

export default router;
