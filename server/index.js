// server/index.js
import express from "express";

// Routes importeren (exact 1x elk)
import customersRoutes, { CUSTOMERS } from "./routes/customers.js";
import dogsRoutes, { setCustomersRef as connectDogsToCustomers } from "./routes/dogs.js";
import passesRoutes, { setCustomersRef as connectPassesToCustomers } from "./routes/passes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// (optioneel) statische files voor je coach UI
app.use(express.static("public"));

// Healthchecks
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/", (_req, res) => res.send("✅ Superhond backend draait!"));

// API routes
app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);
app.use("/api/passes", passesRoutes);

// Gedeelde referentie naar klanten (voor dogs en passes)
connectDogsToCustomers(CUSTOMERS);
connectPassesToCustomers(CUSTOMERS);

// 404 fallback
app.use((req, res) => res.status(404).json({ error: "Not found" }));

// Error handler (houd het simpel)
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Server error" });
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
