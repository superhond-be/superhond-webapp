// Decode JWT payload (no verification; for reading customerId/role)
function decodeJwtPayload(token){
  try{
    const base = token.split('.')[1];
    const pad = base.replace(/-/g,'+').replace(/_/g,'/');
    const json = atob(pad + '='.repeat((4 - pad.length % 4) % 4));
    return JSON.parse(json);
  }catch(e){ return null; }
}