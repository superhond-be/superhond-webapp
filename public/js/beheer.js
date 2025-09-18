
const byId=(arr,id)=>arr.find(x=>x.id===id)||{};
const nameOf=(arr,id)=> (byId(arr,id).naam || byId(arr,id).type || '');

function renderRow(db, ls){
  const loc=byId(db.locaties, ls.locatieId)||{};
  const maps='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent([loc.adres,loc.plaats,loc.land].filter(Boolean).join(', '));

  const naamOpts = db.namen.map(x=>`<option value="${x.id}" ${x.id===ls.naamId?'selected':''}>${x.naam}</option>`).join('');
  const typeOpts = db.types.map(x=>`<option value="${x.id}" ${x.id===ls.typeId?'selected':''}>${x.type}</option>`).join('');
  const locOpts  = db.locaties.map(x=>`<option value="${x.id}" ${x.id===ls.locatieId?'selected':''}>${x.naam}</option>`).join('');
  const thOpts   = db.themas.map(x=>`<option value="${x.id}" ${x.id===ls.themaId?'selected':''}>${x.naam}</option>`).join('');
  const trOpts   = db.trainers.map(x=>`<option value="${x.id}" ${ls.trainerIds?.includes(x.id)?'selected':''}>${x.naam}</option>`).join('');

  const trainersText = (ls.trainerIds||[]).map(id=>nameOf(db.trainers,id)).join(', ');

  return `<tr data-id="${ls.id}">
    <td>
      <span class="view small">${nameOf(db.namen,ls.naamId)}</span>
      <select class="edit" name="naamId">${naamOpts}</select>
    </td>
    <td>
      <span class="view small">${nameOf(db.types,ls.typeId)}</span>
      <select class="edit" name="typeId">${typeOpts}</select>
    </td>
    <td>
      <span class="view small">${nameOf(db.locaties,ls.locatieId)}</span>
      <select class="edit" name="locatieId">${locOpts}</select>
    </td>
    <td class="small">${loc.adres||''}</td>
    <td class="small">${loc.plaats||''}</td>
    <td class="mono">${loc.land||''}</td>
    <td>
      <span class="view small">${nameOf(db.themas,ls.themaId)}</span>
      <select class="edit" name="themaId">${thOpts}</select>
    </td>
    <td>
      <span class="view small">${trainersText}</span>
      <select class="edit" name="trainerIds" multiple size="2">${trOpts}</select>
    </td>
    <td>
      <span class="view small">${ls.datum||''}</span>
      <input class="edit" name="datum" type="date" value="${ls.datum||''}">
    </td>
    <td>
      <span class="view small">${ls.tijd||''}</span>
      <input class="edit" name="tijd" type="time" value="${ls.tijd||''}">
    </td>
    <td class="small">${ls.eindtijd||''}</td>
    <td>
      <span class="view small">${ls.capaciteit??''}</span>
      <input class="edit" name="capaciteit" type="number" value="${ls.capaciteit??''}">
    </td>
    <td><a href="${maps}" target="_blank">Maps</a></td>
    <td class="actions-cell">
      <div class="actions">
        <button class="iconbtn act-edit"   title="Bewerken">✏️</button>
        <button class="iconbtn act-save edit"   title="Opslaan">💾</button>
        <button class="iconbtn act-cancel edit" title="Annuleren">↩︎</button>
        <button class="iconbtn act-del"    title="Verwijderen">🗑️</button>
      </div>
    </td>
  </tr>`;
}

function renderTable(){
  const db=SHDB.loadDB();
  const tbody=document.getElementById('tbl-lessen');
  tbody.innerHTML = (db.lessen||[]).map(ls=>renderRow(db,ls)).join('');
}

function toggleEdit(tr, on){
  tr.classList.toggle('editing', !!on);
}

function collectRow(tr){
  const out={};
  tr.querySelectorAll('input,select').forEach(el=>{
    if(el.name==='trainerIds'){ out.trainerIds = Array.from(el.selectedOptions).map(o=>o.value); }
    else { out[el.name]=el.value; }
  });
  return out;
}

function attachEvents(){
  document.getElementById('tbl-lessen').addEventListener('click', (e)=>{
    const tr=e.target.closest('tr'); if(!tr) return;
    const db=SHDB.loadDB();
    const id=tr.dataset.id;
    const idx=db.lessen.findIndex(x=>x.id===id); if(idx<0) return;

    if(e.target.closest('.act-edit')){
      toggleEdit(tr, true);
    }
    if(e.target.closest('.act-cancel')){
      toggleEdit(tr, false);
      renderTable(); // reset view
    }
    if(e.target.closest('.act-save')){
      const patch=collectRow(tr);
      const ls={...db.lessen[idx], ...patch};
      const duur=(byId(db.namen,ls.naamId).lesduur)||60;
      ls.eindtijd=SHDB.addMinutesToTime(ls.tijd,duur);
      db.lessen[idx]=ls;
      SHDB.saveDB(db);
      toggleEdit(tr, false);
      renderTable();
    }
    if(e.target.closest('.act-del')){
      if(confirm('Les verwijderen?')){
        db.lessen.splice(idx,1);
        SHDB.saveDB(db);
        renderTable();
      }
    }
  });
}

window.addEventListener('DOMContentLoaded', ()=>{
  renderTable();
  attachEvents();
});
