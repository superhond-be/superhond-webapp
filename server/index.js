import express from "express";
import classesRoutes from "./routes/classes.js";
import sessionsRoutes from "./routes/sessions.js";
import settingsRoutes from "./routes/settings.js";
import customersRoutes, { CUSTOMERS } from "./routes/customers.js";
import dogsRoutes, { setCustomersRef } from "./routes/dogs.js";

const app = express();
app.use(express.json());

// --- bestaande routes ---
app.use("/api/classes", classesRoutes);
app.use("/api/sessions", sessionsRoutes);
app.use("/api/settings", settingsRoutes);

// --- nieuwe routes ---
app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);

// geef de klanten-array door aan dogs.js zodat koppeling hond <-> klant werkt
setCustomersRef(CUSTOMERS);

// healthcheck
app.get("/api/health", (_req, res) => res.json({ ok: true }));

export default app; // nodig voor ESM (Render start via package.json)
