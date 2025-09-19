
function byId(arr,id){return(arr||[]).find(x=>x.id===id)||{};}
function nameOf(arr,id){const x=byId(arr,id);return x.naam||x.type||'';}
function formatTrainerNames(ids,trainers){return(ids||[]).map(id=>byId(trainers,id).naam).filter(Boolean).join(', ');}
function todayISO(){const d=new Date();const pad=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
function autosArchivePast(){const db=loadDB();const today=todayISO();let c=false;(db.lesdagen||[]).forEach(l=>{if((l.status==='active'||l.status==='cancelled')&&l.datum<today){l.status='archived';c=true;}});if(c)saveDB(db);}
