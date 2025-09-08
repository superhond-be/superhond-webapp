const crypto=require('crypto'); const logger=require('./logger');
function parseList(val){ if(!val) return []; return String(val).split(',').map(s=>s.trim()).filter(Boolean); }
function checkSharedSecret(req){ const incoming=req.get('X-Shared-Secret')||''; const shared=process.env.SH_SHARED_SECRET||''; if(!shared) return true; try{ return crypto.timingSafeEqual(Buffer.from(shared), Buffer.from(incoming)); } catch { return false; } }
function passesFilters(req,payload){ const allowed=parseList(process.env.ALLOWED_SOURCES); const topics=parseList(process.env.FILTER_TOPICS); const emails=parseList(process.env.FILTER_EMAILS); const src=(req.get('X-Source')||'').toLowerCase();
  if(allowed.length && !allowed.includes(src)){ logger.info('Blocked: source not allowed', src); return false; }
  const topic=(req.get('X-Topic')||payload?.topic||'').toString();
  if(topics.length && topic && !topics.includes(topic)){ logger.info('Blocked: topic not allowed', topic); return false; }
  const email=(payload?.email||'').toLowerCase();
  if(emails.length && email && !emails.includes(email)){ logger.info('Blocked: email not on allowlist'); return false; }
  return true; }
module.exports={ parseList, checkSharedSecret, passesFilters };