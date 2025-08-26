import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import classesRouter from "./routes/classes.js"; // <-- nieuwe import

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Healthcheck
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// Routes
app.use("/api/classes", classesRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Superhond server draait op http://localhost:${PORT}`);
});
