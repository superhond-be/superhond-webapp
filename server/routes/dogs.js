// server/routes/dogs.js
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = express.Router();

/* ----------------------------- In-memory store ---------------------------- */
// Eenvoudige in-memory lijst (later kan dit naar DB)
let DOGS = [];
let NEXT_DOG_ID = 1;

/* ------------------------------ Upload setup ------------------------------ */
// Zorg dat de uploadmap bestaat
const uploadDir = path.join(process.cwd(), "public", "uploads", "dogs");
fs.mkdirSync(uploadDir, { recursive: true });

// Multer configuratie voor disk storage
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    // voorkom botsingen: tijdstempel + originele bestandsnaam
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

/* --------------------------------- Helpers -------------------------------- */
function validateDogPayload(body) {
  const errors = [];
  if (!body?.name) errors.push("Naam hond is verplicht.");
  if (!body?.customerId) errors.push("customerId is verplicht.");
  return errors;
}

/* --------------------------------- Routes --------------------------------- */
/** GET /api/dogs
 *  Optioneel: ?customerId=123  -> filter op klant
 */
router.get("/", (req, res) => {
  const { customerId } = req.query;
  if (customerId) {
    const list = DOGS.filter((d) => String(d.customerId) === String(customerId));
    return res.json(list);
  }
  res.json(DOGS);
});

/** POST /api/dogs
 *  Maak een hond aan (verwacht JSON; foto upload je apart)
 */
router.post("/", (req, res) => {
  const errors = validateDogPayload(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const {
    customerId,
    name,
    breed = "",
    birthdate = "",
    gender = "",
    vaccinationStatus = "",
    bookletRef = "",
    vetName = "",
    vetPhone = "",
    emergencyNumber = "",
    photoUrl = "", // kan je na upload invullen of hier meteen meesturen
  } = req.body;

  const dog = {
    id: NEXT_DOG_ID++,
    customerId: Number(customerId),
    name,
    breed,
    birthdate,
    gender,
    vaccinationStatus,
    bookletRef,
    vetName,
    vetPhone,
    emergencyNumber,
    photoUrl,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  DOGS.push(dog);
  res.status(201).json(dog);
});

/** PATCH /api/dogs/:id
 *  Update velden van een hond (JSON body)
 */
router.patch("/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = DOGS.findIndex((d) => d.id === id);
  if (idx === -1) return res.status(404).json({ error: "Hond niet gevonden" });

  DOGS[idx] = { ...DOGS[idx], ...req.body, updatedAt: new Date().toISOString() };
  res.json(DOGS[idx]);
});

/** DELETE /api/dogs/:id
 *  Verwijder een hond
 */
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const before = DOGS.length;
  DOGS = DOGS.filter((d) => d.id !== id);
  if (DOGS.length === before) return res.status(404).json({ error: "Hond niet gevonden" });
  res.status(204).end();
});

/** POST /api/dogs/upload-photo
 *  Upload enkel de foto -> geeft { photoUrl } terug
 *  In frontend: eerst uploaden, daarna doorgeven bij POST/PATCH van de hond
 */
router.post("/upload-photo", upload.single("dogPhoto"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Geen bestand ontvangen" });
  // Publieke URL (geserveerd via express.static("public"))
  const photoUrl = `/uploads/dogs/${req.file.filename}`;
  res.json({ photoUrl });
});

/** POST /api/dogs/:id/photo
 *  (Optioneel) Upload & koppel direct aan bestaande hond
 */
router.post("/:id/photo", upload.single("dogPhoto"), (req, res) => {
  const id = Number(req.params.id);
  const dog = DOGS.find((d) => d.id === id);
  if (!dog) return res.status(404).json({ error: "Hond niet gevonden" });
  if (!req.file) return res.status(400).json({ error: "Geen bestand ontvangen" });

  dog.photoUrl = `/uploads/dogs/${req.file.filename}`;
  dog.updatedAt = new Date().toISOString();
  res.json(dog);
});

export default router;
