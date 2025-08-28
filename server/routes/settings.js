import express from "express";
const router = express.Router();

// Tijdelijke in-memory instellingen
let SETTINGS = {
  org: "Superhond",
  url: "https://superhond-webapp.onrender.com"
};

// Endpoint om instellingen op te halen
router.get("/", (req, res) => {
  res.json(SETTINGS);
});

// (optioneel) Endpoint om instellingen te updaten
router.post("/", (req, res) => {
  SETTINGS = { ...SETTINGS, ...req.body };
  res.json(SETTINGS);
});

export default router;
