
function renderBeheer(){
  const db = SHDB.loadDB();
  const body = document.getElementById('tbl-lessen'); if(!body) return;
  const getName = (id,list,key='id',label='naam') => (list.find(x=>x[key]===id)||{})[label]||'';
  const getLoc  = (id)=> db.locaties.find(l=>l.id===id)||{};

  body.innerHTML = (db.lessen||[]).map(ls=>{
    const naam = getName(ls.naamId, db.namen);
    const type = getName(ls.typeId, db.types, 'id', 'type');
    const loc  = getLoc(ls.locatieId);
    const thema= getName(ls.themaId, db.themas);
    const trainers = (ls.trainerIds||[]).map(id=> getName(id, db.trainers)).join(', ');
    const eind = SHDB.addMinutesToTime(ls.tijd, (db.namen.find(n=>n.id===ls.naamId)?.lesduur)||60);
    return `<tr>
      <td>${naam}</td><td>${type}</td><td>${loc.naam||''}</td>
      <td>${loc.adres||''}</td><td>${loc.plaats||''}</td><td>${loc.land||'BE'}</td>
      <td>${thema}</td><td>${trainers}</td><td>${ls.datum}</td><td>${ls.tijd}</td><td>${eind}</td><td>${ls.capaciteit||''}</td>
    </tr>`;
  }).join('');
}
window.addEventListener('DOMContentLoaded', renderBeheer);
