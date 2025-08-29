// server/routes/locaties.js
import express from "express";
const router = express.Router();

let locaties = [
  { id: 1, name: "Retie Prinsenpark", address: "Kastelsedijk 5", postcode: "2470", city: "Retie", description: "" },
  { id: 2, name: "Dessel Tabloo", address: "Gravenstraat 3", postcode: "2480", city: "Dessel", description: "" }
];

router.get("/", (_req, res) => res.json(locaties));

router.get("/:id", (req, res) => {
  const item = locaties.find(x => x.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: "Locatie niet gevonden" });
  res.json(item);
});

router.post("/", (req, res) => {
  const { name, address, postcode, city, description } = req.body || {};
  if (!name) return res.status(400).json({ error: "Naam is verplicht" });
  const newItem = {
    id: (locaties.at(-1)?.id ?? 0) + 1,
    name,
    address: address ?? "",
    postcode: postcode ?? "",
    city: city ?? "",
    description: description ?? ""
  };
  locaties.push(newItem);
  res.status(201).json(newItem);
});

router.put("/:id", (req, res) => {
  const idx = locaties.findIndex(x => x.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Locatie niet gevonden" });

  const { name, address, postcode, city, description } = req.body || {};
  if (name !== undefined) locaties[idx].name = name;
  if (address !== undefined) locaties[idx].address = address;
  if (postcode !== undefined) locaties[idx].postcode = postcode;
  if (city !== undefined) locaties[idx].city = city;
  if (description !== undefined) locaties[idx].description = description;

  res.json(locaties[idx]);
});

router.delete("/:id", (req, res) => {
  const before = locaties.length;
  locaties = locaties.filter(x => x.id !== Number(req.params.id));
  if (locaties.length === before) return res.status(404).json({ error: "Locatie niet gevonden" });
  res.status(204).end();
});

export default router;
