const jwt = require('jsonwebtoken');
const SECRET = process.env.ADMIN_JWT_SECRET || 'devsecret';

module.exports = function adminGuard(req, res, next) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }
  const token = auth.slice(7);
  try {
    const decoded = jwt.verify(token, SECRET);
    req.admin = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
