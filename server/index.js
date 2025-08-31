// server/index.js
import express from "express";

// --- Routes (allemaal als default import om naam-conflicten te vermijden)
import customersRoutes from "./routes/customers.js";
import dogsRoutes from "./routes/dogs.js";
import settingsRoutes from "./routes/settings.js";
import lessonsRoutes from "./routes/lessons.js";
import purchasesRoutes from "./routes/purchases.js";
import passesRoutes from "./routes/passes.js"; // <— NIEUW

const app = express();

// --- Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (frontend)
app.use(express.static("public", { index: "index.html" }));

// --- Healthchecks
app.get("/", (_req, res) => {
  res.type("text").send("✅ Superhond backend draait!");
});
app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// --- API routes
if (customersRoutes) app.use("/api/customers", customersRoutes);
if (dogsRoutes) app.use("/api/dogs", dogsRoutes);
if (settingsRoutes) app.use("/api/settings", settingsRoutes);
if (lessonsRoutes) app.use("/api/lessons", lessonsRoutes);
if (purchasesRoutes) app.use("/api/purchases", purchasesRoutes);
if (passesRoutes) app.use("/api/passes", passesRoutes); // <— NIEUW

// --- Starten (werkt op Render/Node, blijft compatibel met import als module)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
