import express from "express";
const router = express.Router();

let sessions = [
  { id: 1, date: "2025-09-01", topic: "Puppy socialisatie" },
  { id: 2, date: "2025-09-05", topic: "Wandelen zonder trekken" }
];

router.get("/", (_req, res) => res.json(sessions));

router.get("/:id", (req, res) => {
  const s = sessions.find(x => x.id === Number(req.params.id));
  if (!s) return res.status(404).json({ error: "Sessie niet gevonden" });
  res.json(s);
});

router.post("/", (req, res) => {
  const { date, topic } = req.body || {};
  if (!date || !topic) return res.status(400).json({ error: "date en topic zijn verplicht" });
  const id = sessions.length ? Math.max(...sessions.map(s => s.id)) + 1 : 1;
  const created = { id, date, topic };
  sessions.push(created);
  res.status(201).json(created);
});

export default router;
