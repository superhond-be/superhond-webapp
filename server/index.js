// server/index.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import classesRoutes from "./routes/classes.js";
import sessionsRoutes from "./routes/sessions.js";
import settingsRoutes from "./routes/settings.js";

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// (optioneel) statische bestanden uit /public
app.use(express.static("public"));

// Healthcheck
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// API routes
app.use("/api/classes", classesRoutes);
app.use("/api/sessions", sessionsRoutes);
app.use("/api/settings", settingsRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Superhond server draait op http://localhost:${PORT}`);
});
