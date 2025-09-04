// JWT guard
const jwt = require('jsonwebtoken');
const SECRET = process.env.ADMIN_JWT_SECRET || 'devsecret';

module.exports = function adminGuard(req, res, next) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  try {
    req.admin = jwt.verify(auth.slice(7), SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};
