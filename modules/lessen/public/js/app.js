document.addEventListener('DOMContentLoaded',()=>{
const $=s=>document.querySelector(s);
const store={lessons:[]};
function readForm(){
 return{
  naam:$('#sel-lesnaam').value||$('#inp-nieuwe-naam').value,
  prijs:$('#inp-prijs-naam').value,
  strips:$('#inp-strips-naam').value,
  max:$('#inp-max-naam').value,
  thema:$('#inp-thema').value,
  duur:$('#inp-duur').value,
  mailblue:$('#inp-mailblue-naam').value
 };
}
function renderPreview(d){
 $('#preview').innerHTML=`${d.naam} | €${d.prijs} | Strippen:${d.strips} | Max:${d.max} | Thema:${d.thema} | Duur:${d.duur} | MailBlue:${d.mailblue}`;
}
$('#btn-preview').onclick=()=>renderPreview(readForm());
$('#btn-save').onclick=()=>{const d=readForm();store.lessons.push(d);renderTable();fetch('/api/lessen/items',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});};
function renderTable(){
 $('#tbl-lessen tbody').innerHTML=store.lessons.map(l=>`<tr><td>${l.naam}</td><td>${l.prijs}</td><td>${l.strips}</td><td>${l.max}</td><td>${l.thema}</td><td>${l.duur}</td><td>${l.mailblue}</td></tr>`).join('');
}
fetch('/api/lessen/version').then(r=>r.json()).then(v=>$('#version-lessen').textContent=v.name+' v'+v.version);
});