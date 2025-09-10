
// In-memory klant + honden beheer
const state = {
  customers: [
    { id:'c1', name:'An De Smet', email:'an@somedomain.be', phone:'+32 478 12 34 56', dogs:[
      { id:'d1', name:'Loki', breed:'Border Collie', birth:'2023-04-01', notes:'Energievol' }
    ]},
    { id:'c2', name:'Tom Janssens', email:'tom@ex.be', phone:'+32 495 22 11 00', dogs:[
      { id:'d2', name:'Nala', breed:'Labrador', birth:'2022-10-10', notes:'' },
      { id:'d3', name:'Rex', breed:'Malinois', birth:'2021-02-05', notes:'Gevoelig aan prikkels' }
    ]},
    { id:'c3', name:'Sara Peeters', email:'sara@peeters.be', phone:'', dogs:[]}
  ]
};

const el = s => document.querySelector(s);
const els = s => Array.from(document.querySelectorAll(s));

function renderList(filter=''){
  const tbody = el('#custRows');
  const q = filter.trim().toLowerCase();
  tbody.innerHTML = '';
  state.customers
    .filter(c => !q || [c.name,c.email,c.phone,(c.dogs||[]).map(d=>d.name).join(' ')].join(' ').toLowerCase().includes(q))
    .forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${c.name || '-'}</td>
        <td>${c.email || '-'}</td>
        <td>${c.phone || '-'}</td>
        <td>${(c.dogs||[]).map(d => `<span class="dog">${d.name}</span>`).join(' ') || '<span class="small">Geen honden</span>'}</td>
        <td class="actions">
          <button class="btn btn-small" data-edit="${c.id}">Bewerken</button>
          <button class="btn btn-small" data-adddog="${c.id}">+ Hond</button>
          <button class="btn btn-small" data-del="${c.id}">Verwijderen</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

  tbody.querySelectorAll('button[data-edit]').forEach(b=> b.addEventListener('click', onEdit));
  tbody.querySelectorAll('button[data-adddog]').forEach(b=> b.addEventListener('click', onAddDog));
  tbody.querySelectorAll('button[data-del]').forEach(b=> b.addEventListener('click', onDel));
}

function genId(prefix){ return prefix + Math.random().toString(36).slice(2,7).toUpperCase(); }

function onNew(){
  openCustomerModal();
}

function onEdit(e){
  const id = e.currentTarget.getAttribute('data-edit');
  const c = state.customers.find(x=>x.id===id);
  openCustomerModal(c);
}

function onDel(e){
  const id = e.currentTarget.getAttribute('data-del');
  const c = state.customers.find(x=>x.id===id);
  if (!c) return;
  if (confirm(`Klant '${c.name}' verwijderen?`)){
    state.customers = state.customers.filter(x=>x.id!==id);
    renderList(el('#search').value);
  }
}

function onAddDog(e){
  const id = e.currentTarget.getAttribute('data-adddog');
  const c = state.customers.find(x=>x.id===id);
  openDogModal(c);
}

function openCustomerModal(data){
  const modal = el('#custModal');
  modal.setAttribute('open','');
  el('#c-id').value = data?.id ?? '';
  el('#c-name').value = data?.name ?? '';
  el('#c-email').value = data?.email ?? '';
  el('#c-phone').value = data?.phone ?? '';
  // list dogs inside modal for quick remove
  const list = el('#c-dogs');
  list.innerHTML = (data?.dogs ?? []).map(d => `
    <div class="dog" data-dog="${d.id}">${d.name}
      <button title="Verwijderen" aria-label="Verwijder hond" onclick="removeDogFromModal('${d.id}')">×</button>
    </div>
  `).join('');

  el('#custCancel').onclick = ()=> modal.removeAttribute('open');
  el('#custForm').onsubmit = (evt)=>{
    evt.preventDefault();
    const id = el('#c-id').value.trim() || genId('C');
    const next = {
      id,
      name: el('#c-name').value.trim(),
      email: el('#c-email').value.trim(),
      phone: el('#c-phone').value.trim(),
      dogs: (data?.dogs ?? [])
    };
    const idx = state.customers.findIndex(x=>x.id===id);
    if (idx>=0) state.customers[idx] = next; else state.customers.push(next);
    modal.removeAttribute('open');
    renderList(el('#search').value);
  };
}

function removeDogFromModal(dogId){
  // remove from currently edited customer's dog list in the modal context
  // We can't directly know which customer, so read hidden c-id and update state before saving later
  const id = el('#c-id').value.trim();
  const cust = id ? state.customers.find(x=>x.id===id) : null;
  if (!cust) return;
  cust.dogs = (cust.dogs||[]).filter(d => d.id !== dogId);
  // re-render the chip list
  const list = el('#c-dogs');
  list.innerHTML = (cust.dogs ?? []).map(d => `
    <div class="dog" data-dog="${d.id}">${d.name}
      <button title="Verwijderen" aria-label="Verwijder hond" onclick="removeDogFromModal('${d.id}')">×</button>
    </div>
  `).join('');
}

function openDogModal(customer){
  const modal = el('#dogModal');
  modal.setAttribute('open','');
  el('#d-for').textContent = customer?.name ?? '';
  el('#d-name').value = '';
  el('#d-breed').value = '';
  el('#d-birth').value = '';
  el('#d-notes').value = '';
  el('#dogCancel').onclick = ()=> modal.removeAttribute('open');
  el('#dogForm').onsubmit = (evt)=>{
    evt.preventDefault();
    const dog = {
      id: genId('D'),
      name: el('#d-name').value.trim(),
      breed: el('#d-breed').value.trim(),
      birth: el('#d-birth').value,
      notes: el('#d-notes').value.trim()
    };
    if (!dog.name){ alert('Geef een hondennaam in.'); return; }
    const c = state.customers.find(x=>x.id===customer.id);
    c.dogs = c.dogs || [];
    c.dogs.push(dog);
    modal.removeAttribute('open');
    renderList(el('#search').value);
  };
}

function init(){
  renderList();
  el('#btnNewCust').addEventListener('click', onNew);
  el('#search').addEventListener('input', (e)=> renderList(e.target.value));
}
document.addEventListener('DOMContentLoaded', init);
