
function byId(arr,id){ return (arr||[]).find(x=>x.id===id)||{}; }
function nameOf(arr,id){ const x=byId(arr,id); return x.naam || x.type || ''; }
function formatTrainerNames(ids, trainers){ return (ids||[]).map(id=>byId(trainers,id).naam).filter(Boolean).join(', '); }
function pad(n){ return String(n).padStart(2,'0'); }
function toISO(d){ return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
function todayISO(){ return toISO(new Date()); }
function autosArchivePast(){ const db=loadDB(); const today=todayISO(); let changed=false; (db.lesdagen||[]).forEach(l=>{ if((l.status==='active'||l.status==='cancelled') && l.datum < today){ l.status='archived'; changed=true; }}); if(changed) saveDB(db); return changed; }
function getCounts(){ const t=(loadDB().lesdagen||[]); return { active:t.filter(l=>l.status!=='archived').length, archived:t.filter(l=>l.status==='archived').length, total:t.length }; }
function getUpcoming(n=5){ const t=(loadDB().lesdagen||[]).filter(l=>l.status!=='archived').sort((a,b)=> (a.datum+a.start).localeCompare(b.datum+b.start)); return t.slice(0,n); }
function getCancelled(limit=null){ const db=loadDB(); const t=(db.lesdagen||[]).filter(l=>l.status==='cancelled').sort((a,b)=> (b.datum+b.start).localeCompare(a.datum+a.start)); return limit? t.slice(0,limit): t; }
function countMonthActive(){ const db=loadDB(); const d=new Date(); const y=d.getFullYear(); const m=('0'+(d.getMonth()+1)).slice(-2); return (db.lesdagen||[]).filter(l=>l.status!=='archived' && l.datum.slice(0,7)===(y+'-'+m)).length; }
