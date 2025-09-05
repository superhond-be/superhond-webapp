module.exports = function adminGuard(req,res,next){
  const isAdmin = req.signedCookies?.admin === '1' || req.cookies?.admin === '1';
  if(!isAdmin) return res.status(401).json({error:'admin_auth_required'});
  next();
};
