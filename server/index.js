// server/index.js
import express from "express";

// Routes importeren (altijd vanuit ./routes/)
import customersRoutes from "./routes/customers.js";
import dogsRoutes from "./routes/dogs.js";
import settingsRoutes from "./routes/settings.js";

// Express app aanmaken
const app = express();
app.use(express.json());

// Routes koppelen
app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);
app.use("/api/settings", settingsRoutes);

// Healthcheck
app.get("/", (req, res) => {
  res.send("✅ Superhond backend draait!");
});

// Poort instellen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
