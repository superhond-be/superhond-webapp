require('dotenv').config();
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser(process.env.SESSION_SECRET || 'secret'));
app.use(express.json({ limit: '1mb' }));

// Static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes
app.use('/api/customer', require('./routes/customer'));
app.use('/api/customer/calendar', require('./routes/customer_calendar'));
app.use('/api/customer/preferences', require('./routes/customer_prefs'));

app.use('/api/admin/notifications', require('./routes/admin_notifications'));
app.use('/api/public-enrollments', require('./routes/publicEnroll_admin'));
app.use('/api/admin/segments', require('./routes/segments_admin'));

app.use('/admin/email-preview', require('./routes/email_preview'));

// Health
app.get('/healthz', (_req,res)=>res.json({ok:true}));

// Verjaardagen (dagelijkse check)
const { checkTodayBirthdays } = require('./helpers/birthdays');
try { const count = checkTodayBirthdays(); if(count>0) console.log('🎂 Birthday notices created:', count); } catch(e){}
setInterval(()=>{ try { const count = checkTodayBirthdays(); if(count>0) console.log('🎂 Birthday notices created:', count); } catch(e){} }, 24*60*60*1000);

app.listen(PORT, ()=>{ console.log(`Superhond server running on http://localhost:${PORT}`); });
