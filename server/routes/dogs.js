// src/server/routes/dogs.js
import express from "express";

export const DOGS_REF = [];   // in-memory opslag
let NEXT_DOG_ID = 1;

const router = express.Router();

// Alle honden (optioneel filter op ownerId)
router.get("/", (req, res) => {
  const { ownerId } = req.query;
  let list = DOGS_REF;
  if (ownerId != null) {
    list = list.filter(d => String(d.ownerId) === String(ownerId));
  }
  res.json(list);
});

// Nieuwe hond
router.post("/", (req, res) => {
  const { name, breed, sex, birthdate, ownerId } = req.body ?? {};
  if (!name) return res.status(400).json({ error: "Naam hond is verplicht" });

  const dog = {
    id: NEXT_DOG_ID++,
    name,
    breed: breed || "",
    sex: sex || "",
    birthdate: birthdate || "",
    ownerId: ownerId != null ? Number(ownerId) : null, // koppeling met klant
  };
  DOGS_REF.push(dog);
  res.status(201).json(dog);
});

export default router;
