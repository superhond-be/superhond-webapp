// server/index.js
import express from "express";
import customersRoutes, { CUSTOMERS } from "./routes/customers.js";
import dogsRoutes, { setCustomersRef as setDogsCustomersRef } from "./routes/dogs.js";
import passesRoutes, { setCustomersRef as setPassesCustomersRef } from "./routes/passes.js";
import settingsRoutes from "./routes/settings.js";

const app = express();
app.use(express.json());
app.use(express.static("public"));

// Zorg dat dogs.js en passes.js toegang hebben tot dezelfde CUSTOMERS array
setDogsCustomersRef(CUSTOMERS);
setPassesCustomersRef(CUSTOMERS);

// Routes
app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);
app.use("/api/passes", passesRoutes);
app.use("/api/settings", settingsRoutes);

// Root
app.get("/api", (req, res) => {
  res.json({ message: "Superhond backend draait!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server draait op poort ${PORT}`);
});

export default app;
