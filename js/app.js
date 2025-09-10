
// kleine helper
async function $json(url, opts={}){
  const r = await fetch(url, {headers:{'Content-Type':'application/json'}, ...opts});
  const t = await r.text();
  try { return JSON.parse(t); } catch(e){ return { ok:false, error:t }; }
}
window.sh = { $json };
console.log("[Superhond] app.js geladen");
