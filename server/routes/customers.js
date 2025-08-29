import express from "express";
const router = express.Router();

// In-memory opslag klanten
let CUSTOMERS = [];
let CUSTOMER_SEQ = 1;

router.get("/", (req, res) => {
  res.json({ message: "Alle klanten 

// Eén klant ophalen
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const customer = CUSTOMERS.find(c => c.id === id);
  if (!customer) return res.status(404).json({ error: "Klant niet gevonden" });
  res.json(customer);
});

// Nieuwe klant aanmaken
router.post("/", (req, res) => {
  const { name, email, phone } = req.body;
  if (!name) return res.status(400).json({ error: "Naam is verplicht" });

  const newCustomer = {
    id: CUSTOMER_SEQ++,
    name,
    email: email || "",
    phone: phone || "",
    dogs: [] // hier komen gekoppelde honden
  };

  CUSTOMERS.push(newCustomer);
  res.status(201).json(newCustomer);
});

export { router as customersRoutes, CUSTOMERS };
export default router;
