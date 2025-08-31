// server/index.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// ---- Routes importeren ----
import customersRoutes from "./routes/customers.js";
import dogsRoutes from "./routes/dogs.js";
import passesRoutes from "./routes/passes.js";
import lessonsRoutes from "./routes/lessons.js";
import settingsRoutes from "./routes/settings.js";
import integrationsRoutes from "./routes/integrations.js";
import lessonsRoutes from "./routes/lessons.js";
app.use("/api/lessons", lessonsRoutes);
// ---- Basis setup ----
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- API routes koppelen ----
app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);
app.use("/api/passes", passesRoutes);
app.use("/api/lessons", lessonsRoutes);
app.use("/api/settings", settingsRoutes);
app.use(integrationsRoutes); // deze definieert zelf /api/integrations/...

// ---- Static files (frontend) ----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../public")));

// ---- Health check ----
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ---- Server starten ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server draait op poort ${PORT}`);
});
