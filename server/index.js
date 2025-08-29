import express from "express";
import customersRoutes, { CUSTOMERS } from "./routes/customers.js";
import dogsRoutes, { setCustomersRef } from "./routes/dogs.js";

// ... je bestaande app/middleware ...
const app = express();
app.use(express.json());

app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);

// geef de klanten-array door aan dogs.js zodat /api/dogs/:customerId kan koppelen
setCustomersRef(CUSTOMERS);

// healthcheck (optioneel)
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ... app.listen staat bij Render niet lokaal nodig (Render start via package.json)
export default app; // mocht je ESM-export willen; Render start via "node server/index.js"
