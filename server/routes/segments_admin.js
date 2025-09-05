const express = require('express');
const adminGuard = require('../adminGuard');
const { buildSegments } = require('../helpers/segments');
const router = express.Router();

router.get('/', adminGuard, (req,res)=>{
  const course_id = req.query.course_id || 'course-001';
  const segKey = req.query.segment || null;
  const data = buildSegments(course_id);
  if(!segKey){
    const counts = Object.fromEntries(Object.entries(data).map(([k,v])=>[k, v.length]));
    return res.json({ ok:true, course_id, counts, data });
  }
  if(!data[segKey]) return res.status(400).json({ error:'unknown_segment' });
  res.json({ ok:true, course_id, segment: segKey, items: data[segKey], count: data[segKey].length });
});

module.exports = router;
