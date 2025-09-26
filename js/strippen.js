
// In-memory strippenkaart per hond, met history
const state = {
  customers: [
    { id:'c1', name:'An De Smet', dogs:[
      { id:'d1', name:'Loki', cards:[
        { id:'s1', type:'Puppy Pack', total:10, used:3, start:'2025-09-01', history:[
          {dt:'2025-09-03', action:'-1 beurt', note:'Les gevolgd Retie'},
          {dt:'2025-09-05', action:'-1 beurt', note:'Les gevolgd Retie'},
          {dt:'2025-09-07', action:'-1 beurt', note:'Les gevolgd Dessel'},
        ]}
      ]}
    ]},
    { id:'c2', name:'Tom Janssens', dogs:[
      { id:'d2', name:'Nala', cards:[
        { id:'s2', type:'Basiskaart', total:8, used:5, start:'2025-08-20', history:[
          {dt:'2025-08-21', action:'-1 beurt', note:'Basisgroep Mol'},
          {dt:'2025-08-28', action:'-1 beurt', note:'Basisgroep Mol'},
          {dt:'2025-09-01', action:'-1 beurt', note:'Afmelding geannuleerd', undo:true}
        ]}
      ]},
      { id:'d3', name:'Rex', cards:[]}
    ]}
  ]
};

const el = s => document.querySelector(s);

function render(){
  const tbody = el('#cardRows');
  tbody.innerHTML = '';
  state.customers.forEach(c => {
    c.dogs.forEach(d => {
      (d.cards||[]).forEach(card => {
        const rest = card.total - card.used;
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${c.name}</td>
          <td>${d.name}</td>
          <td>${card.type}</td>
          <td>${card.total}</td>
          <td>${card.used}</td>
          <td>${rest}</td>
          <td class="actions">
            <button class="btn btn-small" data-sub="${c.id}|${d.id}|${card.id}">-1</button>
            <button class="btn btn-small" data-add="${c.id}|${d.id}|${card.id}">+1</button>
            <button class="btn btn-small" data-hist="${c.id}|${d.id}|${card.id}">Historiek</button>
            <button class="btn btn-small" data-del="${c.id}|${d.id}|${card.id}">🗑</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    });
  });

  tbody.querySelectorAll('button[data-sub]').forEach(b=> b.addEventListener('click', onSub));
  tbody.querySelectorAll('button[data-add]').forEach(b=> b.addEventListener('click', onAdd));
  tbody.querySelectorAll('button[data-del]').forEach(b=> b.addEventListener('click', onDel));
  tbody.querySelectorAll('button[data-hist]').forEach(b=> b.addEventListener('click', onHist));
}

function findPath(path){
  const [cid,did,sid] = path.split('|');
  const c = state.customers.find(x=>x.id===cid);
  const d = c?.dogs.find(x=>x.id===did);
  const s = d?.cards.find(x=>x.id===sid);
  return {c,d,s};
}

function onSub(e){
  const path = e.currentTarget.getAttribute('data-sub');
  const {s} = findPath(path);
  if (!s) return;
  if (s.used < s.total){
    s.used++;
    s.history.push({dt:new Date().toISOString().slice(0,10), action:'-1 beurt', note:'Manueel afgetrokken'});
    render();
  }
}
function onAdd(e){
  const path = e.currentTarget.getAttribute('data-add');
  const {s} = findPath(path);
  if (!s) return;
  if (s.used > 0){
    s.used--;
    s.history.push({dt:new Date().toISOString().slice(0,10), action:'+1 beurt', note:'Teruggezet'});
    render();
  }
}
function onDel(e){
  const path = e.currentTarget.getAttribute('data-del');
  const {d,s} = findPath(path);
  if (!s) return;
  if (confirm(`Strippenkaart ${s.type} verwijderen?`)){
    d.cards = d.cards.filter(x=>x.id!==s.id);
    render();
  }
}
function onHist(e){
  const path = e.currentTarget.getAttribute('data-hist');
  const {c,d,s} = findPath(path);
  if (!s) return;
  const modal = el('#histModal');
  modal.setAttribute('open','');
  el('#histTitle').textContent = `Historiek – ${d.name} (${s.type})`;
  const cont = el('#histBody');
  cont.innerHTML = s.history.map(h=> `<div class="history-item">${h.dt} — ${h.action} (${h.note||''})</div>`).join('') || '<p class="small">Geen historiek</p>';
  el('#histClose').onclick = ()=> modal.removeAttribute('open');
}

function onNew(){
  const modal = el('#newModal');
  modal.setAttribute('open','');
  const selectCust = el('#selCust');
  selectCust.innerHTML = '';
  state.customers.forEach(c=>{
    c.dogs.forEach(d=>{
      const opt = document.createElement('option');
      opt.value = c.id+'|'+d.id;
      opt.textContent = c.name + ' – ' + d.name;
      selectCust.appendChild(opt);
    });
  });
  el('#newCancel').onclick = ()=> modal.removeAttribute('open');
  el('#newForm').onsubmit = (evt)=>{
    evt.preventDefault();
    const path = selectCust.value.split('|');
    const c = state.customers.find(x=>x.id===path[0]);
    const d = c?.dogs.find(x=>x.id===path[1]);
    const card = {
      id: 's'+Math.random().toString(36).slice(2,7).toUpperCase(),
      type: el('#newType').value.trim(),
      total: parseInt(el('#newTotal').value)||0,
      used: 0,
      start: el('#newStart').value,
      history: []
    };
    d.cards.push(card);
    modal.removeAttribute('open');
    render();
  };
}

function init(){
  render();
  el('#btnNewCard').addEventListener('click', onNew);
}
document.addEventListener('DOMContentLoaded', init);
