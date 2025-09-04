const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const FILE = path.join(__dirname, '..', 'data', 'admin_users.json');
const uid = () => crypto.randomUUID();

function readUsers(){ try { return JSON.parse(fs.readFileSync(FILE,'utf8')); } catch { return []; } }
function writeUsers(list){ fs.mkdirSync(path.dirname(FILE),{recursive:true}); fs.writeFileSync(FILE, JSON.stringify(list,null,2)); }
function publicUser(u){ return { id:u.id, name:u.name, email:u.email, role:u.role, created_at:u.created_at }; }

async function createUser({ name, email, password, role='admin' }){
  const users=readUsers();
  if(users.some(u=>u.email.toLowerCase()===(email||'').toLowerCase())) throw new Error('user_exists');
  const passhash=await bcrypt.hash(password,10);
  const u={ id:uid(), name, email:email.toLowerCase(), role, passhash, created_at:Date.now() };
  users.push(u); writeUsers(users); return publicUser(u);
}

async function verifyUser(email, password){
  const users=readUsers();
  const u=users.find(x=>x.email.toLowerCase()===(email||'').toLowerCase());
  if(!u) return null;
  const ok=await bcrypt.compare(password, u.passhash);
  return ok? publicUser(u): null;
}

module.exports = { readUsers, writeUsers, createUser, verifyUser, publicUser };
