// server/index.js
import express from "express";

// Routers importeren — LET OP: default én named kloppen
import customersRoutes from "./routes/customers.js";
import dogsRoutes, { setCustomersRef } from "./routes/dogs.js";
import passesRoutes from "./routes/passes.js";
import sessionsRoutes from "./routes/sessions.js"; // simple placeholder

const app = express();
app.use(express.json());

// eerst routers koppelen waarvoor geen extra init nodig is
app.use("/api/customers", customersRoutes);
app.use("/api/passes", passesRoutes);
app.use("/api/sessions", sessionsRoutes);

// dogsRoutes heeft een verwijzing naar de customers-array nodig.
// Die krijgt hij via setCustomersRef (wordt door customers.js geëxporteerd).
import { CUSTOMERS_REF } from "./routes/customers.js";
setCustomersRef(CUSTOMERS_REF);
app.use("/api/dogs", dogsRoutes);

// healthcheck en statische files
app.get("/", (_req, res) => res.send("✅ Superhond backend draait!"));
app.use(express.static("public", { extensions: ["html"] }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
