// ==========================
// Superhond Backend - index.js
// ==========================
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// imports van routes
import customersRoutes from "./routes/customers.js";
import dogsRoutes from "./routes/dogs.js";
import packsRoutes from "./routes/packs.js";
import bookingsRoutes from "./routes/bookings.js";
import settingsRoutes from "./routes/settings.js";
app.use("/api/settings", settingsRoutes);

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

// static files (frontend)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../public")));

// API routes
app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);
app.use("/api/packs", packsRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/sessions", sessionsRoutes);
app.use("/api/settings", settingsRoutes);

// healthcheck
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// fallback: serve index.html voor SPA routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// start server
app.listen(PORT, () => {
  console.log(`✅ Superhond backend draait op poort ${PORT}`);
});
