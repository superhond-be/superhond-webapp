// Superhond main server
const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (req,res)=>res.send('Superhond draait!'));
app.listen(PORT, ()=>console.log(`Superhond server gestart op ${PORT}`));