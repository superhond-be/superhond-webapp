const levels=["error","warn","info","debug"];
const current=process.env.LOG_LEVEL||"info";
const should=lvl=>levels.indexOf(lvl)<=levels.indexOf(current);
const ringCap=200; const ring=[];
function pushLine(level,args){const line=`[${new Date().toISOString()}] [${level.toUpperCase()}] `+args.map(a=>{if(typeof a==='object'){try{return JSON.stringify(a)}catch{return String(a)}} return String(a)}).join(' '); ring.push(line); if(ring.length>ringCap) ring.shift();}
module.exports={
  info:(...args)=>{ if(should("info")) console.log("[INFO]",...args); pushLine('info',args); },
  warn:(...args)=>{ if(should("warn")) console.warn("[WARN]",...args); pushLine('warn',args); },
  error:(...args)=>{ if(should("error")) console.error("[ERROR]",...args); pushLine('error',args); },
  debug:(...args)=>{ if(should("debug")) console.log("[DEBUG]",...args); pushLine('debug',args); },
  recent:()=>ring.slice(-50)
};