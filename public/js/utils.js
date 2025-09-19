
function byId(arr,id){ return (arr||[]).find(x=>x.id===id)||{}; }
function nameOf(arr,id){ const x=byId(arr,id); return x.naam || x.type || ''; }
function formatTrainerNames(ids, trainers){ return (ids||[]).map(id=>byId(trainers,id).naam).filter(Boolean).join(', '); }
function pad(n){ return String(n).padStart(2,'0'); }
function toISO(d){ return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
function todayISO(){ return toISO(new Date()); }
function autosArchivePast(){ const db=loadDB(); const today=todayISO(); let changed=false; (db.lesdagen||[]).forEach(l=>{ if((l.status==='active'||l.status==='cancelled') && l.datum < today){ l.status='archived'; changed=true; }}); if(changed) saveDB(db); }
function getCounts(){ const db=loadDB(); const t=db.lesdagen||[]; const archived=t.filter(l=>l.status==='archived').length; const future=t.filter(l=>l.status!=='archived').length; return {archived, future, total:t.length}; }
function diffDaysInclusive(aISO,bISO){ if(!aISO||!bISO) return 0; const a=new Date(aISO), b=new Date(bISO); const ms=24*60*60*1000; return Math.floor((b-a)/ms)+1; }
function sortLesdagen(les){ return (les||[]).sort((a,b)=> (a.datum+a.start).localeCompare(b.datum+b.start)); }
