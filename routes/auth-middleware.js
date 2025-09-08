
// JWT auth middleware
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'devsecret-superhond';

function authRequired(req, res, next){
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if(!token) return res.status(401).json({message:'Geen token'});
  try{
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    next();
  }catch(e){
    return res.status(401).json({message:'Ongeldige of verlopen token'});
  }
}

module.exports = { authRequired, SECRET };
