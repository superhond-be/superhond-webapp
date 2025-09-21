
const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '..', 'public')));

// Simple API
app.get('/api/health', (req,res)=>{
  res.json({status:'ok', time:new Date().toISOString()});
});

app.get('/api/version', (req,res)=>{
  res.json({app:'superhond-test-demo', version:'0.18.4'});
});

app.listen(PORT, ()=>{
  console.log(`Superhond v0.18.4 running on port ${PORT}`);
});
