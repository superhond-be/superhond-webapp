import express from "express";

// --- Routes (alleen één keer importeren) ---
import customersRoutes from "./routes/customers.js";
import dogsRoutes, { setCustomersRef } from "./routes/dogs.js";
import settingsRoutes from "./routes/settings.js";
// (optioneel) als je deze al hebt en werkend zijn, laat staan
// import classesRoutes from "./routes/classes.js";
// import sessionsRoutes from "./routes/sessions.js";

const app = express();
app.use(express.json());

// --- Health/landing ---
app.get("/", (_req, res) => {
  res.send("✅ Superhond backend draait!");
});

// --- In deze volgorde mounten ---
app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);
app.use("/api/settings", settingsRoutes);
// app.use("/api/classes", classesRoutes);
// app.use("/api/sessions", sessionsRoutes);

// --- Koppel customers-array naar dogs.js (setter wordt hieronder gezet) ---
import { CUSTOMERS } from "./routes/customers.js";
setCustomersRef(CUSTOMERS);

// --- Start server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
