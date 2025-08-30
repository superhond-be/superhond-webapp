import express from "express";
import customersRoutes from "./routes/customers.js";
import dogsRoutes from "./routes/dogs.js";
import settingsRoutes from "./routes/settings.js";
import passesRoutes from "./routes/passes.js"; // nieuw toegevoegd

const app = express();
app.use(express.json());

// Koppelen van routes
app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/passes", passesRoutes); // moet hier NA const app

// Healthcheck
app.get("/", (_req, res) => {
  res.send("✅ Superhond backend draait!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
