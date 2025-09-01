import express from "express";
const router = express.Router();

// Alle klanten ophalen
router.get("/", (req, res) => {
  res.json([
    { id: 1, name: "Jan Jansen", email: "jan@example.com" },
    { id: 2, name: "Piet Pieters", email: "piet@example.com" }
  ]);
});

// Nieuwe klant toevoegen
router.post("/", (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Naam en e-mail zijn verplicht" });
  }
  const newCustomer = { id: Date.now(), name, email };
  res.status(201).json(newCustomer);
});

export default router;
