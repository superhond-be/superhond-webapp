// server/index.js
import express from "express";

// --- Routes importeren (elk precies één keer!) ---
import customersRoutes from "./routes/customers.js";
import dogsRoutes from "./routes/dogs.js";
import passesRoutes from "./routes/passes.js";
import settingsRoutes from "./routes/settings.js";

// --- App & middleware ---
const app = express();
app.use(express.json());

// Public map serven (frontend)
app.use(express.static("public"));

// --- API route-koppelingen (elk precies één keer!) ---
app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);
app.use("/api/passes", passesRoutes);
app.use("/api/settings", settingsRoutes);

// Healthcheck (handig voor Render)
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Root laat de frontend zien (als index.html bestaat in /public)
app.get("/", (_req, res) => {
  res.sendFile("index.html", { root: "public" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server draait op poort ${PORT}`);
});

export default app;
