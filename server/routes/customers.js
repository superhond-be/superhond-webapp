// server/routes/customers.js
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

// --- mappen bepalen ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// uploads map (naast server/)
const uploadsDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// --- Multer opslag ---
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ts = Date.now();
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    cb(null, `${ts}-${safe}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// --- Simpele in-memory data ---
let NEXT_CUSTOMER_ID = 1;
let NEXT_DOG_ID = 1;
const CUSTOMERS = []; // {id, name, email, phone, lessonType, dogs:[dogId]}
const DOGS = [];      // {id, customerId, name, breed, gender, birthdate, photoUrl, vetName, vetPhone, vaccination, vaccinationBookRef, emergencyPhone}

// Lijst (ter controle)
router.get("/", (_req, res) => {
  res.json({ customers: CUSTOMERS, dogs: DOGS });
});

// Registreren klant + hond (met optionele foto)
router.post("/register", upload.single("dogPhoto"), (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      lessonType,
      dogName,
      breed,
      gender,
      birthdate,
      vaccination,
      vaccinationBookRef,
      vetPhone,
      vetName,
      emergencyPhone
    } = req.body;

    if (!customerName || !customerEmail || !dogName) {
      return res.status(400).json({ error: "Naam klant, e-mail en naam hond zijn verplicht." });
    }

    // klant aanmaken
    const customer = {
      id: NEXT_CUSTOMER_ID++,
      name: customerName.trim(),
      email: customerEmail.trim(),
      phone: (customerPhone || "").trim(),
      lessonType: (lessonType || "").trim(),
      dogs: []
    };
    CUSTOMERS.push(customer);

    // foto pad → publieke URL onder /uploads/...
    let photoUrl = "";
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    }

    // hond aanmaken
    const dog = {
      id: NEXT_DOG_ID++,
      customerId: customer.id,
      name: dogName.trim(),
      breed: (breed || "").trim(),
      gender: (gender || "").trim(),
      birthdate: (birthdate || "").trim(),
      photoUrl,
      vaccination: (vaccination || "").trim(),
      vaccinationBookRef: (vaccinationBookRef || "").trim(),
      vetPhone: (vetPhone || "").trim(),
      vetName: (vetName || "").trim(),
      emergencyPhone: (emergencyPhone || "").trim()
    };
    DOGS.push(dog);
    customer.dogs.push(dog.id);

    return res.status(201).json({ customer, dog });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Interne fout bij registreren." });
  }
});

export default router;
