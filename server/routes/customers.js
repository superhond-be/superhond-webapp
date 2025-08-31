import express from "express";

const router = express.Router();

let customers = [];
let lessons = [];
let nextCust = 1, nextDog = 1, nextPass = 1, nextLesson = 1;

// klant registreren
router.post("/register", (req,res)=>{
  const { name, email, phone } = req.body;
  const c = { id: nextCust++, name, email, phone, dogs:[], passes:[] };
  customers.push(c);
  res.json(c);
});

// hond toevoegen
router.post("/:cid/dogs", (req,res)=>{
  const c = customers.find(x=>x.id==req.params.cid);
  if(!c) return res.status(404).json({error:"not found"});
  const d = { id: nextDog++, ...req.body };
  c.dogs.push(d);
  res.json(d);
});

// pass toevoegen
router.post("/:cid/passes", (req,res)=>{
  const c = customers.find(x=>x.id==req.params.cid);
  if(!c) return res.status(404).json({error:"not found"});
  const p = { id: nextPass++, type:req.body.type, totalStrips:req.body.totalStrips, usedStrips:0 };
  c.passes.push(p);
  res.json(p);
});

// lijst klanten
router.get("/", (req,res)=>{
  res.json(customers.map(c=>({
    ...c,
    passes: c.passes.map(p=>({...p, remaining:p.totalStrips-p.usedStrips}))
  })));
});

// summary met lessen
router.get("/:cid/summary", (req,res)=>{
  const c = customers.find(x=>x.id==req.params.cid);
  if(!c) return res.status(404).json({error:"not found"});
  const customerLessons = lessons.filter(l=>l.customerId==c.id);
  res.json({
    customer:c,
    dogs:c.dogs,
    passes:c.passes.map(p=>({...p, remaining:p.totalStrips-p.usedStrips})),
    lessons:customerLessons
  });
});

// demo seed
router.post("/dev/seed", (req,res)=>{
  customers = [];
  lessons = [];
  nextCust=nextDog=nextPass=nextLesson=1;
  const c1={id:nextCust++, name:"Jan Jansen", email:"jan@test.be", phone:"123", dogs:[], passes:[]};
  const d1={id:nextDog++, name:"Rex", breed:"Labrador"}; c1.dogs.push(d1);
  const p1={id:nextPass++, type:"Puppycursus", totalStrips:9, usedStrips:2}; c1.passes.push(p1);
  customers.push(c1);
  res.json({customers});
});

// lessen API
router.post("/../lessons", (req,res)=>{
  res.status(500).json({error:"wrong route"});
});

export default router;
