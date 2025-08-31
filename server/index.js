// src/server/index.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// --- App setup
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Routes (alleen deze twee voor een stabiele baseline)
import customersRoutes from "./routes/customers.js";
import dogsRoutes from "./routes/dogs.js";

app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);

// --- Healthcheck
app.get("/health", (_req, res) => res.json({ ok: true }));

// --- Static frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../public")));
app.get("/", (_req, res) =>
  res.sendFile(path.join(__dirname, "../public/index.html"))
);

// --- Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
