const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());

// --- Static public files
app.use(express.static(path.join(__dirname, '..', 'public')));

// 🚫 Block direct access to /data
app.use('/data', (req,res)=>res.status(403).json({ error: 'Forbidden' }));

// Routers
const usersRouter = require('../routes/admin-users');
const lessonsRouter = require('../routes/lessons');
const bookingsRouter = require('../routes/bookings');
const customersRouter = require('../routes/customers');
const importRouter = require('../routes/import');
const importEmailRouter = require('../routes/import-email');
const authRouter = require('../routes/auth');

// --- Auth & protect helpers ---
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'superhond-dev-secret';
function requireAdmin(req, res, next){
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if(!token) return res.status(401).json({ error: 'Auth required' });
  try{
    const decoded = jwt.verify(token, JWT_SECRET);
    if(decoded.role !== 'admin') return res.status(403).json({ error: 'Admin required' });
    req.user = decoded;
    next();
  }catch(e){
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Mount routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/lessons', lessonsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/import', importRouter);       // /payment
app.use('/api/import', importEmailRouter);  // /email

// Protect write operations for admin only
app.post('/api/lessons*', requireAdmin);
app.put('/api/lessons*', requireAdmin);
app.delete('/api/lessons*', requireAdmin);
app.post('/api/users*', requireAdmin);
app.put('/api/users*', requireAdmin);
app.delete('/api/users*', requireAdmin);
app.post('/api/customers*', requireAdmin);
app.put('/api/customers*', requireAdmin);
app.delete('/api/customers*', requireAdmin);

// Health + index
app.get('/api/health', (_req,res)=>res.json({status:'ok', app:'superhond-webapp'}));
app.get('/', (_req,res)=>res.sendFile(path.join(__dirname,'..','public','index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log('Superhond running on', PORT));
