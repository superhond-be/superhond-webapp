// server/routes/customers.js
import express from "express";
const router = express.Router();

// In-memory klanten
let CUSTOMERS = [];
let NEXT_CUSTOMER_ID = 1;

// Alle klanten
router.get("/", (_req, res) => {
  res.json(CUSTOMERS);
});

// Nieuwe klant (zonder hond) – frontend kan ook klant + hond in 2 stappen doen
router.post("/", (req, res) => {
  const { name, email, phone } = req.body || {};
  if (!name) return res.status(400).json({ error: "Naam is verplicht" });

  const customer = {
    id: NEXT_CUSTOMER_ID++,
    name,
    email: email || "",
    phone: phone || "",
  };
  CUSTOMERS.push(customer);
  res.status(201).json(customer);
});

// BOVENAAN bij de imports
import passesRoutes, { setCustomersRef as setPassesCustomersRef } from "./routes/passes.js";
import customersRoutes, { CUSTOMERS } from "./routes/customers.js";

// ... je bestaande code, app = express(), etc.

app.use("/api/customers", customersRoutes);

// Geef de referentie naar de klanten door aan passes.js
setPassesCustomersRef(CUSTOMERS);

// Mount de passes routes
app.use("/api/passes", passesRoutes);

export default router;
