Superhond API Pack
==================

Inhoud:
- routes/api-admin.js
- server/store.json

Aansluiten in server/index.js:
--------------------------------
const express = require('express');
const app = express();
app.use(express.json());
app.use('/api/admin', require('../routes/api-admin'));

Endpoints:
- GET    /api/admin/status
- GET    /api/admin/users
- POST   /api/admin/users        { name, email, pass, role }
- POST   /api/admin/users/login  { email, password }

Opmerking: dit is een eenvoudige file-based opslag (server/store.json) voor demo/doeleinden.