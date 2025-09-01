// server/routes/debug.js
import express from "express";
import { store, addCustomer, addDog, addPass, useStrip } from "../store.js";

const router = express.Router();

// Test route om een klant toe te voegen
router.get("/test-add-customer", (req, res) => {
  const newCustomer = addCustomer({
    name: "Jan Jansen",
    email: "jan@example.com",
    phone: "0499 12 34 56",
    lessonType: "Puppy cursus"
  });
  res.json({ message: "Klant toegevoegd", customer: newCustomer });
});

// Test route om een hond toe te voegen
router.get("/test-add-dog", (req, res) => {
  const newDog = addDog({
    name: "Fido",
    breed: "Labrador",
    birthdate: "2022-01-01"
  });
  res.json({ message: "Hond toegevoegd", dog: newDog });
});

// Test route om een strippenkaart toe te voegen
router.get("/test-add-pass", (req, res) => {
  const newPass = addPass({
    customerId: 1,
    dogId: 1,
    remaining: 9
  });
  res.json({ message: "Strippenkaart toegevoegd", pass: newPass });
});

// Test route om een strip te gebruiken
router.get("/test-use-strip", (req, res) => {
  const updatedPass = useStrip(1); // gebruik de strippenkaart met ID 1
  if (!updatedPass) {
    res.status(400).json({ error: "Geen strippen meer beschikbaar" });
  } else {
    res.json({ message: "Strip gebruikt", pass: updatedPass });
  }
});

// Debug route om alle data te tonen
router.get("/all", (req, res) => {
  res.json(store);
});

export default router;
