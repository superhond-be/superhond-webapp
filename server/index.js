import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Routers
import customersRoutes from "./routes/customers.js";
 7 import lessonsRoutes from "./routes/lessons.js";
 8 import passesRoutes from "./routes/passes.js";

import passesRoutes from "./routes/passes.js";

// --- App setup (1x definiëren!) ---
const app = express();
app.use(express.json());

// API routes
app.use("/api/customers", customersRoutes);
app.use("/api/passes", passesRoutes);

// Healthcheck
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "superhond-backend" });
});

// (optioneel) statische frontend /public
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "..", "public")));

// Root
app.get("/", (_req, res) => {
  res.send("✅ Superhond backend draait!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
