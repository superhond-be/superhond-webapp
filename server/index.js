// server/index.js
import express from "express";

// --- Routes ---
import classesRoutes from "./routes/classes.js";
import sessionsRoutes from "./routes/sessions.js";
import settingsRoutes from "./routes/settings.js";

// klanten & honden
import customersRoutes, { CUSTOMERS } from "./routes/customers.js";
import dogsRoutes, { setCustomersRef } from "./routes/dogs.js";

// --- App & middleware ---
const app = express();
app.use(express.json());

// --- Routes koppelen ---
app.use("/api/classes", classesRoutes);
app.use("/api/sessions", sessionsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);

// klanten-array doorgeven aan dogs.js zodat /api/dogs/:customerId kan koppelen
setCustomersRef(CUSTOMERS);

// Healthcheck
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// --- Server starten (belangrijk voor Render) ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
