import bookingsRoutes from "./routes/bookings.js";
app.use("/api/bookings", bookingsRoutes);

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import classesRoutes from "./routes/classes.js";
import sessionsRoutes from "./routes/sessions.js";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Routes
app.use("/api/classes", classesRoutes);
app.use("/api/sessions", sessionsRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`✅ Superhond server draait op http://localhost:${PORT}`);
});
