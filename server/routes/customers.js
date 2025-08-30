import express from "express";
const router = express.Router();

// Demo klanten
let CUSTOMERS = [
  {
    id: 1,
    name: "Paul Thijs",
    email: "paul@example.com",
    phone: "0476 11 22 33",
    dogs: []
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

// 👉 hier exporteren we zowel default als named
export default router;
export { CUSTOMERS };
