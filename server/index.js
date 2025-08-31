// server/index.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Routes importeren
import customersRoutes, { CUSTOMERS } from "./routes/customers.js";
import dogsRoutes, { setCustomersRef as connectDogsToCustomers } from "./routes/dogs.js";
import passesRoutes, { setCustomersRef as connectPassesToCustomers } from "./routes/passes.js";
import lessonsRoutes from "./routes/lessons.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Static files (frontend in public/)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../public")));

// Healthcheck
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// API routes
app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);
app.use("/api/passes", passesRoutes);
app.use("/api/lessons", lessonsRoutes);

// Referenties leggen
connectDogsToCustomers(CUSTOMERS);
connectPassesToCustomers(CUSTOMERS);

// 404 fallback voor API
app.use("/api/*", (_req, res) => res.status(404).json({ error: "Not found" }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Superhond server draait op poort ${PORT}`);
});

export default app;
