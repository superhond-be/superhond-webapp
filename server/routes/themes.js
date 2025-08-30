import express from "express";
const router = express.Router();

let THEMES = [
  { id: 1, name: "Gehoorzaamheid", description: "Basis gehoorzaamheid" },
];
let NEXT_ID = 2;

router.get("/", (_req, res) => res.json(THEMES));

router.post("/", (req, res) => {
  const { name, description = "" } = req.body || {};
  if (!name) return res.status(400).json({ error: "Naam is verplicht" });
  const theme = { id: NEXT_ID++, name, description };
  THEMES.push(theme);
  res.status(201).json(theme);
});

export default router;
