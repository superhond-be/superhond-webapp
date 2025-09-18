
const byId=(arr,id)=>arr.find(x=>x.id===id)||{};
const nameOf=(arr,id)=> (byId(arr,id).naam || byId(arr,id).type || '');

function sortLesdagen(lesdagen){
  return lesdagen.sort((a,b)=> (a.datum+a.start).localeCompare(b.datum+b.start));
}

function render(){
  const db=SHDB.loadDB();
  db.lesdagen = sortLesdagen(db.lesdagen);
  SHDB.saveDB(db);
  const tbody=document.getElementById('tbl-lesdagen');
  tbody.innerHTML=db.lesdagen.map(l=>{
    const klas=byId(db.klassen,l.klasId);
    const locOpts=db.locaties.map(x=>`<option value="${x.id}" ${x.id===l.locatieId?'selected':''}>${x.naam}</option>`).join('');
    const trOpts=db.trainers.map(t=>`<option value="${t.id}" ${l.trainerIds?.includes(t.id)?'selected':''}>${t.naam}</option>`).join('');
    const statusClass = l.status==='cancelled' ? 'status cancelled' : 'status active';
    const statusText = l.status==='cancelled' ? 'Geannuleerd' : 'Actief';
    return `<tr data-id="${l.id}">
      <td><span class="${statusClass}">${statusText}</span></td>
      <td>${nameOf(db.namen,klas.naamId)} <span class="badge-mini">${klas.capaciteit} cap</span></td>
      <td><input type="date" name="datum" value="${l.datum}"></td>
      <td><input type="time" name="start" value="${l.start}"></td>
      <td>${l.einde}</td>
      <td><select name="locatieId">${locOpts}</select></td>
      <td><select name="trainerIds" multiple size="2">${trOpts}</select></td>
      <td>
        <button class="iconbtn act-save">💾</button>
        <button class="iconbtn act-del">🗑️</button>
      </td>
    </tr>`;
  }).join('');
}

function attach(){
  document.getElementById('tbl-lesdagen').addEventListener('click',(e)=>{
    const tr=e.target.closest('tr'); if(!tr) return;
    const db=SHDB.loadDB(); const id=tr.dataset.id; const idx=db.lesdagen.findIndex(x=>x.id===id); if(idx<0) return;

    if(e.target.closest('.act-save')){
      const row=db.lesdagen[idx];
      row.datum = tr.querySelector('input[name="datum"]').value;
      row.start = tr.querySelector('input[name="start"]').value;
      const klas=byId(db.klassen,row.klasId); const naam=byId(db.namen,klas.naamId);
      row.einde = SHDB.addMinutesToTime(row.start, naam.lesduur||60);
      row.locatieId = tr.querySelector('select[name="locatieId"]').value;
      row.trainerIds = Array.from(tr.querySelector('select[name="trainerIds"]').selectedOptions).map(o=>o.value);
      db.lesdagen[idx]=row; SHDB.saveDB(db); render();
    }
    if(e.target.closest('.act-del')){
      if(confirm('Les verwijderen?')){ db.lesdagen.splice(idx,1); SHDB.saveDB(db); render(); }
    }
  });
}

window.addEventListener('DOMContentLoaded', ()=>{ render(); attach(); });
