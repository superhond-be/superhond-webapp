import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// Statische bestanden (publiek + admin)
app.use(express.static(path.join(__dirname, "..", "public")));

// Admin root -> /public/admin/index.html
app.get("/admin/", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "admin", "index.html"));
});

// Healthcheck
app.get("/healthz", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Superhond server luistert op ${PORT}`);
});
