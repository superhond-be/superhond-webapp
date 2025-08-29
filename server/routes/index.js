import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import classesRoutes from "./routes/classes.js";
import sessionsRoutes from "./routes/sessions.js";
import settingsRoutes from "./routes/settings.js";

import customersRoutes from "./routes/customers.js";
import dogsRoutes, { setCustomersRef } from "./routes/dogs.js";

const router = express.Router();
import settingsRoutes from "./routes/settings.js";
app.use("/api/settings", settingsRoutes);
import taxonomiesRoutes from "./routes/taxonomies.js";
app.use("/api/taxonomies", taxonomiesRoutes);

// Demo data (mag later uit DB komen)
let classes = [
  { id: 1, name: "Puppy Pack (beginners)", trainer: "Paul" },
  { id: 2, name: "Puppy Pack (gevorderden)", trainer: "Nancy" },
  { id: 3, name: "Puber Coachgroep", trainer: "Team" }
];

// Alle klassen
router.get("/", (_req, res) => {
  res.json(classes);
});

// Eén klas op id
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const cls = classes.find(c => c.id === id);
  if (!cls) return res.status(404).json({ error: "Klas niet gevonden" });
  res.json(cls);
});

export default router;
