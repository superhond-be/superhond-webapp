import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Zorg dat we de juiste __dirname hebben in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📌 Deze regel laat alle bestanden in de map 'public' zien
app.use(express.static("public"));

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Root route (als fallback, maar index.html uit /public wordt automatisch getoond)
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Superhond server draait op http://localhost:${PORT}`);
});
