// server/index.js
// ESM entrypoint voor de Superhond backend

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// --- Routers importeren (allemaal default exports) ---
import settingsRoutes from "./routes/settings.js";
import classesRoutes from "./routes/classes.js";
import sessionsRoutes from "./routes/sessions.js";
import customersRoutes, { CUSTOMERS } from "./routes/customers.js";
import dogsRoutes, { setCustomersRef } from "./routes/dogs.js";
import registerRoutes from "./routes/register.js"; // gecombineerde registratie klant+dog

// -----------------------------------------------------

// Nodig om __dirname te hebben in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App aanmaken (let op: maar één keer!)
const app = express();

// Middleware
app.use(express.json());

// --- API routes koppelen ---
app.use("/api/settings", settingsRoutes);
app.use("/api/classes", classesRoutes);
app.use("/api/sessions", sessionsRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);
app.use("/api/register", registerRoutes);

// Zorg dat dogs-routes de customers-array kennen (voor koppelen hond→klant)
if (typeof setCustomersRef === "function") {
  setCustomersRef(CUSTOMERS);
}

// Healthcheck
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Statische frontend uit /public serveren
app.use(express.static(path.join(__dirname, "../public")));
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Server starten
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// (optioneel) export voor tests
export default app;
