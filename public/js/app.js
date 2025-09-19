
function populateSelectors(){
  const db=loadDB();
  const klasSel=document.querySelector('[name="klasId"]');
  klasSel.innerHTML=db.klassen.map(k=>`<option value="${k.id}">${nameOf(db.namen,k.naamId)} — ${nameOf(db.themas,k.themaId)}</option>`).join('');
  document.querySelector('[name="locatieId"]').innerHTML=db.locaties.map(l=>`<option value="${l.id}">${l.naam}</option>`).join('');
  document.querySelector('[name="trainerIds"]').innerHTML=db.trainers.map(t=>`<option value="${t.id}">${t.naam}</option>`).join('');
}

function renderTable(){
  const db=loadDB();
  const rows=(db.lesdagen||[]).filter(l=>l.status!=='archived');
  document.getElementById('count-lessen').textContent=rows.length;
  const tb=document.getElementById('tbl');tb.innerHTML=rows.map(l=>{
    const klas=byId(db.klassen,l.klasId);const nm=nameOf(db.namen,klas.naamId);
    const loc=byId(db.locaties,l.locatieId);
    const trainers=formatTrainerNames(l.trainerIds,db.trainers);
    return `<tr data-id="${l.id}">
      <td><span class="status ${l.status}">${l.status}</span></td>
      <td>${nm}</td>
      <td><input type="date" value="${l.datum}"></td>
      <td><input type="time" value="${l.start}"></td>
      <td>${l.einde}</td>
      <td><select>${db.locaties.map(x=>`<option value="${x.id}" ${x.id===l.locatieId?'selected':''}>${x.naam}</option>`).join('')}</select></td>
      <td><select multiple>${db.trainers.map(t=>`<option value="${t.id}" ${l.trainerIds.includes(t.id)?'selected':''}>${t.naam}</option>`).join('')}</select><span class="trainer-names">${trainers}</span></td>
    </tr>`;
  }).join('');
}

function init(){
  autosArchivePast();populateSelectors();renderTable();
}
document.addEventListener('DOMContentLoaded',init);
