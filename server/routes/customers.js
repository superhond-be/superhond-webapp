import express from "express";
import customersRoutes, { CUSTOMERS } from "./routes/customers.js";
import dogsRoutes, { setCustomersRef } from "./routes/dogs.js";
import settingsRoutes from "./routes/settings.js";
import passesRoutes from "./routes/passes.js";

const app = express();
app.use(express.json());

// Koppel routes
app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/passes", passesRoutes);

// Geef referentie door zodat dogs toegang heeft tot CUSTOMERS
setCustomersRef(CUSTOMERS);

// Healthcheck
app.get("/", (req, res) => {
  res.send("✅ Superhond backend draait!");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
