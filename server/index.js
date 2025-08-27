app.use("/api/classes", classesRoutes);
app.use("/api/sessions", sessionsRoutes);

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import classesRoutes from "./routes/classes.js";
import sessionsRoutes from "./routes/sessions.js";
import bookingsRoutes from "./routes/bookings.js";
app.use("/api/bookings", bookingsRoutes);
const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Healthcheck
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// API
app.use("/api/classes", classesRoutes);
app.use("/api/sessions", sessionsRoutes);

// Start
app.listen(PORT, () => {
  console.log(`✅ Superhond server draait op http://localhost:${PORT}`);
});
