// server/routes/dogs.js
import express from "express";
const router = express.Router();

// In-memory honden
let DOGS = [];
let NEXT_DOG_ID = 1;

// Alle honden (optioneel filteren op customerId: /api/dogs?customerId=1)
router.get("/", (req, res) => {
  const { customerId } = req.query || {};
  let list = DOGS;
  if (customerId) list = list.filter(d => String(d.customerId) === String(customerId));
  res.json(list);
});

// Één hond
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const d = DOGS.find(x => x.id === id);
  if (!d) return res.status(404).json({ error: "Hond niet gevonden" });
  res.json(d);
});

// Hond toevoegen (optioneel koppelen aan klant met customerId)
router.post("/", (req, res) => {
  const {
    name,
    breed,
    birthDate,
    sex,
    vaccinationStatus,
    vetPhone,
    vetName,
    emergencyPhone,
    passportRef,
    customerId // optioneel
  } = req.body || {};

  if (!name) return res.status(400).json({ error: "Naam hond is verplicht" });

  const newDog = {
    id: NEXT_DOG_ID++,
    name,
    breed: breed || "",
    birthDate: birthDate || "",
    sex: sex || "",
    vaccinationStatus: vaccinationStatus || "",
    vetPhone: vetPhone || "",
    vetName: vetName || "",
    emergencyPhone: emergencyPhone || "",
    passportRef: passportRef || "",
    customerId: customerId ?? null,
    createdAt: new Date().toISOString()
  };
  DOGS.push(newDog);
  res.status(201).json(newDog);
});

export default router;
