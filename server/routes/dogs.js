const express = require("express");
const { store, nextId } = require("../store"); // gedeelde in-memory data

const router = express.Router();

// ========================================================================
// GET /api/dogs
// Optioneel: ?customerId=123 filter op eigenaar
// ========================================================================
router.get("/", (req, res) => {
  const { customerId } = req.query;
  if (customerId) {
    return res.json(store.dogs.filter(d => d.customerId === Number(customerId)));
  }
  res.json(store.dogs);
});

// ========================================================================
// GET /api/dogs/:id
// ========================================================================
router.get("/:id", (req, res) => {
  const dog = store.dogs.find(d => d.id === Number(req.params.id));
  if (!dog) return res.status(404).json({ message: "Hond niet gevonden" });
  res.json(dog);
});

// ========================================================================
// POST /api/dogs
// Body: { name, breed, birthdate, gender, vaccinationStatus, passportRef,
//         vetPhone, vetName, emergencyPhone, customerId, photoUrl }
// ========================================================================
router.post("/", (req, res) => {
  const b = req.body || {};
  if (!b.name) return res.status(400).json({ message: "name is verplicht" });
  if (!b.customerId) return res.status(400).json({ message: "customerId is verplicht" });

  const owner = store.customers.find(c => c.id === Number(b.customerId));
  if (!owner) return res.status(404).json({ message: "Klant (customerId) niet gevonden" });

  const dog = {
    id: nextId(store.dogs),
    customerId: Number(b.customerId),
    name: String(b.name).trim(),
    breed: (b.breed || "").trim(),
    birthdate: (b.birthdate || "").trim(),
    gender: (b.gender || "").trim(),
    vaccinationStatus: (b.vaccinationStatus || "").trim(),
    passportRef: (b.passportRef || "").trim(),
    vetPhone: (b.vetPhone || "").trim(),
    vetName: (b.vetName || "").trim(),
    emergencyPhone: (b.emergencyPhone || "").trim(),
    photoUrl: (b.photoUrl || "").trim() || null
  };

  store.dogs.push(dog);
  res.status(201).json(dog);
});

// ========================================================================
// PUT /api/dogs/:id
// ========================================================================
router.put("/:id", (req, res) => {
  const dog = store.dogs.find(d => d.id === Number(req.params.id));
  if (!dog) return res.status(404).json({ message: "Hond niet gevonden" });

  const b = req.body || {};
  if (b.customerId !== undefined) {
    const owner = store.customers.find(c => c.id === Number(b.customerId));
    if (!owner) return res.status(404).json({ message: "Nieuwe klant (customerId) niet gevonden" });
    dog.customerId = Number(b.customerId);
  }

  dog.name = b.name ?? dog.name;
  dog.breed = b.breed ?? dog.breed;
  dog.birthdate = b.birthdate ?? dog.birthdate;
  dog.gender = b.gender ?? dog.gender;
  dog.vaccinationStatus = b.vaccinationStatus ?? dog.vaccinationStatus;
  dog.passportRef = b.passportRef ?? dog.passportRef;
  dog.vetPhone = b.vetPhone ?? dog.vetPhone;
  dog.vetName = b.vetName ?? dog.vetName;
  dog.emergencyPhone = b.emergencyPhone ?? dog.emergencyPhone;
  dog.photoUrl = b.photoUrl ?? dog.photoUrl;

  res.json(dog);
});

// ========================================================================
// DELETE /api/dogs/:id
// Verwijdert ook alle passes gekoppeld aan deze hond (cascade light)
// ========================================================================
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const before = store.dogs.length;
  store.dogs = store.dogs.filter(d => d.id !== id);
  if (store.dogs.length === before) {
    return res.status(404).json({ message: "Hond niet gevonden" });
  }
  // gekoppelde passes opruimen
  store.passes = store.passes.filter(p => p.dogId !== id);
  res.json({ message: "Hond + gekoppelde strippenkaarten verwijderd" });
});

module.exports = router;
