
// Klanten & Honden demo (client-side)
const stateKH = {
  clients: [
    { id: 'c1', name: 'Piet Janssens', email: 'piet@example.com', phone: '0471 12 34 56',
      dogs: [{id:'d1', name:'Rex', breed:'Labrador'}, {id:'d2', name:'Luna', breed:'Beagle'}] },
    { id: 'c2', name: 'Marie Peeters', email: 'marie@example.com', phone: '0487 98 76 54',
      dogs: [{id:'d3', name:'Max', breed:'Border Collie'}] }
  ]
};

const el = sel => document.querySelector(sel);

function renderClients(){
  const tbody = el('#clientRows');
  tbody.innerHTML = '';
  stateKH.clients.forEach(client => {
    const tr = document.createElement('tr');
    const dogList = client.dogs.map(d=>`<span class="tag">${d.name} (${d.breed})</span>`).join(' ');
    tr.innerHTML = `
      <td>${client.name}</td>
      <td>${client.email}<br><span class="muted">${client.phone}</span></td>
      <td>${dogList}</td>
      <td class="actions">
        <button class="btn btn-small" data-edit="${client.id}">Bewerken</button>
        <button class="btn btn-small" data-del="${client.id}">Verwijderen</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('button[data-edit]').forEach(b=> b.addEventListener('click', onEdit));
  tbody.querySelectorAll('button[data-del]').forEach(b=> b.addEventListener('click', onDel));
}

function onDel(e){
  const id = e.currentTarget.getAttribute('data-del');
  const c = stateKH.clients.find(x=>x.id===id);
  if (!c) return;
  if (confirm(`Klant '${c.name}' verwijderen?`)){
    stateKH.clients = stateKH.clients.filter(x=>x.id!==id);
    renderClients();
  }
}

function onEdit(e){
  const id = e.currentTarget.getAttribute('data-edit');
  const data = stateKH.clients.find(x=>x.id===id);
  openModal(data);
}

function onNew(){
  openModal();
}

function openModal(data){
  const modal = el('#clientModal');
  modal.setAttribute('open','');
  el('#c-id').value = data?.id ?? '';
  el('#c-name').value = data?.name ?? '';
  el('#c-email').value = data?.email ?? '';
  el('#c-phone').value = data?.phone ?? '';

  const dogsContainer = el('#c-dogs');
  dogsContainer.innerHTML = '';
  (data?.dogs ?? []).forEach(d => addDogRow(d));

  el('#btnAddDog').onclick = ()=> addDogRow();
  el('#btnCancelClient').onclick = ()=> modal.removeAttribute('open');

  el('#clientForm').onsubmit = evt => {
    evt.preventDefault();
    const formData = {
      id: el('#c-id').value.trim() || ('C' + Math.random().toString(36).slice(2,6).toUpperCase()),
      name: el('#c-name').value.trim(),
      email: el('#c-email').value.trim(),
      phone: el('#c-phone').value.trim(),
      dogs: Array.from(dogsContainer.querySelectorAll('.dog-row')).map(row => {
        return {
          id: row.dataset.id || ('D' + Math.random().toString(36).slice(2,6).toUpperCase()),
          name: row.querySelector('.dog-name').value.trim(),
          breed: row.querySelector('.dog-breed').value.trim()
        };
      }).filter(d => d.name)
    };
    const existingIdx = stateKH.clients.findIndex(x=>x.id===formData.id);
    if (existingIdx >= 0) stateKH.clients[existingIdx] = formData;
    else stateKH.clients.push(formData);
    modal.removeAttribute('open');
    renderClients();
  };
}

function addDogRow(dog){
  const dogsContainer = el('#c-dogs');
  const row = document.createElement('div');
  row.className = 'dog-row';
  row.dataset.id = dog?.id ?? '';
  row.style.display = 'flex';
  row.style.gap = '6px';
  row.style.marginBottom = '6px';
  row.innerHTML = `
    <input type="text" class="dog-name" placeholder="Naam hond" value="${dog?.name ?? ''}"/>
    <input type="text" class="dog-breed" placeholder="Ras" value="${dog?.breed ?? ''}"/>
    <button type="button" class="btn btn-small">✕</button>
  `;
  row.querySelector('button').onclick = ()=> row.remove();
  dogsContainer.appendChild(row);
}

function initKH(){
  renderClients();
  el('#btnNewClient').addEventListener('click', onNew);
}
document.addEventListener('DOMContentLoaded', initKH);
