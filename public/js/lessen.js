
// Compact v0.17.1
const KEY_CLASSES='SH_CLASSES', KEY_ENROLL='SH_ENROLL', KEY_RES='SH_RES', KEY_CUSTOMERS='SH_CUSTOMERS';
const $=s=>document.querySelector(s); function load(k,d){try{return JSON.parse(localStorage.getItem(k))||d}catch(_){return d}} function save(k,v){localStorage.setItem(k,JSON.stringify(v))} function uid(p='C'){return p+Math.random().toString(36).slice(2,10)}
let classes=load(KEY_CLASSES,[]), enrolls=load(KEY_ENROLL,[]), customers=load(KEY_CUSTOMERS,[]), res=load(KEY_RES,{});

document.addEventListener('DOMContentLoaded',()=>{
  renderClasses(); renderEnrolls(); refillFilters();
  $('#btnAddClass').onclick=()=>openClassModal();
  $('#btnCancelClass').onclick=()=>$('#modalClass').classList.remove('active');
  $('#btnSaveClass').onclick=saveClass;
  $('#btnAddSess').onclick=addSessionRow;
  $('#btnCancelEnroll').onclick=()=>$('#modalEnroll').classList.remove('active');
  $('#btnSaveEnroll').onclick=saveEnroll;
  $('#btnCloseRes').onclick=()=>$('#modalRes').classList.remove('active');

  $('#tblClasses').onclick=e=>{const b=e.target.closest('button'); if(!b) return; const id=b.dataset.id;
    if(b.classList.contains('enroll')) openEnrollModal({},id);
    else if(b.classList.contains('edit')) openClassModal(classes.find(x=>x.id===id));
    else if(b.textContent==='🗑️'){ if(confirm('Klas verwijderen?')){ classes=classes.filter(x=>x.id!==id); save(KEY_CLASSES,classes); renderClasses(); refillFilters(); } }
  };
  $('#tblEnroll').onclick=e=>{const b=e.target.closest('button'); if(!b) return; const id=b.dataset.id;
    if(b.classList.contains('approve')) approveEnroll(id);
    else if(b.classList.contains('manage')) openResModal(id);
    else if(b.classList.contains('cancel')){ const eobj=enrolls.find(x=>x.id===id); if(eobj){ eobj.phase='geannuleerd'; save(KEY_ENROLL,enrolls); renderEnrolls(); } }
  };
  $('#filterClass').onchange=renderEnrolls; $('#filterText').oninput=renderEnrolls;
});

/* Classes */
function renderClasses(){const tb=$('#tblClasses tbody'); tb.innerHTML=''; for(const c of classes){const sc=(c.sessions||[]).length; const tr=document.createElement('tr'); tr.innerHTML=`<td>${c.naam||''}</td><td>${c.start||''}</td><td>${c.cap||''}</td><td>${sc}</td><td><button class='btn enroll' data-id='${c.id}'>➕ Inschrijven</button> <button class='btn edit' data-id='${c.id}'>✏️</button> <button class='btn' data-id='${c.id}'>🗑️</button></td>`; tb.appendChild(tr);}}
function openClassModal(c={id:uid('C'),naam:'',start:'',cap:8,sessions:[]}){$('#modalClass').classList.add('active'); $('#classTitle').textContent=classes.find(x=>x.id===c.id)?'Klas bewerken':'Nieuwe klas'; ['clsNaam','clsStart','clsCap'].forEach(()=>{}); document.getElementById('clsNaam').value=c.naam||''; document.getElementById('clsStart').value=c.start||''; document.getElementById('clsCap').value=c.cap||8; document.getElementById('btnSaveClass').dataset.id=c.id; const tb=document.querySelector('#sessTbl tbody'); tb.innerHTML=''; (c.sessions||[]).forEach(s=>{const tr=document.createElement('tr'); tr.innerHTML=`<td><input type='date' value='${s.date||''}' data-sid='${s.id}' data-field='date'></td><td><input type='time' value='${s.time||''}' data-sid='${s.id}' data-field='time'></td><td><input value='${s.loc||''}' data-sid='${s.id}' data-field='loc'></td><td><button onclick="delSess('${s.id}')">🗑️</button></td>`; tb.appendChild(tr);});}
function addSessionRow(){const sid=uid('S'); const tr=document.createElement('tr'); tr.innerHTML=`<td><input type='date' data-sid='${sid}' data-field='date'></td><td><input type='time' data-sid='${sid}' data-field='time'></td><td><input data-sid='${sid}' data-field='loc'></td><td><button onclick="delSess('${sid}')">🗑️</button></td>`; document.querySelector('#sessTbl tbody').appendChild(tr); }
function delSess(sid){const row=document.querySelector(`#sessTbl [data-sid='${sid}']`)?.closest('tr'); if(row) row.remove();}
function collectSessions(){const rows=document.querySelectorAll('#sessTbl tbody tr'); const out=[]; rows.forEach(r=>{const o={id:null}; r.querySelectorAll('input').forEach(i=>{if(!o.id)o.id=i.dataset.sid; o[i.dataset.field]=i.value}); if(o.date) out.push(o)}); return out;}
function saveClass(){const id=document.getElementById('btnSaveClass').dataset.id; const c={id,naam:document.getElementById('clsNaam').value.trim(),start:document.getElementById('clsStart').value,cap:parseInt(document.getElementById('clsCap').value||'8',10),sessions:collectSessions()}; if(!c.naam){alert('Naam is verplicht');return} const idx=classes.findIndex(x=>x.id===id); if(idx>-1)classes[idx]=c; else classes.push(c); save(KEY_CLASSES,classes); document.getElementById('modalClass').classList.remove('active'); renderClasses(); refillFilters(); }

/* Enrollments */
function renderEnrolls(){const tb=$('#tblEnroll tbody'); tb.innerHTML=''; const f=$('#filterClass').value; const q=$('#filterText').value.toLowerCase(); const rows=enrolls.filter(e=>!f||e.classId===f).map(e=>({...e,hondNaam:dogName(e.klantId,e.hondId),klantNaam:custName(e.klantId),classNaam:(classes.find(c=>c.id===e.classId)?.naam||'')})).filter(r=>`${r.hondNaam} ${r.klantNaam} ${r.classNaam}`.toLowerCase().includes(q)); for(const r of rows){const exp=expiry(r.start,r.validMonths); const tr=document.createElement('tr'); tr.innerHTML=`<td>${r.hondNaam}</td><td>${r.klantNaam}</td><td>${r.classNaam}</td><td>${r.start}</td><td>${r.validMonths} mnd (tot ${exp})</td><td>${r.phase}</td><td>${buttons(r)}</td>`; tb.appendChild(tr);}}
function buttons(r){const manage=`<button class='btn manage' data-id='${r.id}'>📅 Sessies</button>`; if(r.phase==='aanvraag') return `<button class='btn approve' data-id='${r.id}'>✅ Goedkeuren</button> ${manage} <button class='btn cancel' data-id='${r.id}'>❌</button>`; if(r.phase==='goedgekeurd'||r.phase==='actief') return `${manage} <button class='btn cancel' data-id='${r.id}'>❌</button>`; return ''}
function openEnrollModal(pre={}, fixed=null){document.getElementById('modalEnroll').classList.add('active'); document.getElementById('enHond').value=pre.hondNaam||''; document.getElementById('enKlant').value=pre.klantNaam||''; const sel=document.getElementById('enClass'); sel.innerHTML=classes.map(c=>`<option value="${c.id}">${c.naam}</option>`).join(''); if(fixed) sel.value=fixed; document.getElementById('enStart').value=todayISO(); document.getElementById('enValidMonths').value=5; document.getElementById('btnSaveEnroll').dataset.klantId=pre.klantId||''; document.getElementById('btnSaveEnroll').dataset.hondId=pre.hondId||''; }
function saveEnroll(){const klantId=document.getElementById('btnSaveEnroll').dataset.klantId; const hondId=document.getElementById('btnSaveEnroll').dataset.hondId; const classId=document.getElementById('enClass').value; const start=document.getElementById('enStart').value; const validMonths=parseInt(document.getElementById('enValidMonths').value||'5',10); if(!klantId||!hondId){alert('Geen hond/klant');return} if(!classId){alert('Kies klas');return} if(!start){alert('Aanvang nodig');return} const rec={id:uid('E'),klantId,hondId,classId,start,validMonths,phase:'aanvraag'}; enrolls.push(rec); save(KEY_ENROLL,enrolls); document.getElementById('modalEnroll').classList.remove('active'); renderEnrolls(); }

/* Reservations: pending vs confirmed */
// res structure: { enrollId: { sessionId: 'pending'|'confirmed' } }
function openResModal(enrollId){const e=enrolls.find(x=>x.id===enrollId); if(!e) return; const cls=classes.find(c=>c.id===e.classId); document.getElementById('modalRes').classList.add('active'); document.getElementById('resTitle').textContent=`Sessies • ${cls?.naam||''}`; document.getElementById('resInfo').textContent=`Fase: ${e.phase} • Geldig t/m ${expiry(e.start,e.validMonths)}`; const tb=document.querySelector('#resTbl tbody'); tb.innerHTML=''; (cls.sessions||[]).forEach(s=>{const st=(res[e.id]||{})[s.id]||''; const label=st==='confirmed'?'✔️ bevestigd':(st==='pending'?'⏳ in aanvraag':'—'); const canToggle = true; const btn = `<button class='btn toggle' data-e='${e.id}' data-s='${s.id}'>${st? 'Annuleer' : 'Reserveer'}</button>`; const tr=document.createElement('tr'); tr.innerHTML=`<td>${s.date} ${s.time||''} ${s.loc?('• '+s.loc):''}</td><td>${label}</td><td>${btn}</td>`; tb.appendChild(tr); }); tb.onclick=ev=>{const b=ev.target.closest('button'); if(!b) return; toggleReservation(b.dataset.e,b.dataset.s);};}
function toggleReservation(enrollId, sessionId){const e=enrolls.find(x=>x.id===enrollId); if(!e) return; res[enrollId]=res[enrollId]||{}; const cur=res[enrollId][sessionId]||''; if(cur){ delete res[enrollId][sessionId]; } else { // add
  // if phase is aanvraag -> mark pending, else confirmed and consume credit
  res[enrollId][sessionId] = (e.phase==='aanvraag') ? 'pending' : 'confirmed';
  if(e.phase!=='aanvraag'){ // consume immediately
    const dog=findDog(e.klantId,e.hondId); if(dog){ if((dog.credits||0)<1){ alert('Onvoldoende credits'); delete res[enrollId][sessionId]; } else { dog.credits--; save(KEY_CUSTOMERS,customers);} }
  }
}
save(KEY_RES,res); openResModal(enrollId)}

function approveEnroll(enrollId){const e=enrolls.find(x=>x.id===enrollId); if(!e) return; e.phase='goedgekeurd'; // convert all pending to confirmed and consume credits now
const dog=findDog(e.klantId,e.hondId); const pend = Object.entries(res[e.id]||{}).filter(([sid,st])=>st==='pending'); for(const [sid,_] of pend){ if(dog && (dog.credits||0)>0){ res[e.id][sid]='confirmed'; dog.credits--; } else { /* leave pending if no credits */ } } if(dog) save(KEY_CUSTOMERS,customers); save(KEY_RES,res); save(KEY_ENROLL,enrolls); renderEnrolls(); }

/* Helpers */
function refillFilters(){const sel=document.getElementById('filterClass'); sel.innerHTML='<option value=\"\">Filter: alle klassen</option>'+classes.map(c=>`<option value="${c.id}">${c.naam}</option>`).join('');}
function custName(id){const c=customers.find(x=>x.id===id); return c?`${c.voornaam||''} ${c.achternaam||''}`.trim():''}
function dogName(cid,hid){const c=customers.find(x=>x.id===cid); const h=c?.honden?.find(x=>x.id===hid); return h?.naam||''}
function findDog(cid,hid){const c=customers.find(x=>x.id===cid); return c?.honden?.find(x=>x.id===hid)}
function todayISO(){const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function expiry(start,months){if(!start||!months)return'';const d=new Date(start+'T00:00:00');d.setMonth(d.getMonth()+months);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
