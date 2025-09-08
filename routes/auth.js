
// Auth routes: register & login
const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { SECRET } = require('./auth-middleware');

const router = express.Router();
const DATA_FILE = path.join(__dirname, '..', 'server', 'data', 'users.json');

async function readUsers(){
  const raw = await fs.readFile(DATA_FILE, 'utf-8').catch(async () => {
    const init = { users: [] };
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(init, null, 2), 'utf-8');
    return JSON.stringify(init);
  });
  return JSON.parse(raw).users || [];
}

async function writeUsers(users){
  await fs.writeFile(DATA_FILE, JSON.stringify({ users }, null, 2), 'utf-8');
}

function sign(user){
  return jwt.sign({ id:user.id, email:user.email, role:user.role||'admin', name:user.name }, SECRET, { expiresIn: '7d' });
}

router.post('/register', async (req,res) => {
  const { name, email, password } = req.body || {};
  if(!name || !email || !password) return res.status(400).json({message:'Naam, e-mail en wachtwoord zijn verplicht'});
  const users = await readUsers();
  if(users.some(u => u.email.toLowerCase() === String(email).toLowerCase())){
    return res.status(409).json({message:'E-mail bestaat al'});
  }
  const id = users.length ? Math.max(...users.map(u=>u.id||0))+1 : 1;
  const passwordHash = await bcrypt.hash(String(password), 10);
  const newUser = { id, name, email, passwordHash, role: users.length ? 'admin' : 'owner' }; // eerste user = owner
  users.push(newUser);
  await writeUsers(users);
  const token = sign(newUser);
  res.json({ token, user: { id:newUser.id, name:newUser.name, email:newUser.email, role:newUser.role } });
});

router.post('/login', async (req,res) => {
  const { email, password } = req.body || {};
  if(!email || !password) return res.status(400).json({message:'E-mail en wachtwoord zijn verplicht'});
  const users = await readUsers();
  const user = users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
  if(!user) return res.status(401).json({message:'Onjuiste e-mail of wachtwoord'});
  const ok = await bcrypt.compare(String(password), user.passwordHash);
  if(!ok) return res.status(401).json({message:'Onjuiste e-mail of wachtwoord'});
  const token = sign(user);
  res.json({ token, user: { id:user.id, name:user.name, email:user.email, role:user.role } });
});

module.exports = router;
