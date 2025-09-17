let CURRENT_FILTERS = {};
let SORT = JSON.parse(localStorage.getItem('SH_SORT_v0128')||'{"col":"datum","dir":"asc"}');

function option(list, idKey, labelKey, selectedId){
  return list.map(it=>`<option value="${it[idKey]}" ${it[idKey]===selectedId?'selected':''}>${it[labelKey]}</option>`).join('');
}
function optionMulti(list, idKey, labelKey, selectedIds){
  const set = new Set(selectedIds||[]);
  return list.map(it=>`<option value="${it[idKey]}" ${set.has(it[idKey])?'selected':''}>${it[labelKey]}</option>`).join('');
}

function calcEndTime(db, naamId, startTime){
  const pakket = (db.namen||[]).find(n=>n.id===naamId);
  const dur = pakket?.lesduur ?? 60;
  return SHDB.addMinutesToTime(startTime||'10:00', dur);
}

function normalizeRows(db){
  return (db.lessen||[]).map(ls=>{
    const naam = db.namen.find(n=>n.id===ls.naamId)?.naam||'';
    const type = db.types.find(t=>t.id===ls.typeId)?.type||'';
    const loc  = db.locaties.find(l=>l.id===ls.locatieId)||{};
    const thema= db.themas.find(t=>t.id===ls.themaId)?.naam||'';
    const trainers = (ls.trainerIds||[]).map(id=> db.trainers.find(t=>t.id===id)?.naam).filter(Boolean);
    const eind = calcEndTime(db, ls.naamId, ls.tijd);
    return { ...ls, _naam:naam, _type:type, _locnaam:loc.naam||'', _adres:loc.adres||'', _plaats:loc.plaats||'', _land:loc.land||'BE', _thema:thema, _trainers:trainers, _eindtijd:eind };
  });
}

function applyFilters(rows){
  let r = rows;
  const { q, dateFrom, dateTo, locatieId, trainerIds } = CURRENT_FILTERS||{};
  if(q){
    const qlc = q.toLowerCase();
    r = r.filter(x => x._naam.toLowerCase().includes(qlc) || x._thema.toLowerCase().includes(qlc));
  }
  if(dateFrom){ r = r.filter(x => x.datum >= dateFrom); }
  if(dateTo){ r = r.filter(x => x.datum <= dateTo); }
  if(locatieId){ r = r.filter(x => x.locatieId === locatieId); }
  if(trainerIds && trainerIds.length){ r = r.filter(x => (x.trainerIds||[]).some(id=> trainerIds.includes(id))); }
  return r;
}

function applySort(rows){
  const dir = SORT.dir==='asc'? 1 : -1;
  const col = SORT.col;
  const get = (x)=>{
    if(col==='naam') return x._naam;
    if(col==='type') return x._type;
    if(col==='locatie') return x._locnaam;
    if(col==='thema') return x._thema;
    if(col==='datum') return x.datum;
    if(col==='tijd') return x.tijd;
    if(col==='eindtijd') return x._eindtijd;
    if(col==='cap') return x.capaciteit;
    return x.datum;
  };
  return rows.slice().sort((a,b)=> (get(a)>get(b)?1:-1)*dir);
}

function renderBeheer(){
  const db = SHDB.loadDB();
  const tbody = document.getElementById('tbl-lessen');
  let rows = normalizeRows(db);
  rows = applyFilters(rows);
  rows = applySort(rows);

  tbody.innerHTML = rows.map(ls=>`<tr data-id="${ls.id}">
    <td>${ls._naam}</td>
    <td>${ls._type}</td>
    <td>${ls._locnaam}</td>
    <td>${ls._adres}</td>
    <td>${ls._plaats}</td>
    <td>${ls._land}</td>
    <td>${ls._thema}</td>
    <td>${ls._trainers.join(', ')}</td>
    <td>${ls.datum}</td>
    <td>${ls.tijd}</td>
    <td>${ls._eindtijd}</td>
    <td>${ls.capaciteit}</td>
  </tr>`).join('');

  // update header active arrows
  document.querySelectorAll('th.sortable').forEach(th=> th.classList.toggle('active', th.dataset.col===SORT.col));
  document.querySelectorAll('th.sortable .arrow').forEach(span=> span.textContent = (span.parentElement.dataset.col===SORT.col ? (SORT.dir==='asc'?'↑':'↓') : '↕'));
}

function onHeaderClick(e){
  const th = e.target.closest('th.sortable');
  if(!th) return;
  const col = th.dataset.col;
  if(SORT.col === col){ SORT.dir = (SORT.dir==='asc'?'desc':'asc'); }
  else { SORT.col = col; SORT.dir = 'asc'; }
  localStorage.setItem('SH_SORT_v0128', JSON.stringify(SORT));
  renderBeheer();
}

function mountFilters(){
  const db = SHDB.loadDB();
  const host = document.getElementById('beheer-filters');
  SHFilterBar.mount({ mount: host, trainers: db.trainers, locaties: db.locaties });
  host.addEventListener('sh:filters:change', (e)=>{ CURRENT_FILTERS = e.detail; renderBeheer(); });
}

function toCSV(rows){
  const headers = ['Naam','Type','Locatie','Adres','Plaats','Land','Thema','Trainers','Datum','Begintijd','Eindtijd','Capaciteit','Google Maps URL'];
  const lines = [headers.join(';')];
  rows.forEach(ls=>{
    const addr = `${ls._adres}, ${ls._plaats}, ${ls._land}`;
    const gmaps = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(addr);
    const vals = [ls._naam, ls._type, ls._locnaam, ls._adres, ls._plaats, ls._land, ls._thema, ls._trainers.join(', '), ls.datum, ls.tijd, ls._eindtijd, String(ls.capaciteit), gmaps];
    lines.push(vals.map(v => (String(v).includes(';')? ('"'+String(v).replace(/"/g,'""')+'"') : String(v))).join(';'));
  });
  return lines.join('\n');
}

function exportFilteredJSON(){
  const db = SHDB.loadDB();
  let rows = applySort(applyFilters(normalizeRows(db)));
  const blob = new Blob([JSON.stringify(rows, null, 2)], {type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'lessen-export-gefilterd.json'; a.click(); URL.revokeObjectURL(a.href);
}

function exportFilteredCSV(){
  const db = SHDB.loadDB();
  let rows = applySort(applyFilters(normalizeRows(db)));
  const csv = toCSV(rows);
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'lessen-export-gefilterd.csv'; a.click(); URL.revokeObjectURL(a.href);
}

window.addEventListener('DOMContentLoaded', ()=>{
  mountFilters();
  renderBeheer();
  document.getElementById('tbl-head').addEventListener('click', onHeaderClick);
  document.getElementById('btn-export-json').addEventListener('click', exportFilteredJSON);
  document.getElementById('btn-export-csv').addEventListener('click', exportFilteredCSV);
});