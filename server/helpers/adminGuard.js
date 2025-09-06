// server/helpers/adminGuard.js

/**
 * Validatie van SETUP_TOKEN voor eerste superadmin-registratie.
 * Token kan meegegeven worden via:
 * - body.token
 * - query ?token=…
 * - header: x-setup-token
 */
function ensureSetupToken(req, res, next) {
  const expected = process.env.SETUP_TOKEN;
  if (!expected) {
    return res.status(500).json({ ok: false, error: 'SETUP_TOKEN_not_configured' });
  }

  const token =
    (req.body && req.body.token) ||
    (req.query && req.query.token) ||
    req.get('x-setup-token');

  if (token !== expected) {
    return res.status(401).json({ ok: false, error: 'setup_token_invalid' });
  }
  next();
}

/**
 * Snelcheck voor ingelogde admin/superadmin (als je die ergens wil hergebruiken).
 */
function ensureAdmin(req, res, next) {
  const user = req.session && req.session.user;
  if (!user) {
    return res.status(401).json({ ok: false, error: 'unauthenticated' });
  }
  if (!['admin', 'superadmin'].includes(user.role)) {
    return res.status(403).json({ ok: false, error: 'forbidden' });
  }
  next();
}

module.exports = {
  ensureSetupToken,
  ensureAdmin,
};
