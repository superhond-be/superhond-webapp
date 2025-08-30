// server/routes/register.js
import express from "express";
import { CUSTOMERS } from "./customers.js";
import registerRoutes from "./routes/register.js";
const router = express.Router();

// POST /api/register
// Registreer een klant én (optioneel) een hond tegelijk
router.post("/", (req, res) => {
  const { klant, hond } = req.body;

  if (!klant || !klant.naam) {
    return res.status(400).json({ error: "Klantgegevens ongeldig" });
  }

  // Nieuwe klant-ID
  const klantId = CUSTOMERS.length > 0 ? CUSTOMERS[CUSTOMERS.length - 1].id + 1 : 1;

  const newCustomer = {
    id: klantId,
    ...klant,
    honden: []
  };

  // Hond toevoegen als meegegeven
  if (hond) {
    const hondId = Date.now(); // simpel unieke ID
    const newDog = { id: hondId, ...hond, klantId };
    newCustomer.honden.push(newDog);
  }

  CUSTOMERS.push(newCustomer);

  res.status(201).json(newCustomer);
});

export default router;
