// server/routes/register.js
import express from "express";
import { CUSTOMERS } from "./customers.js";
import registerRoutes from "./routes/register.js";   // ← BOVENIN bij de andere imports
import customersRoutes from "./routes/customers.js";
// ...
app.use("/api/register", registerRoutes);            // ← BIJ DE ROUTE-KOPPELINGEN
const router = express.Router();

// POST /api/register  — registreer klant + optioneel 1 hond
router.post("/", (req, res) => {
  const { klant, hond } = req.body;

  if (!klant || !klant.naam) {
    return res.status(400).json({ error: "Klantgegevens ongeldig" });
  }

  // nieuwe klant-id
  const klantId =
    CUSTOMERS.length > 0 ? CUSTOMERS[CUSTOMERS.length - 1].id + 1 : 1;

  const newCustomer = {
    id: klantId,
    naam: klant.naam || "",
    email: klant.email || "",
    phone: klant.phone || "",
    adres: klant.adres || "",
    honden: []
  };

  // hond toevoegen indien meegegeven
  if (hond) {
    const hondId = Date.now();
    const newDog = {
      id: hondId,
      naam: hond.naam || "",
      ras: hond.ras || "",
      geboortedatum: hond.geboortedatum || "",
      geslacht: hond.geslacht || "",
      vaccinaties: hond.vaccinaties || "",
      inentingsboekjeRef: hond.inentingsboekjeRef || "",
      dierenartsNaam: hond.dierenartsNaam || "",
      dierenartsTel: hond.dierenartsTel || "",
    };
    newCustomer.honden.push(newDog);
  }

  CUSTOMERS.push(newCustomer);
  return res.status(201).json(newCustomer);
});

export default router;
