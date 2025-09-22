
let data = [];
async function load(){
  const r = await fetch('../data/strippen.json'); data = await r.json();
  const tbody = document.getElementById('strippen-body'); tbody.innerHTML='';
  data.forEach(s=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${s.klant}</td><td>${s.land}</td><td>${s.saldo}</td><td>${s.gebruikt}</td><td>${s.inverwerking}</td>`;
    tbody.appendChild(tr);
  });
}
document.addEventListener('DOMContentLoaded', load);
