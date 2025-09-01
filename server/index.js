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

// ====== Setup pad helpers ======
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ====== Express app ======
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// ====== Routes ======
app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);
app.use("/api/passes", passesRoutes);
app.use("/api/lessons", lessonsRoutes);

// ====== Start server ======
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
