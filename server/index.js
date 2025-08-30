// server/index.js
import express from "express";

import customersRoutes from "./routes/customers.js";
import dogsRoutes from "./routes/dogs.js";
import passesRoutes from "./routes/passes.js";
import lessonsRoutes from "./routes/lessons.js";
import purchasesRoutes from "./routes/purchases.js";
import debugRoutes from "./routes/debug.js";

// ...
app.use("/api", purchasesRoutes);
app.use("/api", debugRoutes);
const app = express();
app.use(express.json());

// API routes
app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);
app.use("/api/passes", passesRoutes);
app.use("/api/lessons", lessonsRoutes);
// Health & simple root
app.get("/", (_req, res) => {
  res.type("html").send(`<p style="font:16px/1.4 -apple-system,Segoe UI,Roboto,sans-serif">
    ✅ Superhond backend draait!
  </p>`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
