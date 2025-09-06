// server/helpers/adminGuard.js
module.exports = function adminGuard(req, res, next) {
  // verwacht dat req.user gezet is door JWT check (zie server/routes/admin.js)
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
    return res.status(403).json({ error: 'toegang_geweigerd', reason: 'admin rechten vereist' });
  }
  next();
};
