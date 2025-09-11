document.addEventListener('DOMContentLoaded', () => {
  // ----- Tabs
  const buttons = document.querySelectorAll('.tab-button');
  const panels  = document.querySelectorAll('.tab-content');
  buttons.forEach(b => b.addEventListener('click', () => {
    buttons.forEach(x => x.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    b.classList.add('active');
    document.getElementById(b.dataset.tab).classList.add('active');
  }));

  // ----- In-memory data
  const store = {
    namen:   ['Puppy Start','Pubergroep'],
    types:   ['PuppyPack','Basisgroep'],
    locaties:['Retie','Dessel'],
    trainers:['Trainer 1','Trainer 2'],
    lessen:  []
  };

  // ----- helpers
  const $ = sel => document.querySelector(sel);
  function fillSelect(sel, arr){ sel.innerHTML = arr.map(v=>`<option>${v}</option>`).join(''); }
  function selectedValues(select){ return Array.from(select.selectedOptions).map(o => o.value); }

  // ----- Populate selects
  const selNaam     = $('#sel-lesnaam');
  const selType     = $('#sel-lestype');
  const selLocatie  = $('#sel-locatie');
  const selTrainers = $('#sel-trainers');

  fillSelect(selNaam, store.namen);
  fillSelect(selType, store.types);
  fillSelect(selLocatie, store.locaties);
  fillSelect(selTrainers, store.trainers);

  // ----- Add buttons
  $('#btn-add-naam').addEventListener('click', () => {
    const v = $('#inp-nieuwe-naam').value.trim();
    if(!v) return;
    store.namen.push(v); fillSelect(selNaam, store.namen); $('#inp-nieuwe-naam').value='';
  });
  $('#btn-add-type').addEventListener('click', () => {
    const v = $('#inp-nieuw-type').value.trim();
    if(!v) return;
    store.types.push(v); fillSelect(selType, store.types); $('#inp-nieuw-type').value='';
  });
  $('#btn-add-loc').addEventListener('click', () => {
    const v = $('#inp-nieuwe-loc').value.trim();
    if(!v) return;
    store.locaties.push(v); fillSelect(selLocatie, store.locaties); $('#inp-nieuwe-loc').value='';
  });
  $('#btn-add-trainer').addEventListener('click', () => {
    const v = $('#inp-nieuwe-trainer').value.trim();
    if(!v) return;
    store.trainers.push(v); fillSelect(selTrainers, store.trainers); $('#inp-nieuwe-trainer').value='';
  });

  // ----- Preview + Save
  function readForm(){
    return {
      kenmerk: $('#inp-kenmerk').value.trim(),
      naam: selNaam.value || '',
      type: selType.value || '',
      locatie: selLocatie.value || '',
      trainers: selectedValues(selTrainers),
      max:  parseInt($('#inp-max').value || '0',10),
      prijs: parseFloat($('#inp-prijs').value || '0'),
      strips: parseInt($('#inp-strips').value || '0',10),
      lesuur: $('#inp-lesuur').value || '',
      start: $('#inp-start').value || '',
      beschrijving: $('#inp-beschrijving').value.trim()
    };
  }

  function renderPreview(data){
    $('#preview').innerHTML = `
      <strong>${data.naam}</strong> (${data.kenmerk || '-'}) — ${data.type} in <strong>${data.locatie}</strong><br>
      Lesgevers: ${data.trainers.join(', ') || '-'}<br>
      Max: ${data.max || '-'} • € ${(data.prijs||0).toFixed(2)} • Strippen: ${data.strips || '-'}<br>
      Uur: ${data.lesuur || '-'} • Start: ${data.start || '-'}<br>
      <em>${data.beschrijving || ''}</em>
    `;
  }

  $('#btn-preview').addEventListener('click', () => { renderPreview(readForm()); });

  $('#btn-save').addEventListener('click', (e) => {
    e.preventDefault();
    const data = readForm();
    // mini-validatie
    if(!data.naam || !data.type || !data.locatie || data.trainers.length === 0){
      alert('Vul minstens Naam, Type, Locatie en één Lesgever in.'); return;
    }
    store.lessen.push(data);
    appendRow(data);
    // TODO: vervang door POST naar backend wanneer klaar
  });

  const tbody = $('#tbl-lessen tbody');
  function appendRow(x){
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${x.kenmerk || '-'}</td>
      <td>${x.naam}</td>
      <td>${x.type}</td>
      <td>${x.locatie}</td>
      <td>${x.trainers.join(', ')}</td>
      <td>${x.max || '-'}</td>
      <td>${(x.prijs||0).toFixed(2)}</td>
      <td>${x.strips || '-'}</td>
      <td>${x.lesuur || '-'}</td>
      <td>${x.start || '-'}</td>
    `;
    tbody.appendChild(tr);
  }
});