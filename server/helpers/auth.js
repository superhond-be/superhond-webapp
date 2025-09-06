// server/helpers/auth.js

/**
 * Zorgt dat de gebruiker ingelogd is.
 */
function requireLogin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ ok: false, error: 'unauthenticated' });
  }
  next();
}

/**
 * Controleer op één of meer rollen.
 * Voorbeeld: router.get('/…', requireRole('admin', 'superadmin'), handler)
 */
function requireRole(...roles) {
  return (req, res, next) => {
    const user = req.session && req.session.user;
    if (!user) {
      return res.status(401).json({ ok: false, error: 'unauthenticated' });
    }
    if (roles.length && !roles.includes(user.role)) {
      return res.status(403).json({ ok: false, error: 'forbidden' });
    }
    next();
  };
}

module.exports = {
  requireLogin,
  requireRole,
};
