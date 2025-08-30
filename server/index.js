// server/index.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// --- Routes (elk precies één keer importeren) ---
import settingsRoutes from "./routes/settings.js";
import customersRoutes, { CUSTOMERS } from "./routes/customers.js";
import dogsRoutes, { setCustomersRef } from "./routes/dogs.js";
import passesRoutes from "./routes/passes.js";

// ------------------------------------------------

const app = express();
app.use(express.json());

// Static files (public/)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../public")));

// Root -> index.html uit public serveren
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Healthcheck
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// Zorg dat dogs.js de klanten kan zien voor koppelen hond->klant
setCustomersRef(CUSTOMERS);

// API routes (elk precies één keer koppelen)
app.use("/api/settings", settingsRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);
app.use("/api/passes", passesRoutes);

// Server starten (let op: slechts één app.listen in het hele project)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
