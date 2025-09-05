require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
app.set('trust proxy', 1);

const PORT = process.env.PORT || 10000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || true;

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(cookieParser(process.env.SESSION_SECRET || 'secret'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Static
app.use(express.static(path.join(__dirname, '..', 'public')));

// Health
app.get('/healthz', (_req,res)=>res.json({ ok:true, uptime: process.uptime() }));

// API
try { app.use('/api/customer', require('./routes/customer')); } catch {}
try { app.use('/api/customer/calendar', require('./routes/customer_calendar')); } catch {}
try { app.use('/api/customer/preferences', require('./routes/customer_prefs')); } catch {}

try { app.use('/api/admin/notifications', require('./routes/admin_notifications')); } catch {}
try { app.use('/api/public-enrollments', require('./routes/publicEnroll_admin')); } catch {}
try { app.use('/api/admin/segments', require('./routes/segments_admin')); } catch {}
try { app.use('/admin/email-preview', require('./routes/email_preview')); } catch {}
try { app.use('/api/webhooks', require('./routes/webhooks')); } catch {}
try { app.use('/api/admin/credits', require('./routes/admin_credits')); } catch {}
try { app.use('/api/admin', require('./routes/admin')); } catch {}

// 404 voor onbekende /api
app.use('/api', (_req,res)=>res.status(404).json({ error:'not_found' }));

// Error handler
app.use((err, _req, res, _next)=>{
  console.error('❌ Server error:', err);
  res.status(500).json({ error:'server_error', message: err.message });
});

app.listen(PORT, ()=> console.log(`✅ Superhond server luistert op ${PORT}`));
