import express from "express";

const router = express.Router();

// In-memory opslag (later kan dit naar database)
let customers = []; // [{ id, name, email, phone, dogs: [], passes: [] }]
let customerIdCounter = 1;
let dogIdCounter = 1;
let passIdCounter = 1;

// Nieuwe klant registreren
router.post("/register", (req, res) => {
  const { name, email, phone } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Naam en e-mail zijn verplicht" });
  }

  const newCustomer = {
    id: customerIdCounter++,
    name,
    email,
    phone: phone || "",
    dogs: [],
    passes: []
  };

  customers.push(newCustomer);
  res.status(201).json(newCustomer);
});

// Hond koppelen aan klant
router.post("/:customerId/add-dog", (req, res) => {
  const { customerId } = req.params;
  const { name, breed, birthdate, gender } = req.body;

  const customer = customers.find(c => c.id == customerId);
  if (!customer) {
    return res.status(404).json({ error: "Klant niet gevonden" });
  }

  const newDog = {
    id: dogIdCounter++,
    name,
    breed,
    birthdate,
    gender
  };

  customer.dogs.push(newDog);
  res.status(201).json(newDog);
});

// Strippenkaart koppelen aan klant (en evt hond)
router.post("/:customerId/add-pass", (req, res) => {
  const { customerId } = req.params;
  const { type, totalStrips, dogId } = req.body;

  const customer = customers.find(c => c.id == customerId);
  if (!customer) {
    return res.status(404).json({ error: "Klant niet gevonden" });
  }

  const newPass = {
    id: passIdCounter++,
    type,               // bv. "Puppycursus"
    totalStrips,        // bv. 9 lessen
    usedStrips: 0,
    dogId: dogId || null,
  };

  customer.passes.push(newPass);
  res.status(201).json(newPass);
});

// Alle klanten ophalen
router.get("/", (req, res) => {
  res.json(customers);
});

// Specifieke klant ophalen
router.get("/:customerId", (req, res) => {
  const { customerId } = req.params;
  const customer = customers.find(c => c.id == customerId);
  if (!customer) {
    return res.status(404).json({ error: "Klant niet gevonden" });
  }
  res.json(customer);
});

// Strip gebruiken
router.post("/:customerId/use-strip/:passId", (req, res) => {
  const { customerId, passId } = req.params;

  const customer = customers.find(c => c.id == customerId);
  if (!customer) {
    return res.status(404).json({ error: "Klant niet gevonden" });
  }

  const pass = customer.passes.find(p => p.id == passId);
  if (!pass) {
    return res.status(404).json({ error: "Strippenkaart niet gevonden" });
  }

  if (pass.usedStrips >= pass.totalStrips) {
    return res.status(400).json({ error: "Geen strippen meer beschikbaar" });
  }

  pass.usedStrips++;
  res.json({ message: "Strip gebruikt", pass });
});

export default router;
