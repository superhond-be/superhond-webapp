require('express-async-errors');
const express=require('express'); const helmet=require('helmet'); const cors=require('cors'); const morgan=require('morgan'); const path=require('path');
const logger=require('../services/logger'); const {checkSharedSecret,passesFilters}=require('../services/filter'); const {forwardJson}=require('../services/forward');
const app=express(); const PORT=process.env.PORT||10000;
app.use(helmet()); app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({limit:'2mb', verify:(req,res,buf)=>{ req.rawBody = buf.toString('utf8'); }}));
app.use(morgan('combined'));
const publicDir=path.join(__dirname,'..','public'); app.use(express.static(publicDir));
app.get('/about',(req,res)=>{ res.json({ logLevel:process.env.LOG_LEVEL||'info', targetUrl:process.env.TARGET_URL||'', corsOrigin:process.env.CORS_ORIGIN||'*', allowedSources:process.env.ALLOWED_SOURCES||'', filterTopics:process.env.FILTER_TOPICS||'' }); });
app.get('/health',(req,res)=>{ const token=process.env.HEALTH_TOKEN||''; const got=req.get('X-Health-Token')||''; if(token && token!==got) return res.status(401).json({ok:false}); res.json({ ok:true, status:'healthy', time:new Date().toISOString() }); });
app.get('/debug',(req,res)=>{ res.json({ ok:true, recentLogs: require('../services/logger').recent() }); });
app.post('/hook', async (req,res)=>{
  const targetUrl=process.env.TARGET_URL; if(!targetUrl) return res.status(500).json({ ok:false, error:'TARGET_URL not set' });
  if(!checkSharedSecret(req)) return res.status(401).json({ ok:false, error:'Bad shared secret' });
  const payload=req.body||{};
  if(!passesFilters(req,payload)) return res.status(202).json({ ok:true, forwarded:false, reason:'filtered_out' });
  const keepHeaders=String(process.env.KEEP_HEADERS||'').split(',').map(h=>h.trim()).filter(Boolean); const hdrs={}; keepHeaders.forEach(k=> hdrs[k]=req.get(k));
  try{ const result=await forwardJson(targetUrl,payload,hdrs); logger.info('Forwarded',{status:result.status,to:targetUrl}); return res.status(200).json({ ok:true, forwarded:true, upstreamStatus:result.status, upstreamBody:result.body }); }
  catch(err){ logger.error('Forward failed', err && (err.stack||err.message)||String(err)); return res.status(502).json({ ok:false, error:'Upstream error', detail:String(err && (err.stack||err.message)||err) }); }
});
app.use((err,req,res,next)=>{ logger.error('Global handler:', err && (err.stack||err.message)||String(err)); res.status(500).json({ ok:false, error:'Internal error' }); });
app.listen(PORT, ()=>{ logger.info(`Forwarder (debug build) listening on ${PORT}`); });
