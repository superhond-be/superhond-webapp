module.exports = function customerGuard(req,res,next){
  const email = (req.signedCookies?.cust || req.cookies?.cust || '').toLowerCase();
  if(!email) return res.status(401).json({error:'customer_auth_required'});
  req.customer = { email };
  next();
};
