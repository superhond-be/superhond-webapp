
// Strippenkaarten per hond (in-memory demo) + historiek
const state = {
  customers: [
    { id:'c1', name:'An De Smet', dogs:[ { id:'d1', name:'Loki' } ]},
    { id:'c2', name:'Tom Janssens', dogs:[ { id:'d2', name:'Nala' }, { id:'d3', name:'Rex' } ]},
    { id:'c3', name:'Sara Peeters', dogs:[ ]}
  ],
  cards: [
    { id:'s1', customerId:'c1', dogId:'d1', dog:'Loki', customer:'An De Smet', type:'Puppy Pack 10', total:10, used:3, start:'2025-09-01', log:[
      { t:'2025-09-02', action:'use', note:'Les gevolgd – Instap' },
      { t:'2025-09-05', action:'use', note:'Les gevolgd – Social Walk' },
      { t:'2025-09-07', action:'refund', note:'Annulering wegens ziekte' },
      { t:'2025-09-09', action:'use', note:'Les gevolgd – Basis 1' }
    ]},
    { id:'s2', customerId:'c2', dogId:'d2', dog:'Nala', customer:'Tom Janssens', type:'Basis 8', total:8, used:5, start:'2025-08-28', log:[
      { t:'2025-08-29', action:'use', note:'Les gevolgd – Week 1' },
      { t:'2025-09-01', action:'use', note:'Les gevolgd – Week 2' },
      { t:'2025-09-03', action:'use', note:'Les gevolgd – Week 3' },
      { t:'2025-09-05', action:'refund', note:'Les geannuleerd – regen' },
      { t:'2025-09-06', action:'use', note:'Les gevolgd – Week 3' }
    ]},
    { id:'s3', customerId:'c2', dogId:'d3', dog:'Rex', customer:'Tom Janssens', type:'Pubers 6', total:6, used:1, start:'2025-09-10', log:[
      { t:'2025-09-10', action:'use', note:'Kennismakingsles' }
    ]}
  ]
};

const el = s => document.querySelector(s);
const els = s => Array.from(document.querySelectorAll(s));

function remaining(card){ return Math.max(0, card.total - card.used); }

function renderTable(filter=''){
  const tbody = el('#cardRows');
  const q = filter.trim().toLowerCase();
  tbody.innerHTML = '';
  state.cards
    .filter(c => !q || [c.customer, c.dog, c.type].join(' ').toLowerCase().includes(q))
    .forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${c.customer}</td>
        <td>${c.dog}</td>
        <td>${c.type}</td>
        <td><span class="badge-num">${c.total}</span></td>
        <td><span class="badge-num">${c.used}</span></td>
        <td><span class="badge-num">${remaining(c)}</span></td>
        <td class="actions">
          <button class="btn btn-small" data-use="${c.id}">➖ Beurt</button>
          <button class="btn btn-small" data-refund="${c.id}">➕ Terug</button>
          <button class="btn btn-small" data-log="${c.id}">Historiek</button>
          <button class="btn btn-small" data-del="${c.id}">🗑</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

  tbody.querySelectorAll('button[data-use]').forEach(b=> b.addEventListener('click', onUse));
  tbody.querySelectorAll('button[data-refund]').forEach(b=> b.addEventListener('click', onRefund));
  tbody.querySelectorAll('button[data-del]').forEach(b=> b.addEventListener('click', onDel));
  tbody.querySelectorAll('button[data-log]').forEach(b=> b.addEventListener('click', onLog));
}

function onUse(e){
  const id = e.currentTarget.getAttribute('data-use');
  const c = state.cards.find(x=>x.id===id);
  if (!c) return;
  if (c.used >= c.total){ alert('Geen beurten meer over.'); return; }
  c.used += 1;
  c.log.push({ t: today(), action:'use', note:'Beurt afgetrokken' });
  renderTable(el('#search').value);
  renderLog(c);
}

function onRefund(e){
  const id = e.currentTarget.getAttribute('data-refund');
  const c = state.cards.find(x=>x.id===id);
  if (!c) return;
  if (c.used <= 0){ alert('Niets om terug te zetten.'); return; }
  c.used -= 1;
  c.log.push({ t: today(), action:'refund', note:'Beurt teruggezet' });
  renderTable(el('#search').value);
  renderLog(c);
}

function onDel(e){
  const id = e.currentTarget.getAttribute('data-del');
  const c = state.cards.find(x=>x.id===id);
  if (!c) return;
  if (confirm(`Strippenkaart van ${c.dog} (${c.customer}) verwijderen?`)){
    state.cards = state.cards.filter(x=>x.id!==id);
    el('#sideLog').innerHTML = '<p class="small">Selecteer een kaart om de historiek te zien.</p>';
    renderTable(el('#search').value);
  }
}

function onLog(e){
  const id = e.currentTarget.getAttribute('data-log');
  const c = state.cards.find(x=>x.id===id);
  renderLog(c);
}

function renderLog(card){
  if (!card){ el('#sideLog').innerHTML = '<p class="small">Geen kaart geselecteerd.</p>'; return; }
  const side = el('#sideLog');
  side.innerHTML = `
    <div class="card">
      <h3 class="card-title">Historiek</h3>
      <p class="small">${card.customer} — <strong>${card.dog}</strong><br>${card.type}</p>
      <div class="log">
        ${card.log.slice().reverse().map(item => `
          <div class="log-item">
            <div>${item.action === 'use' ? 'Beurt gebruikt' : 'Beurt teruggezet'}<br><span class="small">${item.note || ''}</span></div>
            <div class="when">${item.t}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function today(){
  const d = new Date();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function genId(prefix){ return prefix + Math.random().toString(36).slice(2,7).toUpperCase(); }

function openNewModal(){
  const modal = el('#newModal');
  modal.setAttribute('open','');

  // fill selects
  const selCustomer = el('#n-customer');
  const selDog = el('#n-dog');
  selCustomer.innerHTML = '<option value="">— Kies klant —</option>' + state.customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  selDog.innerHTML = '<option value="">— Kies hond —</option>';
  selCustomer.onchange = ()=>{
    const c = state.customers.find(x=>x.id===selCustomer.value);
    selDog.innerHTML = '<option value="">— Kies hond —</option>' + (c?.dogs||[]).map(d => `<option value="${d.id}">${d.name}</option>`).join('');
  };

  el('#newCancel').onclick = ()=> modal.removeAttribute('open');
  el('#newForm').onsubmit = (evt)=>{
    evt.preventDefault();
    const cId = selCustomer.value;
    const dId = selDog.value;
    const cObj = state.customers.find(x=>x.id===cId);
    const dObj = (cObj?.dogs||[]).find(x=>x.id===dId);
    if (!cObj || !dObj){ alert('Kies een klant en hond.'); return; }

    const card = {
      id: genId('S'),
      customerId: cObj.id,
      dogId: dObj.id,
      customer: cObj.name,
      dog: dObj.name,
      type: el('#n-type').value.trim() || 'Strippenkaart',
      total: parseInt(el('#n-total').value || '0', 10),
      used: 0,
      start: el('#n-start').value || today(),
      log: [{ t: today(), action:'new', note:`Kaart aangemaakt (${el('#n-type').value || 'Strippenkaart'})` }]
    };
    state.cards.push(card);
    modal.removeAttribute('open');
    renderTable(el('#search').value);
    renderLog(card);
  };
}

function init(){
  renderTable();
  renderLog(); // default side message
  el('#btnNew').addEventListener('click', openNewModal);
  el('#search').addEventListener('input', (e)=> renderTable(e.target.value));
}
document.addEventListener('DOMContentLoaded', init);
