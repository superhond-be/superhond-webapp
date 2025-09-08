import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import externalRouter from "../routes/external.js";
import { ensureDataDirs } from "../services/store.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.use("/external", externalRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

ensureDataDirs();
app.listen(PORT, () => {
  console.log(`✅ Superhond API draait op http://localhost:${PORT}`);
});
