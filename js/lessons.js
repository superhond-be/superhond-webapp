
function renderLessons(){
  const db=loadDB();
  const rows=(db.lesdagen||[]).filter(l=>l.status!=='archived'); // alleen toekomstig/actief/geannuleerd zichtbaar hier
  const tb=document.getElementById('tbl-lessen');
  tb.innerHTML = rows.map(l=>{
    const klas=byId(db.klassen,l.klasId), naam=nameOf(db.namen,klas.naamId);
    const cap=klas.capaciteit||0; const cnt=(l.participants||[]).length;
    const trainers=formatNames(l.trainerIds, db.trainers);
    const loc=nameOf(db.locaties,l.locatieId);
    const status = l.status==='cancelled' ? 'Geannuleerd' : 'Actief';
    return `<tr data-id="${l.id}">
      <td><span class="status ${l.status}">${status}</span></td>
      <td>${l.datum}</td>
      <td>${l.start}</td>
      <td>${naam}</td>
      <td>${loc}</td>
      <td><span class="participant-names">${cnt}/${cap}</span> <button class="btn muted act-part">👥 Beheer</button></td>
      <td class="small">${trainers}</td>
    </tr>`;
  }).join('');
  document.getElementById('cnt-lessen').textContent = rows.length;
}

function openParticipantsModal(lessonId){
  const db=loadDB();
  const l=db.lesdagen.find(x=>x.id===lessonId);
  const klas=byId(db.klassen,l.klasId), cap=klas.capaciteit||0;
  const sel = (db.klanten||[]).map(k=>`<option value="${k.id}" ${l.participants?.includes(k.id)?'selected':''}>${k.naam} — ${k.email||''}</option>`).join('');
  document.getElementById('pm-title').textContent = `Deelnemers (${(l.participants||[]).length}/${cap}) — ${l.datum} ${l.start}`;
  document.getElementById('pm-select').innerHTML = sel;
  document.getElementById('pm').dataset.lessonId = lessonId;
  document.getElementById('pm').style.display='flex';
}

function closeParticipantsModal(){ const m=document.getElementById('pm'); m.style.display='none'; m.dataset.lessonId=''; }

function attachLessonsHandlers(){
  document.getElementById('tbl-lessen').addEventListener('click',(e)=>{
    const tr=e.target.closest('tr'); if(!tr) return;
    const id=tr.dataset.id;
    if(e.target.closest('.act-part')){ openParticipantsModal(id); }
  });
  document.getElementById('pm-cancel').addEventListener('click', closeParticipantsModal);
  document.getElementById('pm-save').addEventListener('click', ()=>{
    const m=document.getElementById('pm'); const id=m.dataset.lessonId; const db=loadDB();
    const l=db.lesdagen.find(x=>x.id===id); const klas=byId(db.klassen,l.klasId), cap=klas.capaciteit||0;
    const selected = Array.from(document.getElementById('pm-select').selectedOptions).map(o=>o.value);
    if(selected.length > cap){
      alert(`Capaciteit overschreden: max ${cap} deelnemers.`);
      return;
    }
    l.participants = selected;
    saveDB(db); closeParticipantsModal(); renderLessons();
  });
}

document.addEventListener('DOMContentLoaded', ()=>{ renderLessons(); attachLessonsHandlers(); });
