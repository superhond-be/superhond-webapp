import express from "express";
const router = express.Router();

let LOCATIONS = [
  { id: 1, name: "Retie Prinsenpark", address: "Kastelsedijk 5", postal: "2470", city: "Retie" },
];
let NEXT_ID = 2;

router.get("/", (_req, res) => res.json(LOCATIONS));

router.post("/", (req, res) => {
  const { name, address = "", postal = "", city = "" } = req.body || {};
  if (!name) return res.status(400).json({ error: "Naam locatie is verplicht" });
  const loc = { id: NEXT_ID++, name, address, postal, city };
  LOCATIONS.push(loc);
  res.status(201).json(loc);
});

export default router;
