// server/routes/settings.js
import express from "express";
const router = express.Router();

/**
 * Tijdelijke in-memory settings
 * Later kan dit naar een database worden verplaatst
 */
let SETTINGS = {
  org: "Superhond",
  name: "Superhond",
  email: "info@superhond.be",
  phone: "+32 498 877 065",
  address: "Steenweg Hulsel 33a, 2470 Retie",
  branding: {
    logoUrl: "/images/logo.png",   // voeg later je logo toe in /public/images
    primaryColor: "#0088cc",
    website: "https://www.superhond.be"
  }
};

// ✅ Alle settings ophalen
router.get("/", (_req, res) => {
  res.json(SETTINGS);
});

// ✅ Instellingen updaten
router.put("/", (req, res) => {
  const updates = req.body;

  // overschrijf bestaande velden met updates
  SETTINGS = { ...SETTINGS, ...updates };

  res.json({
    message: "Instellingen succesvol bijgewerkt",
    settings: SETTINGS
  });
});

// ✅ Exporteren naar index.js
export default router;
