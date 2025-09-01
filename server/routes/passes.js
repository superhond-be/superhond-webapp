import express from "express";
const router = express.Router();

/**
 * We beheren strippenkaarten los in deze module.
 * Elke pass: { id, customerId, dogId?, lessonType, total, used, createdAt }
 */
let PASSES = [];
let NEXT_PASS_ID = 1;

/** GET /api/passes?customerId=&dogId= */
router.get("/", (req, res) => {
  const customerId = req.query.customerId ? Number(req.query.customerId) : null;
  const dogId = req.query.dogId ? Number(req.query.dogId) : null;

  let list = PASSES;
  if (customerId) list = list.filter((p) => p.customerId === customerId);
  if (dogId) list = list.filter((p) => p.dogId === dogId);

  res.json(list);
});

/** POST /api/passes (aanmaken) */
router.post("/", (req, res) => {
  const { customerId, dogId, lessonType, total } = req.body || {};
  if (!Number.isFinite(Number(customerId)))
    return res.status(400).json({ error: "customerId is required" });
  if (!lessonType || !Number.isFinite(total) || total <= 0)
    return res.status(400).json({ error: "lessonType and positive total required" });

  const pass = {
    id: NEXT_PASS_ID++,
    customerId: Number(customerId),
    dogId: Number.isFinite(Number(dogId)) ? Number(dogId) : null,
    lessonType,
    total,
    used: 0,
    createdAt: new Date().toISOString(),
  };
  PASSES.push(pass);
  res.status(201).json(pass);
});

/** POST /api/passes/:id/use (1 strip verbruiken) */
router.post("/:id/use", (req, res) => {
  const id = Number(req.params.id);
  const pass = PASSES.find((p) => p.id === id);
  if (!pass) return res.status(404).json({ error: "Pass not found" });
  if (pass.used >= pass.total)
    return res.status(400).json({ error: "No strips remaining" });
  pass.used += 1;
  res.json(pass);
});

export default router;
