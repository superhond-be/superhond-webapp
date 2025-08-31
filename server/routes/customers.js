 1 const express = require("express");
 2 const router = express.Router();
 3 
 4 // Tijdelijke in-memory opslag (later kan dit naar database)
 5 let customers = [];
 6 
 7 // ---- GET alle klanten ----
 8 router.get("/", (req, res) => {
 9   res.json(customers);
10 });
11 
12 // ---- GET klant op ID ----
13 router.get("/:id", (req, res) => {
14   const customer = customers.find(c => c.id === parseInt(req.params.id));
15   if (!customer) {
16     return res.status(404).json({ message: "Klant niet gevonden" });
17   }
18   res.json(customer);
19 });
20 
21 // ---- POST nieuwe klant ----
22 router.post("/", (req, res) => {
23   const newCustomer = {
24     id: customers.length + 1,
25     name: req.body.name,
26     email: req.body.email,
27     phone: req.body.phone,
28     lessons: req.body.lessons || [], // gekoppelde lessen
29     dogs: req.body.dogs || []        // gekoppelde honden
30   };
31   customers.push(newCustomer);
32   res.status(201).json(newCustomer);
33 });
34 
35 // ---- PUT klant bijwerken ----
36 router.put("/:id", (req, res) => {
37   const customer = customers.find(c => c.id === parseInt(req.params.id));
38   if (!customer) {
39     return res.status(404).json({ message: "Klant niet gevonden" });
40   }
41   customer.name = req.body.name || customer.name;
42   customer.email = req.body.email || customer.email;
43   customer.phone = req.body.phone || customer.phone;
44   customer.lessons = req.body.lessons || customer.lessons;
45   customer.dogs = req.body.dogs || customer.dogs;
46   res.json(customer);
47 });
48 
49 // ---- DELETE klant ----
50 router.delete("/:id", (req, res) => {
51   customers = customers.filter(c => c.id !== parseInt(req.params.id));
52   res.json({ message: "Klant verwijderd" });
53 });
54 
55 module.exports = router;

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
