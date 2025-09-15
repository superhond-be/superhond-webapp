document.addEventListener('DOMContentLoaded', () => {
const $ = s=>document.querySelector(s);
const store={lessons:[]};
// Tabs
document.querySelectorAll('.tab-button').forEach(btn=>{
 btn.addEventListener('click',()=>{
  document.querySelectorAll('.tab-button').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
  btn.classList.add('active');
  $('#'+btn.dataset.tab).classList.add('active');
 });
});
function readForm(){
 return{
  kenmerk:$('#inp-kenmerk').value,
  naam:$('#sel-lesnaam').value,
  type:$('#sel-lestype').value,
  locatie:$('#sel-locatie').value,
  trainers:Array.from($('#sel-trainers').selectedOptions).map(o=>o.value),
  max:$('#inp-max').value,
  prijs:$('#inp-prijs').value,
  strips:$('#inp-strips').value,
  lesuur:$('#inp-lesuur').value,
  start:$('#inp-start').value,
  mailblue:$('#inp-mailblue').value,
  beschrijving:$('#inp-beschrijving').value
 };
}
function renderPreview(d){
 $('#preview').innerHTML=`<strong>${d.kenmerk}</strong> — ${d.naam} (${d.type})<br>
 Locatie:${d.locatie} | Trainers:${d.trainers.join(', ')}<br>
 Max:${d.max} | Prijs:€${d.prijs} | Strippen:${d.strips}<br>
 Uur:${d.lesuur} | Start:${d.start}<br>
 MailBlue=${d.mailblue}<br>${d.beschrijving}`;
}
$('#btn-preview').onclick=()=>renderPreview(readForm());
$('#btn-save').onclick=()=>{const d=readForm();store.lessons.push(d);renderTable();fetch('/api/lessen/items',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});};
function renderTable(){
 $('#tbl-lessen tbody').innerHTML=store.lessons.map(l=>`<tr>
 <td>${l.kenmerk}</td><td>${l.naam}</td><td>${l.type}</td><td>${l.locatie}</td>
 <td>${l.trainers.join(', ')}</td><td>${l.max}</td><td>${l.prijs}</td><td>${l.strips}</td>
 <td>${l.lesuur}</td><td>${l.start}</td><td>${l.mailblue}</td></tr>`).join('');
}
fetch('/api/lessen/version').then(r=>r.json()).then(v=>$('#version-lessen').textContent=v.name+' v'+v.version);
});