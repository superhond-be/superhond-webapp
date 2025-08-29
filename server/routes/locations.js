// server/routes/locations.js
import express from "express";
const router = express.Router();

let locations = [
  { id: 1, name: "Dessel Tabloo", address: "Gravenstraat 3", postcode: "2480", city: "Dessel", description: "" },
  { id: 2, name: "Retie Prinsenpark", address: "Kastelsedijk 5", postcode: "2470", city: "Retie", description: "" },
];

const nextId = () => (locations.length ? Math.max(...locations.map(l => l.id)) + 1 : 1);

router.get("/", (_req, res) => res.json(locations));
router.get("/:id", (req, res) => {
  const item = locations.find(l => l.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: "Locatie niet gevonden" });
  res.json(item);
});
router.post("/", (req, res) => {
  const { name, address, postcode, city, description } = req.body ?? {};
  if (!name) return res.status(400).json({ error: "name is verplicht" });
  const item = { id: nextId(), name, address: address ?? "", postcode: postcode ?? "", city: city ?? "", description: description ?? "" };
  locations.push(item);
  res.status(201).json(item);
});
router.put("/:id", (req, res) => {
  const idx = locations.findIndex(l => l.id === Number(req.params.id));
  if (idx < 0) return res.status(404).json({ error: "Locatie niet gevonden" });
  const { name, address, postcode, city, description } = req.body ?? {};
  locations[idx] = { 
    ...locations[idx],
    ...(name && { name }), ...(address !== undefined && { address }),
    ...(postcode !== undefined && { postcode }), ...(city !== undefined && { city }),
    ...(description !== undefined && { description })
  };
  res.json(locations[idx]);
});
router.delete("/:id", (req, res) => {
  const before = locations.length;
  locations = locations.filter(l => l.id !== Number(req.params.id));
  if (locations.length === before) return res.status(404).json({ error: "Locatie niet gevonden" });
  res.status(204).end();
});

export default router;
