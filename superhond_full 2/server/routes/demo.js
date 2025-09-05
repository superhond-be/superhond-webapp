// demo route
const express = require('express');
const router = express.Router();
router.get('/demo', (req,res)=>res.json({ok:true, msg:'demo werkt'}));
module.exports = router;