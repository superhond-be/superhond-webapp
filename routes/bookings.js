const express = require('express');
const router = express.Router();
const storage = require('../server/storage');

function all(){ return storage.read('bookings', []); }
function save(list){ return storage.write('bookings', list); }

// GET all bookings
router.get('/', (_req,res)=>{
  res.json(all());
});

// POST create booking { klantId, lessonId }
router.post('/', (req,res)=>{
  const { klantId, lessonId } = req.body || {};
  if(!klantId || !lessonId) return res.status(400).json({error:'klantId en lessonId zijn vereist'});
  const list = all();
  const id = list.length ? Math.max(...list.map(b=>b.id))+1 : 1;
  const booking = { id, klantId:Number(klantId), lessonId:Number(lessonId), status:'geboekt' };
  list.push(booking);
  save(list);
  res.status(201).json(booking);
});

// DELETE booking
router.delete('/:id', (req,res)=>{
  const id = Number(req.params.id);
  const list = all();
  if(!list.some(b=>b.id===id)) return res.status(404).json({error:'Booking not found'});
  save(list.filter(b=>b.id!==id));
  res.status(204).send();
});

module.exports = router;
