import express from "express";
const router = express.Router();

// simpele in-memory instellingen
let SETTINGS = {
  org: {
    name: "Superhond",
    email: "info@superhond.be",
    phone: "+32 498 000 000",
    website: "https://www.superhond.be",
    address: { street: "Teststraat", nr: "123", city: "Mol", country: "BE" }
  },
  branding: { primaryColor: "#0088cc", logoUrl: "" }
};

// Ophalen
router.get("/", (_req, res) => {
  res.json(SETTINGS);
});

// Updaten (merge)
router.put("/", (req, res) => {
  const patch = req.body || {};
  SETTINGS = { ...SETTINGS, ...patch };
  res.json(SETTINGS);
});

export default router;
