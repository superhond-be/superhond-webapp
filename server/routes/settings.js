import express from "express";
const router = express.Router();

let SETTINGS = {
  org: "Superhond",
  email: "info@superhond.be",
  phone: "+32 498 000 000",
  address: { street: "Huisnummerstraat", nr: "33a", city: "Mol", country: "BE" },
  branding: { primaryColor: "#0088cc" },
  website: "https://www.superhond.be"
};

// ophalen
router.get("/", (_req, res) => res.json(SETTINGS));

// bijwerken (merge lichtgewicht)
router.put("/", (req, res) => {
  const patch = req.body || {};
  SETTINGS = { ...SETTINGS, ...patch };
  res.json(SETTINGS);
});

export default router;
