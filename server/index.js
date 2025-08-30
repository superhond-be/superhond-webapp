// server/index.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Routes (let op: exacte padnamen)
import customersRoutes, { CUSTOMERS } from "./routes/customers.js";
import dogsRoutes, { setCustomersRef as setDogsCustomersRef } from "./routes/dogs.js";
import passesRoutes, { setCustomersRef as setPassesCustomersRef } from "./routes/passes.js";

const app = express();
app.use(express.json());

// __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static files (frontend)
app.use(express.static(path.join(__dirname, "..", "public")));

// API routes
app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);
app.use("/api/passes", passesRoutes);

// Geef de klanten-array door zodat /dogs en /passes aan klanten kunnen koppelen
setDogsCustomersRef(CUSTOMERS);
setPassesCustomersRef(CUSTOMERS);

// Healthcheck
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Root: serve index.html
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Start server (Render gebruikt PORT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
