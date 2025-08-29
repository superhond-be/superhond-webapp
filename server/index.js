import express from "express";

import customersRoutes, { CUSTOMERS } from "./routes/customers.js";
import dogsRoutes, { setCustomersRef } from "./routes/dogs.js";

const app = express();
app.use(express.json());

// --- Routes koppelen ---
app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);

// --- Klanten-array doorgeven aan dogs.js zodat koppelen werkt ---
setCustomersRef(CUSTOMERS);

// --- Healthcheck ---
app.get("/", (req, res) => {
  res.send("✅ Superhond backend draait!");
});

// --- Server starten ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server draait op poort ${PORT}`);
});
