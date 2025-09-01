const express = require("express");
const router = express.Router();

let customers = [];

// GET alle klanten
router.get("/", (req, res) => {
  res.json(customers);
});

// GET klant op ID
router.get("/:id", (req, res) => {
  const customer = customers.find(c => c.id === parseInt(req.params.id));
  if (!customer) return res.status(404).json({ message: "Klant niet gevonden" });
  res.json(customer);
});

// POST nieuwe klant
router.post("/", (req, res) => {
  const newCustomer = {
    id: customers.length + 1,
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    lessons: req.body.lessons || [],
    dogs: req.body.dogs || []
  };
  customers.push(newCustomer);
  res.status(201).json(newCustomer);
});

// PUT klant bijwerken
router.put("/:id", (req, res) => {
  const customer = customers.find(c => c.id === parseInt(req.params.id));
  if (!customer) return res.status(404).json({ message: "Klant niet gevonden" });

  customer.name = req.body.name || customer.name;
  customer.email = req.body.email || customer.email;
  customer.phone = req.body.phone || customer.phone;
  customer.lessons = req.body.lessons || customer.lessons;
  customer.dogs = req.body.dogs || customer.dogs;

  res.json(customer);
});

// DELETE klant
router.delete("/:id", (req, res) => {
  customers = customers.filter(c => c.id !== parseInt(req.params.id));
  res.json({ message: "Klant verwijderd" });
});

module.exports = router;
