
import express from "express";
const router = express.Router();

// tijdelijk in-memory; later kan dit naar SQLite
let SETTINGS = {
  org: "Superhond",
  email: "info@superhond.be",
  tel: "+32 493 877 605",
  address: { street: "Huisnummerstraat", nr: "33", city: "Mol", country: "BE" },
  branding: { logoUrl: "", primaryColor: "#0088cc" },
};

// ophalen
router.get("/", (_req, res) => {
  res.json(SETTINGS);
});

// bijwerken
router.put("/", (req, res) => {
  SETTINGS = { ...SETTINGS, ...req.body };
  res.json(SETTINGS);
});

export default router;
