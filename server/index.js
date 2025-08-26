import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

// ⬇️ database initialiseren (maakt tabellen aan via db.js)
import "./db.js";

import classesRouter from "./routes/classes.js";
import sessionsRouter from "./routes/sessions.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Static files uit /public
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../public")));

// Health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// API-routes
app.use("/api/classes", classesRouter);
app.use("/api/sessions", sessionsRouter);

// Fallback naar homepage
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Superhond server draait op http://localhost:${PORT}`);
});
