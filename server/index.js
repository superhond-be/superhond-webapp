import express from "express";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// >>> heel belangrijk: statische files uit /public
app.use(express.static(path.join(__dirname, "..", "public")));

// (je API-routes hier, bv. app.use("/api/customers", customersRoutes); )

// healthcheck mag blijven, maar NIET op "/"
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// >>> root route moet index.html geven
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
// --- Routes (alleen één keer importeren) ---
import customersRoutes from "./routes/customers.js";
import dogsRoutes, { setCustomersRef } from "./routes/dogs.js";
import settingsRoutes from "./routes/settings.js";
// (optioneel) als je deze al hebt en werkend zijn, laat staan
// import classesRoutes from "./routes/classes.js";
// import sessionsRoutes from "./routes/sessions.js";

const app = express();
app.use(express.json());

// --- Health/landing ---
app.get("/", (_req, res) => {
  res.send("✅ Superhond backend draait!");
});

// --- In deze volgorde mounten ---
app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);
app.use("/api/settings", settingsRoutes);
// app.use("/api/classes", classesRoutes);
// app.use("/api/sessions", sessionsRoutes);

// --- Koppel customers-array naar dogs.js (setter wordt hieronder gezet) ---
import { CUSTOMERS } from "./routes/customers.js";
setCustomersRef(CUSTOMERS);

// --- Start server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
