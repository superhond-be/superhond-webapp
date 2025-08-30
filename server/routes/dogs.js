// server/routes/dogs.js
import express from "express";
const router = express.Router();

// In-memory honden
let DOGS = [];
let NEXT_DOG_ID = 1;

/**
 * GET /api/dogs
 * Optionele filter: ?customerId=123
 */
router.get("/", (req, res) => {
  const { customerId } = req.query || {};
  const list = customerId
    ? DOGS.filter(d => String(d.customerId) === String(customerId))
    : DOGS;
  res.json(list);
});

/**
 * POST /api/dogs/:customerId
 * Body: { name, breed, birthDate, sex, vaxStatus, bookletRef, vetPhone, vetName, emergencyPhone }
 */
router.post("/:customerId", (req, res) => {
  const customerId = Number(req.params.customerId);
  if (!customerId) return res.status(400).json({ error: "customerId ontbreekt" });

  const {
    name,
    breed = "",
    birthDate = "",
    sex = "",
    vaxStatus = "",
    bookletRef = "",
    vetPhone = "",
    vetName = "",
    emergencyPhone = "",
  } = req.body || {};

  if (!name) return res.status(400).json({ error: "Naam hond is verplicht" });

  const dog = {
    id: NEXT_DOG_ID++,
    customerId,
    name,
    breed,
    birthDate,
    sex,
    vaxStatus,
    bookletRef,
    vetPhone,
    vetName,
    emergencyPhone,
  };

  DOGS.push(dog);
  res.status(201).json(dog);
});

export default router;
