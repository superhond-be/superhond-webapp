const express = require('express');
const jwt = require('jsonwebtoken');
const { readUsers, writeUsers, createUser, verifyUser, publicUser } = require('../helpers/adminUsers');
const adminGuard = require('../adminGuard');

const router = express.Router();
const SECRET = process.env.ADMIN_JWT_SECRET || 'devsecret';

// Registreren met setup-token (eenmalig/alleen wie token kent)
router.post('/register', async (req, res) => {
  try {
    const { token, name, email, password, role } = req.body || {};
    if (!token || token !== process.env.SETUP_TOKEN) {
      return res.status(401).json({ error: 'setup_token_invalid' });
    }
    const isFirst = readUsers().length === 0;
    const user = await createUser({ name, email, password, role: isFirst ? 'superadmin' : (role || 'admin') });
    res.status(201).json({ ok: true, user });
  } catch (e) {
    res.status(400).json({ error: e.message || 'register_failed' });
  }
});

// Inloggen met email + password
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = await verifyUser(email, password);
  if (!user) return res.status(401).json({ error: 'invalid_credentials' });
  const token = jwt.sign({ uid:user.id, email:user.email, role:user.role, name:user.name }, SECRET, { expiresIn: '8h' });
  res.json({ ok:true, token, user });
});

// Beheer users (alleen superadmin)
router.get('/users', adminGuard, (req,res)=>{
  if (req.admin?.role!=='superadmin') return res.status(403).json({ error:'forbidden' });
  res.json(readUsers().map(publicUser));
});
router.post('/users', adminGuard, async (req,res)=>{
  if (req.admin?.role!=='superadmin') return res.status(403).json({ error:'forbidden' });
  try { const u=await createUser(req.body); res.status(201).json(u); }
  catch(e){ res.status(400).json({ error:e.message }); }
});
router.delete('/users/:id', adminGuard, (req,res)=>{
  if (req.admin?.role!=='superadmin') return res.status(403).json({ error:'forbidden' });
  const all=readUsers(); const i=all.findIndex(u=>u.id===req.params.id);
  if(i===-1) return res.status(404).json({ error:'not_found' });
  const removed=all.splice(i,1); writeUsers(all);
  res.json({ ok:true, removed: publicUser(removed[0]) });
});

module.exports = router;
