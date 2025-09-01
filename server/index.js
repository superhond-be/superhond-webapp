// server/index.js

// ====== Imports ======
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Routes importeren
import customersRoutes from "./routes/customers.js";
import dogsRoutes from "./routes/dogs.js";
import passesRoutes from "./routes/passes.js";
import lessonsRoutes from "./routes/lessons.js";
import debugRoutes from "./routes/debug.js";
import searchRoutes from "./routes/search.js";

// ...
app.use("/api/debug", debugRoutes);
app.use("/api/search", searchRoutes);

// ====== Helpers voor __dirname (werkt in ES Modules) ======
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ====== Express app ======
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public map beschikbaar maken
app.use(express.static(path.join(__dirname, "../public")));

// ====== API routes ======
app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);
app.use("/api/passes", passesRoutes);
app.use("/api/lessons", lessonsRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server draait correct 🚀" });
});

// ====== Start server ======
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
