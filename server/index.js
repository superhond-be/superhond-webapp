// server/index.js
import express from "express";

import packsRoutes from "./routes/packs.js";
import bookingsRoutes from "./routes/bookings.js";

app.use("/api/packs", packsRoutes);
app.use("/api/bookings", bookingsRoutes);


// ---- Routes importeren ----
import classesRoutes from "./routes/classes.js";
import sessionsRoutes from "./routes/sessions.js";
import settingsRoutes from "./routes/settings.js";
import customersRoutes, { CUSTOMERS } from "./routes/customers.js";
import dogsRoutes, { setCustomersRef } from "./routes/dogs.js";
h
// ---- Express app ----
const app = express();
app.use(express.json());

// ---- Statische frontend bestanden ----
// Alles wat in /public staat wordt bediend (index.html, app.js, styles.css, ...)
app.use(express.static("public"));

// ---- API Routes ----
app.use("/api/classes", classesRoutes);
app.use("/api/sessions", sessionsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);

// ---- Healthcheck ----
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Superhond backend draait!" });
});

// ---- Koppel klanten-array door naar dogs.js ----
setCustomersRef(CUSTOMERS);

// ---- Start server ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server draait op poort ${PORT}`);
});

// ---- Exporteren voor testen ----
export default app;
