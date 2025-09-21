
async function loadLessen(){
  const resp = await fetch('../data/lessen.json');
  const data = await resp.json();
  const tbody = document.querySelector('#lessen-body');
  tbody.innerHTML = '';
  data.forEach(l=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${l.naam}</td><td>${l.type}</td><td>${l.locatie}</td><td>${l.start}</td>
      <td>${l.prijs}</td><td>${l.credits}</td><td>${l.max}</td>
      <td class='bollen'><span class='bol totaal' title='Totaal'></span><span class='bol gebruikt' title='Gebruikt'></span><span class='bol inverwerking' title='In verwerking'></span></td>`;
    tbody.appendChild(tr);
  });
}
async function loadStrippen(){
  const resp = await fetch('../data/strippen.json');
  const data = await resp.json();
  const tbody = document.querySelector('#strippen-body');
  tbody.innerHTML = '';
  data.forEach(s=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${s.klant}</td><td>${s.saldo}</td><td>${s.gebruikt}</td><td>${s.inverwerking}</td>
      <td class='bollen'><span class='bol totaal' title='Totaal'></span><span class='bol gebruikt' title='Gebruikt'></span><span class='bol inverwerking' title='In verwerking'></span></td>`;
    tbody.appendChild(tr);
  });
}
window.addEventListener('DOMContentLoaded', ()=>{
  if(document.querySelector('#lessen-body')) loadLessen();
  if(document.querySelector('#strippen-body')) loadStrippen();
});
