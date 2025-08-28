import express from "express";
const router = express.Router();
import settingsRoutes from "./routes/settings.js";
app.use("/api/settings", settingsRoutes);
// Tijdelijke in-memory settings
let SETTINGS = {
  org: "Superhond",
  naam: "Superhond.be",
  adres: "Voorbeeldstraat 1, 2470 Retie",
  telefoon: "014/123456",
  email: "info@superhond.be"
};

// Ophalen van settings
router.get("/", (req, res) => {
  res.json(SETTINGS);
});

// Updaten van settings
router.post("/", (req, res) => {
  SETTINGS = { ...SETTINGS, ...req.body };
  res.json({ ok: true, settings: SETTINGS });
});

export default router;
