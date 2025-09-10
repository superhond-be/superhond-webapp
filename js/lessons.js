
// Lessenbeheer (client-side demo, no backend)
const state = {
  trainers: [
    { id: 't1', name: 'Leen' },
    { id: 't2', name: 'Bart' },
    { id: 't3', name: 'Sofie' },
    { id: 't4', name: 'Jan' }
  ],
  lessons: [
    { id: 'L001', name: 'Puppy Pack — Instap', location: 'Retie', date: '2025-09-17', start: '18:30', end: '19:30', trainers: ['t1','t3'] },
    { id: 'L002', name: 'Basisgroep — Week 2', location: 'Mol',   date: '2025-09-18', start: '19:00', end: '20:00', trainers: ['t2'] },
    { id: 'L003', name: 'Pubergroep — Social Walk', location: 'Dessel', date: '2025-09-19', start: '10:00', end: '11:00', trainers: ['t1','t2','t4'] }
  ]
};

const el = sel => document.querySelector(sel);
const els = sel => Array.from(document.querySelectorAll(sel));

function trainerName(id){ return state.trainers.find(t=>t.id===id)?.name ?? id; }

function renderTable(){
  const tbody = el('#lessonRows');
  tbody.innerHTML = '';
  state.lessons.forEach(lesson => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${lesson.name}</td>
      <td>${lesson.location}</td>
      <td>${lesson.date} ${lesson.start}–${lesson.end}</td>
      <td>${lesson.trainers.map(id => `<span class="tag">${trainerName(id)}</span>`).join(' ')}</td>
      <td class="actions">
        <button class="btn btn-small" data-edit="${lesson.id}">Bewerken</button>
        <button class="btn btn-small" data-del="${lesson.id}">Verwijderen</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // wire buttons
  tbody.querySelectorAll('button[data-edit]').forEach(b=> b.addEventListener('click', onEdit));
  tbody.querySelectorAll('button[data-del]').forEach(b=> b.addEventListener('click', onDel));
}

function onDel(e){
  const id = e.currentTarget.getAttribute('data-del');
  const l = state.lessons.find(x=>x.id===id);
  if (!l) return;
  if (confirm(`Les '${l.name}' verwijderen?`)){
    state.lessons = state.lessons.filter(x=>x.id!==id);
    renderTable();
  }
}

function onEdit(e){
  const id = e.currentTarget.getAttribute('data-edit');
  const data = state.lessons.find(x=>x.id===id);
  openModal(data);
}

function onNew(){
  openModal();
}

function openModal(data){
  const modal = el('#lessonModal');
  modal.setAttribute('open','');
  el('#m-id').value = data?.id ?? '';
  el('#m-name').value = data?.name ?? '';
  el('#m-location').value = data?.location ?? '';
  el('#m-date').value = data?.date ?? '';
  el('#m-start').value = data?.start ?? '';
  el('#m-end').value = data?.end ?? '';
  // trainers multiselect
  const container = el('#m-trainers');
  container.innerHTML = '';
  state.trainers.forEach(t => {
    const id = `chk_${t.id}`;
    const wrap = document.createElement('label');
    wrap.style.display = 'inline-flex';
    wrap.style.alignItems = 'center';
    wrap.style.gap = '6px';
    wrap.style.margin = '4px 12px 4px 0';
    wrap.innerHTML = `<input type="checkbox" id="${id}" value="${t.id}"> ${t.name}`;
    container.appendChild(wrap);
  });
  const chosen = new Set(data?.trainers ?? []);
  container.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = chosen.has(c.value));

  el('#btnCancel').onclick = ()=> modal.removeAttribute('open');
  el('#lessonForm').onsubmit = (evt)=>{
    evt.preventDefault();
    const formData = {
      id: el('#m-id').value.trim() || ('L' + Math.random().toString(36).slice(2,6).toUpperCase()),
      name: el('#m-name').value.trim(),
      location: el('#m-location').value.trim(),
      date: el('#m-date').value,
      start: el('#m-start').value,
      end: el('#m-end').value,
      trainers: Array.from(container.querySelectorAll('input:checked')).map(c=>c.value)
    };
    if (!formData.name){ alert('Geef een lesnaam in.'); return; }
    const existingIdx = state.lessons.findIndex(x=>x.id===formData.id);
    if (existingIdx >= 0){
      state.lessons[existingIdx] = formData;
    } else {
      state.lessons.push(formData);
    }
    modal.removeAttribute('open');
    renderTable();
  };
}

function init(){
  renderTable();
  el('#btnNew').addEventListener('click', onNew);
}
document.addEventListener('DOMContentLoaded', init);
