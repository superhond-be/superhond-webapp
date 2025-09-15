document.addEventListener('DOMContentLoaded',()=>{
const $=s=>document.querySelector(s);const $$=s=>document.querySelectorAll(s);
let lessons=[];
// Tabs
$$('.tab-button').forEach(b=>b.addEventListener('click',()=>{
  $$('.tab-button').forEach(x=>x.classList.remove('active'));
  $$('.tab-content').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
  document.getElementById(b.dataset.tab).classList.add('active');
}));
// Save sample lesson
function saveLesson(){
  const l={
    naam:$('#inp-naam').value,
    type:$('#inp-type').value,
    locatie:$('#inp-locatie').value,
    lesgevers:$('#inp-lesgevers').value
  };
  lessons.push(l);renderTable();
}
window.saveLesson=saveLesson;
function renderTable(){
  $('#tbl-lessen tbody').innerHTML=lessons.map((l,i)=>`
    <tr>
      <td>${l.naam}</td><td>${l.type}</td><td>${l.locatie}</td><td>${l.lesgevers}</td>
      <td>
        <button class='btn-action btn-edit' onclick='editLesson(${i})'>✏️</button>
        <button class='btn-action btn-del' onclick='deleteLesson(${i})'>🗑️</button>
      </td>
    </tr>`).join('');
}
window.editLesson=i=>{
  const l=lessons[i];
  $('#inp-naam').value=l.naam;
  $('#inp-type').value=l.type;
  $('#inp-locatie').value=l.locatie;
  $('#inp-lesgevers').value=l.lesgevers;
  // switch to naam tab to edit
  document.querySelector('[data-tab=naam]').click();
  lessons.splice(i,1);renderTable();
};
window.deleteLesson=i=>{if(confirm('Verwijderen?')){lessons.splice(i,1);renderTable();}};
fetch('/api/lessen/version').then(r=>r.json()).then(v=>$('#version-lessen').textContent=v.name+' v'+v.version);
});