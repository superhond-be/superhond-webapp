const express = require("express");
const router = express.Router();

let dogs = [];

// GET alle honden (optioneel filter op customerId)
router.get("/", (req, res) => {
  const { customerId } = req.query;
  if (customerId) {
    return res.json(dogs.filter(d => d.customerId === Number(customerId)));
  }
  res.json(dogs);
});

// GET hond op ID
router.get("/:id", (req, res) => {
  const dog = dogs.find(d => d.id === Number(req.params.id));
  if (!dog) return res.status(404).json({ message: "Hond niet gevonden" });
  res.json(dog);
});

// POST nieuwe hond
router.post("/", (req, res) => {
  const {
    name,
    breed,
    birthDate,
    gender,
    vetPhone,
    vetName,
    vaccinationStatus,
    passportRef,
    emergencyPhone,
    customerId,
    photoUrl
  } = req.body;

  const newDog = {
    id: dogs.length + 1,
    name: name || "",
    breed: breed || "",
    birthDate: birthDate || null,
    gender: gender || "-",
    vetPhone: vetPhone || "",
    vetName: vetName || "",
    vaccinationStatus: vaccinationStatus || "",
    passportRef: passportRef || "",
    emergencyPhone: emergencyPhone || "",
    customerId: customerId ? Number(customerId) : null,
    photoUrl: photoUrl || null
  };

  dogs.push(newDog);
  res.status(201).json(newDog);
});

// PUT hond bijwerken
router.put("/:id", (req, res) => {
  const dog = dogs.find(d => d.id === Number(req.params.id));
  if (!dog) return res.status(404).json({ message: "Hond niet gevonden" });

  Object.assign(dog, {
    name: req.body.name ?? dog.name,
    breed: req.body.breed ?? dog.breed,
    birthDate: req.body.birthDate ?? dog.birthDate,
    gender: req.body.gender ?? dog.gender,
    vetPhone: req.body.vetPhone ?? dog.vetPhone,
    vetName: req.body.vetName ?? dog.vetName,
    vaccinationStatus: req.body.vaccinationStatus ?? dog.vaccinationStatus,
    passportRef: req.body.passportRef ?? dog.passportRef,
    emergencyPhone: req.body.emergencyPhone ?? dog.emergencyPhone,
    customerId: req.body.customerId !== undefined ? Number(req.body.customerId) : dog.customerId,
    photoUrl: req.body.photoUrl ?? dog.photoUrl
  });

  res.json(dog);
});

// DELETE hond
router.delete("/:id", (req, res) => {
  const before = dogs.length;
  dogs = dogs.filter(d => d.id !== Number(req.params.id));
  if (dogs.length === before) {
    return res.status(404).json({ message: "Hond niet gevonden" });
  }
  res.json({ message: "Hond verwijderd" });
});

module.exports = router;
