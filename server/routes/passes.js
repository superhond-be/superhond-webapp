import express from "express";
const router = express.Router();

// Alle strippenkaarten ophalen
router.get("/", (req, res) => {
  res.json([
    { id: 1, type: "Puppy Pack", credits: 9 },
    { id: 2, type: "Puber Cursus", credits: 10 }
  ]);
});

// Nieuwe strippenkaart koppelen
router.post("/", (req, res) => {
  const { type, credits } = req.body;
  if (!type || !credits) {
    return res.status(400).json({ error: "Type en aantal strippen zijn verplicht" });
  }
  const newPass = { id: Date.now(), type, credits };
  res.status(201).json(newPass);
});

export default router;
