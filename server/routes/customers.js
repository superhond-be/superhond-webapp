import express from "express";
const router = express.Router();

// Demo klanten + gekoppelde honden
let CUSTOMERS = [
  {
    id: 1,
    name: "Paul Thijs",
    email: "paul@example.com",
    phone: "0476 11 22 33",
    dogs: [
      {
        id: 1,
        name: "Rex",
        breed: "Mechelse herder",
        birthdate: "2020-03-15",
        gender: "Reu",
        vaccinationStatus: "In orde",
        vetName: "Dierenarts Janssens",
        vetPhone: "014 22 33 44",
        emergency: "0476 99 88 77",
        vaccinationBookRef: "R-12345"
      }
    ]
  },
  {
    id: 2,
    name: "Nancy Peeters",
    email: "nancy@example.com",
    phone: "0497 55 66 77",
    dogs: [
      {
        id: 2,
        name: "Bella",
        breed: "Labrador",
        birthdate: "2021-07-01",
        gender: "Teef",
        vaccinationStatus: "Nog te controleren",
        vetName: "Dierenarts Willems",
        vetPhone: "014 44 55 66",
        emergency: "0499 12 34 56",
        vaccinationBookRef: "B-98765"
      }
    ]
  }
];

// API endpoints
router.get("/", (req, res) => {
  res.json(CUSTOMERS);
});

router.post("/", (req, res) => {
  const newCustomer = req.body;
  newCustomer.id = CUSTOMERS.length + 1;
  newCustomer.dogs = newCustomer.dogs || [];
  CUSTOMERS.push(newCustomer);
  res.status(201).json(newCustomer);
});

export { router as customersRoutes, CUSTOMERS };
