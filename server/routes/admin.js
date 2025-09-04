const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const SECRET = process.env.ADMIN_JWT_SECRET || 'devsecret';

router.post('/login', (req,res)=>{
  const { user, pass } = req.body;
  if (user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS){
    const token = jwt.sign({ user }, SECRET, { expiresIn: '8h' });
    return res.json({ ok:true, token });
  }
  res.status(401).json({ error:'Invalid credentials' });
});

module.exports = router;
