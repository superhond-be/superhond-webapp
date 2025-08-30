// server/index.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// ===== Routes =====
import customersRoutes, { CUSTOMERS } from "./routes/customers.js";
import dogsRoutes, { setCustomersRef } from "./routes/dogs.js";
import passesRoutes from "./routes/passes.js";     // ok als dit nog niet bestaat, anders weghalen
import settingsRoutes from "./routes/settings.js"; // idem: alleen laten staan als het bestaat

// ===== App setup =====
const app = express();
app.use(express.json());

// (optioneel) statische bestanden uit /public serveren
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../public")));

// ===== Koppelingen =====
app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);
app.use("/api/passes", passesRoutes);       // haal weg als /routes/passes.js niet bestaat
app.use("/api/settings", settingsRoutes);   // haal weg als /routes/settings.js niet bestaat

// Heel belangrijk: geef dogs.js de referentie naar de klanten-array
setCustomersRef(CUSTOMERS);

// ===== Healthcheck & fallback =====
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// (optioneel) HTML fallback voor SPA: index.html serveren
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// ===== Start server =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

export default app;
