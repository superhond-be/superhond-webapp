import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import classesRoutes from "./routes/classes.js";
import sessionsRoutes from "./routes/sessions.js";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

// (optioneel) static files als je /public hebt:
app.use(express.static("public"));

// Healthcheck voor Render
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// API routes
app.use("/api/classes", classesRoutes);
app.use("/api/sessions", sessionsRoutes);

app.listen(PORT, () => {
  console.log(`Superhond server draait op http://localhost:${PORT}`);
});
