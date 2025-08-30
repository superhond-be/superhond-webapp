// server/routes/dogs.js
import express from "express";
import { findCustomer, getCustomers } from "./customers.js";

const router = express.Router();

// In-memory ID generator voor honden
let NEXT_DOG_ID = 1;

// Alle honden (optioneel filter op customerId)
router.get("/", (req, res) => {
  const { customerId } = req.query || {};
  const allDogs = getCustomers().flatMap((c) =>
    (c.dogs || []).map((d) => ({ ...d, ownerId: c.id, ownerName: c.name }))
  );
  if (customerId) {
    const filtered = allDogs.filter(
      (d) => Number(d.ownerId) === Number(customerId)
    );
    return res.json(filtered);
  }
  res.json(allDogs);
});

// Hond toevoegen aan klant
router.post("/:customerId", (req, res) => {
  const c = findCustomer(req.params.customerId);
  if (!c) return res.status(404).json({ error: "Klant niet gevonden" });

  const {
    name,
    breed,
    birthDate,
    sex, // "m" | "v" | "-"
    vetName,
    vetPhone,
    vaccStatus,
    bookletRef,
    emergencyPhone,
  } = req.body || {};

  if (!name) return res.status(400).json({ error: "Naam hond is verplicht" });

  const dog = {
    id: NEXT_DOG_ID++,
    name,
    breed: breed || "",
    birthDate: birthDate || "",
    sex: sex || "-",
    vetName: vetName || "",
    vetPhone: vetPhone || "",
    vaccStatus: vaccStatus || "",
    bookletRef: bookletRef || "",
    emergencyPhone: emergencyPhone || "",
    createdAt: new Date().toISOString(),
  };

  c.dogs = c.dogs || [];
  c.dogs.push(dog);

  res.status(201).json({ ownerId: c.id, ...dog });
});

export default router;
