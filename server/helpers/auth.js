// server/helpers/auth.js

function requireSuperAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Superadmin privileges required' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  next();
}

module.exports = {
  requireSuperAdmin,
  requireAdmin
};
