// server/index.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// ---- Routes (let op: exacte paden, geen dubbele 'routes') ----
import customersRoutes, { CUSTOMERS } from "./routes/customers.js";
import dogsRoutes, { setCustomersRef } from "./routes/dogs.js";
import settingsRoutes from "./routes/settings.js";
// Heb je later extra routes (bijv. classes/sessions/passes)? Voeg ze hier toe:
// import classesRoutes from "./routes/classes.js";
// import sessionsRoutes from "./routes/sessions.js";
// import passesRoutes from "./routes/passes.js";

// ---- App & middleware ----
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files uit /public
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../public")));

// Healthcheck
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ---- Routes koppelen (elk maar 1x) ----
app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);
app.use("/api/settings", settingsRoutes);
// app.use("/api/classes", classesRoutes);
// app.use("/api/sessions", sessionsRoutes);
// app.use("/api/passes", passesRoutes);

// Geef de klanten-referentie door aan dogs.js (voor koppeling hond->klant)
if (typeof setCustomersRef === "function") {
  setCustomersRef(CUSTOMERS);
}

// 404 voor onbekende API-routes
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

// Fallback: overige routes naar frontend (single page)
app.get("*", (_req, res) =>
  res.sendFile(path.join(__dirname, "../public/index.html"))
);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
