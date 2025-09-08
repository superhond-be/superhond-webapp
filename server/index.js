const path = require('path');
const express = require('express');
const session = require('express-session');
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(session({ secret: process.env.SESSION_SECRET || 'dev-secret', resave:false, saveUninitialized:true }));
app.use('/public', express.static(path.join(__dirname,'..','public')));
// Routes
app.use('/login', require('../routes/admin-login'));
app.use('/register', require('../routes/admin-register'));
app.use('/users', require('../routes/admin-users'));
app.use('/dashboard', require('../routes/dashboard'));
app.use('/api/admin', require('../routes/api-admin'));
app.get('/', (req,res)=> res.sendFile(path.join(__dirname,'..','public/index.html')));
const PORT = process.env.PORT||3000; app.listen(PORT,()=> console.log('Superhond draait op poort '+PORT));
