import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import customersRoutes from "./routes/customers.js";
import dogsRoutes from "./routes/dogs.js";

import customersRoutes, { CUSTOMERS } from "./routes/customers.js";
import dogsRoutes, { setCustomersRef } from "./routes/dogs.js";

app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);


app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));
// (andere app.use's…)

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Superhond server draait op http://localhost:${PORT}`));
// heel belangrijk: dit onderaan zetten
setCustomersRef(CUSTOMERS);
