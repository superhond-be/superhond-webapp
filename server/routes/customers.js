// server/routes/customers.js
import express from "express";

export const CUSTOMERS = [
  // demo klant ter illustratie
  {
    id: 1,
    naam: "Demo Klant",
    email: "demo@example.com",
    phone: "000/00.00.00",
    adres: "",
    honden: [
      {
        id: 1001,
        naam: "Demo Hond",
        ras: "Mix",
        geboortedatum: "2020-01-01",
        geslacht: "reutje",
        vaccinaties: "",
        inentingsboekjeRef: "",
        dierenartsNaam: "",
        dierenartsTel: "",
      },
    ],
  },
];

const router = express.Router();

// alle klanten (met honden)
router.get("/", (_req, res) => {
  res.json(CUSTOMERS);
});

// klant per id
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const klant = CUSTOMERS.find((c) => c.id === id);
  if (!klant) return res.status(404).json({ error: "Klant niet gevonden" });
  res.json(klant);
});

export default router;
