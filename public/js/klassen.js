
const byId=(arr,id)=>arr.find(x=>x.id===id)||{};
const nameOf=(arr,id)=> (byId(arr,id).naam || byId(arr,id).type || '');

function renderKlassen(){
  const db=SHDB.loadDB();
  const tbody=document.getElementById('tbl-klassen');
  tbody.innerHTML=(db.klassen||[]).map(kl=>{
    const loc=byId(db.locaties,kl.locatieId)||{};
    const maps='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent([loc.adres,loc.plaats,loc.land].filter(Boolean).join(', '));
    const naamOpts=db.namen.map(x=>`<option value="${x.id}" ${x.id===kl.naamId?'selected':''}>${x.naam}</option>`).join('');
    const typeOpts=db.types.map(x=>`<option value="${x.id}" ${x.id===kl.typeId?'selected':''}>${x.type}</option>`).join('');
    const locOpts=db.locaties.map(x=>`<option value="${x.id}" ${x.id===kl.locatieId?'selected':''}>${x.naam}</option>`).join('');
    const thOpts=db.themas.map(x=>`<option value="${x.id}" ${x.id===kl.themaId?'selected':''}>${x.naam}</option>`).join('');
    const trOpts=db.trainers.map(x=>`<option value="${x.id}" ${kl.trainerIds?.includes(x.id)?'selected':''}>${x.naam}</option>`).join('');
    const trainersText=(kl.trainerIds||[]).map(id=>nameOf(db.trainers,id)).join(', ');
    return `<tr data-id="${kl.id}">
      <td><select name="naamId">${naamOpts}</select></td>
      <td><select name="typeId">${typeOpts}</select></td>
      <td><select name="locatieId">${locOpts}</select></td>
      <td>${loc.adres||''}</td><td>${loc.plaats||''}</td><td>${loc.land||''}</td>
      <td><select name="themaId">${thOpts}</select></td>
      <td><select name="trainerIds" multiple size="2">${trOpts}</select><br><span class="small">${trainersText}</span></td>
      <td><input name="capaciteit" type="number" value="${kl.capaciteit||''}"></td>
      <td><a href="${maps}" target="_blank">Maps</a></td>
      <td class="actions-cell"><button class="iconbtn act-save" data-id="${kl.id}">💾</button><button class="iconbtn act-del" data-id="${kl.id}">🗑️</button></td>
    </tr>`;
  }).join('');
}
function setupKlassen(){
  document.getElementById('form-add-klas').addEventListener('submit',(e)=>{
    e.preventDefault();
    const db=SHDB.loadDB();
    const f=e.target;
    const nieuw={id:SHDB.uid('kl'),naamId:f.naamId.value,typeId:f.typeId.value,locatieId:f.locatieId.value,themaId:f.themaId.value,trainerIds:Array.from(f.trainerIds.selectedOptions).map(o=>o.value),capaciteit:parseInt(f.capaciteit.value)||0};
    db.klassen.push(nieuw);SHDB.saveDB(db);renderKlassen();f.reset();
  });
  document.getElementById('tbl-klassen').addEventListener('click',(e)=>{
    const btn=e.target.closest('button');if(!btn)return;
    const db=SHDB.loadDB();const id=btn.dataset.id;const idx=db.klassen.findIndex(x=>x.id===id);if(idx<0)return;
    if(btn.classList.contains('act-del')){ if(confirm('Verwijderen?')){db.klassen.splice(idx,1);SHDB.saveDB(db);renderKlassen();}}
    if(btn.classList.contains('act-save')){const tr=btn.closest('tr');const kl=db.klassen[idx];tr.querySelectorAll('select,input').forEach(el=>{if(el.name==='trainerIds'){kl.trainerIds=Array.from(el.selectedOptions).map(o=>o.value);}else{kl[el.name]=el.value;}});SHDB.saveDB(db);renderKlassen();}
  });
}
window.addEventListener('DOMContentLoaded',()=>{renderKlassen();setupKlassen();});
