
function populateSelectors(){
  const db=loadDB();
  const names = db.klassen.map(k=>({id:k.id, naam: nameOf(db.namen,k.naamId)+' — '+nameOf(db.themas,k.themaId)}));
  const fill=(el, list, label='naam')=> el.innerHTML = list.map(x=>`<option value="${x.id}">${x[label]||x.type||x.naam}</option>`).join('');
  fill(document.querySelector('#form-reeks [name="klasId"]'), names, 'naam');
  fill(document.querySelector('#form-reeks [name="locatieId"]'), db.locaties, 'naam');
  document.querySelector('#form-reeks [name="trainerIds"]').innerHTML = db.trainers.map(t=>`<option value="${t.id}">${t.naam}</option>`).join('');

  // init thema hint
  const sel=document.querySelector('#form-reeks [name="klasId"]');
  const klas=db.klassen.find(k=>k.id===sel.value);
  if(klas){ document.getElementById('hint-thema').textContent = nameOf(db.themas, klas.themaId); }
}

function updateHeaderCounters(){
  const {archived,future,total}=getCounts();
  document.getElementById('cnt-future').textContent=future;
  document.getElementById('cnt-arch').textContent=archived;
  document.getElementById('cnt-total').textContent=total;
}

function renderTable(){
  const db=loadDB();
  const tbody=document.getElementById('tbl-lesdagen');
  const rows=sortLesdagen(db.lesdagen||[]).filter(l=>l.status!=='archived');
  document.getElementById('count-lessen').textContent = rows.length;
  tbody.innerHTML=rows.map(l=>{
    const klas=byId(db.klassen,l.klasId);
    const naam=nameOf(db.namen,klas.naamId);
    const loc=byId(db.locaties,l.locatieId)||{};
    const statusClass = l.status==='cancelled' ? 'status cancelled' : 'status active';
    const statusText = l.status==='cancelled' ? 'Geannuleerd' : 'Actief';
    const locOpts=db.locaties.map(x=>`<option value="${x.id}" ${x.id===l.locatieId?'selected':''}>${x.naam}</option>`).join('');
    const trOpts=db.trainers.map(t=>`<option value="${t.id}" ${l.trainerIds?.includes(t.id)?'selected':''}>${t.naam}</option>`).join('');
    const trainersText = formatTrainerNames(l.trainerIds, db.trainers);
    return `<tr data-id="${l.id}">
      <td><span class="${statusClass}">${statusText}</span></td>
      <td>${naam} <span class="badge-mini">${nameOf(db.themas,klas.themaId)}</span> <span class="badge-mini">${nameOf(db.types,klas.typeId)}</span></td>
      <td><input type="date" name="datum" value="${l.datum}"></td>
      <td><input type="time" name="start" value="${l.start}"></td>
      <td>${l.einde}</td>
      <td><select name="locatieId">${locOpts}</select></td>
      <td><select name="trainerIds" multiple size="2">${trOpts}</select><span class="trainer-names">${trainersText}</span></td>
      <td>
        <button class="btn muted act-save">💾 Bewaren</button>
        <button class="btn warn act-del">🗑️</button>
      </td>
    </tr>`;
  }).join('');
}

function attachTableHandlers(){
  document.getElementById('tbl-lesdagen').addEventListener('click',(e)=>{
    const tr=e.target.closest('tr'); if(!tr) return;
    const db=loadDB(); const id=tr.dataset.id; const idx=db.lesdagen.findIndex(x=>x.id===id); if(idx<0) return;
    if(e.target.closest('.act-del')){ if(confirm('Les verwijderen?')){ db.lesdagen.splice(idx,1); saveDB(db); renderTable(); updateHeaderCounters(); renderArchive(); } return; }
    if(e.target.closest('.act-save')){
      const l=db.lesdagen[idx];
      l.datum = tr.querySelector('input[name="datum"]').value;
      l.start = tr.querySelector('input[name="start"]').value;
      const klas=byId(db.klassen,l.klasId); const nm=byId(db.namen,klas.naamId);
      l.einde = addMinutesToTime(l.start, nm.lesduur||60);
      l.locatieId = tr.querySelector('select[name="locatieId"]').value;
      l.trainerIds = Array.from(tr.querySelector('select[name="trainerIds"]').selectedOptions).map(o=>o.value);
      saveDB(db); renderTable(); updateHeaderCounters(); renderArchive();
    }
  });

  document.getElementById('tbl-lesdagen').addEventListener('change',(e)=>{
    const sel=e.target.closest('select[name="trainerIds"]'); if(!sel) return;
    const tr=sel.closest('tr'); const db=loadDB();
    const ids=Array.from(sel.selectedOptions).map(o=>o.value);
    tr.querySelector('.trainer-names').textContent = formatTrainerNames(ids, db.trainers);
  });
}

function attachPlanner(){
  const form=document.getElementById('form-reeks');
  const fromEl=form.querySelector('input[name="from"]');
  const toEl=form.querySelector('input[name="to"]');
  const startEl=form.querySelector('input[name="start"]');
  const klasEl=form.querySelector('select[name="klasId"]');
  const fromChip=document.getElementById('chip-from');
  const toChip=document.getElementById('chip-to');
  const seriesNote=document.getElementById('series-note');

  function weekday2(iso){ if(!iso) return '--'; const d=new Date(iso+'T00:00:00'); return ['Zo','Ma','Di','Wo','Do','Vr','Za'][d.getDay()]; }
  function updateChips(){ fromChip.textContent=weekday2(fromEl.value); toChip.textContent=weekday2(toEl.value); }
  function updateSeriesNote(){
    const n = diffDaysInclusive(fromEl.value, toEl.value);
    if(n>0){ seriesNote.textContent = `Deze reeks: ${n} les(sen)`; } else { seriesNote.textContent=''; }
  }
  [fromEl,toEl].forEach(el=> el.addEventListener('change', ()=>{ updateChips(); updateSeriesNote(); }));
  klasEl.addEventListener('change',()=>{
    const db=loadDB(); const k=db.klassen.find(x=>x.id===klasEl.value);
    document.getElementById('hint-thema').textContent = k ? nameOf(db.themas,k.themaId) : '—';
  });

  form.addEventListener('submit',(e)=>{
    e.preventDefault();
    const db=loadDB();
    const klas=byId(db.klassen, klasEl.value); const nm=byId(db.namen, klas.naamId);
    const start=startEl.value; const loc=form.querySelector('[name="locatieId"]').value;
    const trainerIds=Array.from(form.querySelector('[name="trainerIds"]').selectedOptions).map(o=>o.value);
    for(let d=new Date(fromEl.value); d<=new Date(toEl.value); d.setDate(d.getDate()+1)){
      const iso=d.toISOString().slice(0,10);
      const einde=addMinutesToTime(start, nm.lesduur||60);
      db.lesdagen.push({id:uid('ld'), klasId:klas.id, datum:iso, start, einde, locatieId:loc, trainerIds, status:'active'});
    }
    saveDB(db);
    renderTable(); updateHeaderCounters(); renderArchive();
    form.reset(); updateChips(); updateSeriesNote();
  });
}

function renderArchive(){
  const db=loadDB();
  const arch=(db.lesdagen||[]).filter(l=>l.status==='archived').sort((a,b)=> (b.datum+b.start).localeCompare(a.datum+a.start));
  const tbody=document.getElementById('tbl-archief');
  if(!tbody) return;
  tbody.innerHTML=arch.map(l=>{
    const klas=byId(db.klassen,l.klasId); const naam=nameOf(db.namen,klas.naamId);
    const loc=byId(db.locaties,l.locatieId);
    const trainers=formatTrainerNames(l.trainerIds, db.trainers);
    return `<tr><td><span class="status archived">Archief</span></td><td>${naam}</td><td>${l.datum}</td><td>${l.start}</td><td>${l.einde}</td><td>${loc.naam||''}</td><td>${trainers}</td></tr>`;
  }).join('');
  document.getElementById('count-archief').textContent = arch.length;
}

function init(){
  autosArchivePast();
  populateSelectors();
  attachPlanner();
  attachTableHandlers();
  renderTable();
  renderArchive();
  updateHeaderCounters();
  // init chips & series note
  document.getElementById('chip-from').textContent='--';
  document.getElementById('chip-to').textContent='--';
}

document.addEventListener('DOMContentLoaded', init);
