// server/adminGuard.js
module.exports = function adminGuard(req, res, next) {
  const auth = req.headers.authorization || '';
  const [type, b64] = auth.split(' ');
  if (type !== 'Basic' || !b64) return ask();

  const [u, p] = Buffer.from(b64, 'base64').toString().split(':');
  if (u === process.env.ADMIN_USER && p === process.env.ADMIN_PASS) {
    return next();
  }
  return ask();

  function ask() {
    res.set('WWW-Authenticate', 'Basic realm="Superhond Admin"');
    res.status(401).send('Unauthorized');
  }
};
