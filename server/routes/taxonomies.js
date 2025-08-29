import express from "express";
const router = express.Router();

let idCounter = 1;
const make = (name, description="", extra={}) => ({
  id: idCounter++,
  name,
  description,
  ...extra
});

const DATA = {
  trainingen: [
    make("Puppy Pack", "Startersgroep voor pups"),
    make("Puber Coachgroep", "Voor jonge honden in de puberteit")
  ],
  lestypes: [
    make("Basis", "Voor nieuwe klanten"),
    make("Gevorderd", "Vervolglessen")
  ],
  themas: [
    make("Gehoorzaamheid"),
    make("Wandelen"),
    make("Verkeer")
  ],
  locaties: [
    make("Retie Prinsenpark", "Kastelsedijk 5", { postcode: 2470, plaats: "Retie" }),
    make("Dessel Tabloo", "Gravenstraat 3", { postcode: 2480, plaats: "Dessel" })
  ]
};

router.get("/:category", (req, res) => {
  const { category } = req.params;
  if (!DATA[category]) return res.status(404).json({ error: "Onbekende categorie" });
  res.json(DATA[category]);
});

router.post("/:category", (req, res) => {
  const { category } = req.params;
  if (!DATA[category]) return res.status(404).json({ error: "Onbekende categorie" });
  const { name, description, ...extra } = req.body;
  const item = make(name, description, extra);
  DATA[category].push(item);
  res.status(201).json(item);
});

export default router;
