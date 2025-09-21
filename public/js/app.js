
async function loadData(){
  const resp = await fetch('../data/klanten.json');
  const data = await resp.json();
  const tbody = document.querySelector('#klanten-body');
  tbody.innerHTML = '';
  data.forEach(k=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${k.naam}</td><td>${k.email}</td><td>${k.telefoon}</td>
      <td class='actions'><button onclick="editKlant('${k.id}')">✏️</button>
      <button onclick="saveKlant('${k.id}')">💾</button>
      <button onclick="delKlant('${k.id}')">🗑️</button></td>`;
    tbody.appendChild(tr);
  });
}
function editKlant(id){ console.log('Edit',id); alert('Edit klant '+id); }
function saveKlant(id){ console.log('Save',id); alert('Save klant '+id); }
function delKlant(id){ console.log('Delete',id); alert('Delete klant '+id); }

async function loadHonden(){
  const resp = await fetch('../data/honden.json');
  const data = await resp.json();
  const tbody = document.querySelector('#honden-body');
  tbody.innerHTML = '';
  data.forEach(h=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${h.naam}</td><td>${h.ras}</td><td>${h.leeftijd}</td><td>${h.eigenaar}</td>
      <td class='actions'><button onclick="editHond('${h.id}')">✏️</button>
      <button onclick="saveHond('${h.id}')">💾</button>
      <button onclick="delHond('${h.id}')">🗑️</button></td>`;
    tbody.appendChild(tr);
  });
}
function editHond(id){ console.log('Edit hond',id); alert('Edit hond '+id); }
function saveHond(id){ console.log('Save hond',id); alert('Save hond '+id); }
function delHond(id){ console.log('Delete hond',id); alert('Delete hond '+id); }

window.addEventListener('DOMContentLoaded', ()=>{
  if(document.querySelector('#klanten-body')) loadData();
  if(document.querySelector('#honden-body')) loadHonden();
});
