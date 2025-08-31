 1 const express = require("express");
 2 const router = express.Router();
 3 
 4 // In-memory opslag voor honden
 5 let dogs = [];
 6 
 7 // ---- GET alle honden (optioneel filter op customerId) ----
 8 router.get("/", (req, res) => {
 9   const { customerId } = req.query;
10   if (customerId) {
11     const filtered = dogs.filter(d => d.customerId === Number(customerId));
12     return res.json(filtered);
13   }
14   res.json(dogs);
15 });
16 
17 // ---- GET hond op ID ----
18 router.get("/:id", (req, res) => {
19   const dog = dogs.find(d => d.id === Number(req.params.id));
20   if (!dog) return res.status(404).json({ message: "Hond niet gevonden" });
21   res.json(dog);
22 });
23 
24 // ---- POST nieuwe hond ----
25 router.post("/", (req, res) => {
26   const {
27     name,
28     breed,
29     birthDate,
30     gender,
31     vetPhone,
32     vetName,
33     vaccinationStatus,
34     passportRef,
35     emergencyPhone,
36     customerId,     // koppeling naar klant
37     photoUrl        // optioneel: URL (upload kan later)
38   } = req.body;
39 
40   const newDog = {
41     id: dogs.length + 1,
42     name: name || "",
43     breed: breed || "",
44     birthDate: birthDate || null,
45     gender: gender || "-",
46     vetPhone: vetPhone || "",
47     vetName: vetName || "",
48     vaccinationStatus: vaccinationStatus || "",
49     passportRef: passportRef || "",
50     emergencyPhone: emergencyPhone || "",
51     customerId: customerId ? Number(customerId) : null,
52     photoUrl: photoUrl || null
53   };
54 
55   dogs.push(newDog);
56   res.status(201).json(newDog);
57 });
58 
59 // ---- PUT hond bijwerken ----
60 router.put("/:id", (req, res) => {
61   const dog = dogs.find(d => d.id === Number(req.params.id));
62   if (!dog) return res.status(404).json({ message: "Hond niet gevonden" });
63 
64   Object.assign(dog, {
65     name: req.body.name ?? dog.name,
66     breed: req.body.breed ?? dog.breed,
67     birthDate: req.body.birthDate ?? dog.birthDate,
68     gender: req.body.gender ?? dog.gender,
69     vetPhone: req.body.vetPhone ?? dog.vetPhone,
70     vetName: req.body.vetName ?? dog.vetName,
71     vaccinationStatus: req.body.vaccinationStatus ?? dog.vaccinationStatus,
72     passportRef: req.body.passportRef ?? dog.passportRef,
73     emergencyPhone: req.body.emergencyPhone ?? dog.emergencyPhone,
74     customerId: req.body.customerId !== undefined ? Number(req.body.customerId) : dog.customerId,
75     photoUrl: req.body.photoUrl ?? dog.photoUrl
76   });
77 
78   res.json(dog);
79 });
80 
81 // ---- DELETE hond ----
82 router.delete("/:id", (req, res) => {
83   const before = dogs.length;
84   dogs = dogs.filter(d => d.id !== Number(req.params.id));
85   if (dogs.length === before) {
86     return res.status(404).json({ message: "Hond niet gevonden" });
87   }
88   res.json({ message: "Hond verwijderd" });
89 });
90 
91 module.exports = router;

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
