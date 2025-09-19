const CL='SH_CLASSES', EN='SH_ENROLL', RS='SH_RES', CU='SH_CUSTOMERS';
const $=s=>document.querySelector(s);
function load(k,d){try{return JSON.parse(localStorage.getItem(k))||d}catch(_){return d}}
function save(k,v){localStorage.setItem(k, JSON.stringify(v))}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.style.display='block';setTimeout(()=>t.style.display='none',2000);}

let classes=load(CL,[]), enrolls=load(EN,[]), res=load(RS,{}), customers=load(CU,[]);

document.addEventListener('DOMContentLoaded',()=>{
  renderClasses(); renderEnrolls();
  $('#btnCloseRes').onclick=()=>$('#modalRes').classList.remove('active');
});

function renderClasses(){
  const tb=document.querySelector('#tblClasses tbody'); tb.innerHTML='';
  for(const c of classes){
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${c.naam}</td><td>${c.type||''}</td><td>${c.cap||0}</td><td>${c.thema||''}</td><td>${c.trainer||''}</td><td>€${c.prijs||''}</td>
    <td><button class="btn res" data-id="${c.id}">👥 Inschrijvingen</button></td>`;
    tb.appendChild(tr);
  }
}
function renderEnrolls(){
  const tb=document.querySelector('#tblEnroll tbody'); tb.innerHTML='';
  for(const e of enrolls){
    const c=classes.find(x=>x.id===e.classId);
    const cust=customers.find(x=>x.id===e.klantId); const dog=(cust?.honden||[]).find(h=>h.id===e.hondId);
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${dog?.naam||''}</td><td>${cust?cust.voornaam+' '+cust.achternaam:''}</td><td>${c?.naam||''}</td><td>${e.phase}</td>
    <td><button class="btn manage" data-id="${e.id}">📅 Lessen</button></td>`;
    tb.appendChild(tr);
  }
}
document.addEventListener('click',ev=>{
  const b=ev.target.closest('button'); if(!b) return;
  if(b.classList.contains('manage')) openResModal(b.dataset.id);
});
function openResModal(enrollId){
  const e=enrolls.find(x=>x.id===enrollId); const cls=classes.find(c=>c.id===e.classId);
  $('#modalRes').classList.add('active'); $('#resTitle').textContent=`Lessen • ${cls?.naam||''}`;
  const tb=document.querySelector('#resTbl tbody'); tb.innerHTML='';
  const map=res[e.id]||{};
  (cls.lessen||[]).forEach(s=>{
    const st=map[s.id]||'';
    let btn=''; if(st==='confirmed') btn=`<button class="btn toggle" data-e="${e.id}" data-l="${s.id}" data-act="cancel">Afmelden</button>`;
    else if(st==='pending') btn=`<button class="btn toggle" data-e="${e.id}" data-l="${s.id}" data-act="remove">Verwijder aanvraag</button>`;
    else if(st==='cancelled') btn=`<button class="btn toggle" data-e="${e.id}" data-l="${s.id}" data-act="reserve">Opnieuw aanmelden</button>`;
    else btn=`<button class="btn toggle" data-e="${e.id}" data-l="${s.id}" data-act="reserve">Reserveer</button>`;
    const label=st==='confirmed'?'✔️ bevestigd':st==='pending'?'⏳ in aanvraag':st==='cancelled'?'❌ afgemeld':'—';
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${s.date} ${s.time} • ${s.loc||''} — ${s.theme||''}</td><td>${label}</td><td>${btn}</td>`;
    tb.appendChild(tr);
  });
  tb.onclick=ev=>{
    const b=ev.target.closest('button'); if(!b) return;
    toggleReservation(b.dataset.e,b.dataset.l,b.dataset.act);
  };
}
function toggleReservation(enrollId, lesId, act){
  const e=enrolls.find(x=>x.id===enrollId); const cls=classes.find(c=>c.id===e.classId);
  res[enrollId]=res[enrollId]||{}; const cur=res[enrollId][lesId]||'';
  const cust=customers.find(c=>c.id===e.klantId); const dog=cust?.honden?.find(h=>h.id===e.hondId);
  if(act==='reserve'){ res[enrollId][lesId]='confirmed'; if(dog){dog.credits--;save(CU,customers);} toast('✔️ Credits afgetrokken');}
  if(act==='cancel'){ if(cur==='confirmed'){res[enrollId][lesId]='cancelled'; if(dog){dog.credits++;save(CU,customers);} toast('↩️ Credits teruggezet');}}
  if(act==='remove'){ delete res[enrollId][lesId];}
  save(RS,res); openResModal(enrollId);
}
