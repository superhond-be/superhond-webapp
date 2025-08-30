import express from "express";
const router = express.Router();

/** In-memory opslag (later DB) */
let CLASSES = [
  // voorbeeld:
  // { id: 1, name: "Puppytraining A", lessonTypeId: 1, themeId: 1, locationId: 1, note: "" }
];
let NEXT_ID = 1;

// lijst
router.get("/", (_req, res) => res.json(CLASSES));

// toevoegen
router.post("/", (req, res) => {
  const { name, lessonTypeId, themeId, locationId, note = "" } = req.body || {};
  if (!name) return res.status(400).json({ error: "Naam is verplicht" });
  if (!lessonTypeId) return res.status(400).json({ error: "Lestype is verplicht" });
  if (!locationId) return res.status(400).json({ error: "Locatie is verplicht" });

  const item = {
    id: NEXT_ID++,
    name: String(name).trim(),
    lessonTypeId: Number(lessonTypeId),
    themeId: themeId ? Number(themeId) : null,
    locationId: Number(locationId),
    note: String(note || "")
  };
  CLASSES.push(item);
  res.status(201).json(item);
});

export default router;
export { CLASSES };
