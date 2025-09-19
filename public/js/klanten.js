
// Klanten v0.17.2 — klanten + honden (credits + geldigheid) + handoff
const KEY='SH_CUSTOMERS', TMP='SH_SELECTED_DOG';
const $=s=>document.querySelector(s);
function load(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(_){return []}}
function save(v){localStorage.setItem(KEY, JSON.stringify(v))}
function uid(p='K'){return p+Math.random().toString(36).slice(2,10)}
let all=load();

document.addEventListener('DOMContentLoaded',()=>{
  render(all);
  $('#search').oninput=e=>{const q=e.target.value.toLowerCase(); render(all.filter(c=>JSON.stringify(c).toLowerCase().includes(q)));}
  $('#btnAdd').onclick=()=>openModal();
  $('#btnCancel').onclick=closeModal;
  $('#btnSave').onclick=saveModal;
  $('#btnAddHond').onclick=addHondRow;
  document.getElementById('tbl').onclick=e=>{
    const b=e.target.closest('button'); if(!b) return;
    if(b.classList.contains('edit')) openModal(all.find(x=>x.id===b.dataset.id));
    else if(b.classList.contains('del')) { if(confirm('Deze klant verwijderen?')){ all=all.filter(x=>x.id!==b.dataset.id); save(all); render(all);} }
    else if(b.classList.contains('enroll')){
      const c=all.find(x=>x.id===b.dataset.cid); const h=(c?.honden||[]).find(x=>x.id===b.dataset.hid);
      if(!h){alert('Hond niet gevonden.');return}
      localStorage.setItem(TMP, JSON.stringify({klantId:c.id,hondId:h.id,klantNaam:`${c.voornaam} ${c.achternaam}`,hondNaam:h.naam}));
      location.href='lessen.html';
    }
  };
});

function render(list){
  const tb=document.querySelector('#tbl tbody'); tb.innerHTML='';
  for(const c of list){
    const honden=(c.honden||[]).map(h=>`<span class="tag">${h.naam||'🐶'} (${h.credits||0} / ${h.geldigheid||5}m) <button class="enroll" data-cid="${c.id}" data-hid="${h.id}">➕</button></span>`).join(' ');
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${c.voornaam||''} ${c.achternaam||''}</td><td>${c.email||''}</td><td>${c.telefoon||''}</td><td>${honden||'<em>Geen</em>'}</td>
      <td><button class="edit" data-id="${c.id}">✏️</button> <button class="del" data-id="${c.id}">🗑️</button></td>`;
    tb.appendChild(tr);
  }
  document.getElementById('count').textContent=`${list.length} klanten`;
}

function openModal(c={id:uid('K'), honden:[]}){
  document.getElementById('modal').classList.add('active');
  document.getElementById('modalTitle').textContent = all.find(x=>x.id===c.id)?'Klant bewerken':'Nieuwe klant';
  ['voornaam','achternaam','email','telefoon','adres','postcode','gemeente'].forEach(f=>document.getElementById(f).value=c[f]||'');
  document.getElementById('hondTbl').dataset.cid=c.id;
  renderHonden(c.honden||[]);
  document.getElementById('btnSave').dataset.id=c.id;
}
function closeModal(){ document.getElementById('modal').classList.remove('active'); }

function renderHonden(list){
  const tb=document.querySelector('#hondTbl tbody'); tb.innerHTML='';
  for(const h of list){
    const tr=document.createElement('tr');
    tr.innerHTML=`<td><input value="${h.naam||''}" data-hid="${h.id}" data-field="naam"></td>
      <td><input value="${h.ras||''}" data-hid="${h.id}" data-field="ras"></td>
      <td><input type="date" value="${h.geboorte||''}" data-hid="${h.id}" data-field="geboorte"></td>
      <td><input type="number" min="0" value="${h.credits||0}" data-hid="${h.id}" data-field="credits"></td>
      <td><input type="number" min="1" value="${h.geldigheid||5}" data-hid="${h.id}" data-field="geldigheid"></td>
      <td><input value="${h.notes||''}" data-hid="${h.id}" data-field="notes"></td>
      <td><button onclick="delHond('${h.id}')">🗑️</button> <button onclick="enrollDog('${h.id}')">➕ Inschrijven</button></td>`;
    tb.appendChild(tr);
  }
}
function addHondRow(){
  const hid='H'+Math.random().toString(36).slice(2,9);
  const tr=document.createElement('tr');
  tr.innerHTML=`<td><input data-hid="${hid}" data-field="naam"></td>
    <td><input data-hid="${hid}" data-field="ras"></td>
    <td><input type="date" data-hid="${hid}" data-field="geboorte"></td>
    <td><input type="number" min="0" value="0" data-hid="${hid}" data-field="credits"></td>
    <td><input type="number" min="1" value="5" data-hid="${hid}" data-field="geldigheid"></td>
    <td><input data-hid="${hid}" data-field="notes"></td>
    <td><button onclick="delHond('${hid}')">🗑️</button> <button onclick="enrollDog('${hid}')">➕ Inschrijven</button></td>`;
  document.querySelector('#hondTbl tbody').appendChild(tr);
}
function delHond(hid){const row=document.querySelector(`#hondTbl [data-hid='${hid}']`)?.closest('tr'); if(row) row.remove();}
function collectHonden(){
  const rows=document.querySelectorAll('#hondTbl tbody tr'); const list=[];
  rows.forEach(r=>{const o={id:null}; r.querySelectorAll('input').forEach(i=>{if(!o.id)o.id=i.dataset.hid; const f=i.dataset.field; o[f]= (f==='credits'||f==='geldigheid')?parseInt(i.value||'0',10):i.value}); list.push(o)});
  return list;
}
function saveModal(){
  const id=document.getElementById('btnSave').dataset.id;
  const c={ id,
    voornaam:voornaam.value, achternaam:achternaam.value, email:email.value, telefoon:telefoon.value,
    adres:adres.value, postcode:postcode.value, gemeente:gemeente.value,
    honden:collectHonden()
  };
  const idx=all.findIndex(x=>x.id===id); if(idx>-1) all[idx]=c; else all.push(c);
  save(all); render(all); closeModal();
}
function enrollDog(hid){
  const cid=document.getElementById('hondTbl').dataset.cid;
  const c=all.find(x=>x.id===cid) || {id:cid, voornaam:voornaam.value, achternaam:achternaam.value, honden:collectHonden()};
  const h=(c.honden||[]).find(x=>x.id===hid); if(!h){alert('Bewaar eerst de klant en hond.');return}
  localStorage.setItem(TMP, JSON.stringify({klantId:c.id, hondId:h.id, klantNaam:`${c.voornaam} ${c.achternaam}`, hondNaam:h.naam}));
  location.href='lessen.html';
}
