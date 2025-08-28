// server/routes/settings.js
import express from "express";
const router = express.Router();

// Tijdelijke in-memory instellingen (later mag dit in de DB)
let SETTINGS = {
  org: "Superhond",
  url: "https://superhond-webapp.onrender.com",
  logoUrl: "",
  logoutUrl: ""
};

// GET /api/settings  -> huidige instellingen
router.get("/", (_req, res) => {
  res.json(SETTINGS);
});

// (optioneel) POST /api/settings -> instellingen updaten
router.post("/", (req, res) => {
  SETTINGS = { ...SETTINGS, ...req.body };
  res.json(SETTINGS);
});

export default router;
