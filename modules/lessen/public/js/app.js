document.addEventListener('DOMContentLoaded', ()=>{
  const $  = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  // Tabs
  $$('.tab-button').forEach(b=>b.addEventListener('click',()=>{
    $$('.tab-button').forEach(x=>x.classList.remove('active'));
    $$('.tab-content').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    document.getElementById(b.dataset.tab).classList.add('active');
  }));

  let settings = {
    namen:[], types:[], locaties:[], trainers:[],
    groups: { naam:{}, type:{}, locatie:{}, trainer:{} }
  };
  let lessons = [];

  const optionsFrom = arr => (arr||[]).map(v=>`<option>${v}</option>`).join('');
  const fillSelect  = (id, arr) => { const el=$(id); if(el) el.innerHTML = optionsFrom(arr); };

  async function loadSettings(){
    try{
      const r = await fetch('/api/lessen/settings');
      settings = await r.json();
    }catch(e){ console.warn(e); }
    fillSelect('#sel-naam', settings.namen||[]);
    fillSelect('#sel-type', settings.types||[]);
    fillSelect('#sel-locatie', settings.locaties||[]);
    renderTrainersTable();
    renderTrainerGroupsEditor();
    renderBeheerSelectors();
  }

  // --- Instellingen: Lesgevers tabel (naam + functie) ---
  function renderTrainersTable(){
    const tbody = $('#tbl-trainers tbody');
    tbody.innerHTML = (settings.trainers||[]).map((t,i)=>`
      <tr>
        <td><input class="inline-input t-naam" data-i="${i}" value="${t.naam||''}"></td>
        <td><input class="inline-input t-functie" data-i="${i}" value="${t.functie||''}"></td>
        <td><button class="btn small" onclick="delTrainer(${i})">🗑️</button></td>
      </tr>`).join('');
  }
  window.delTrainer = i => { settings.trainers.splice(i,1); renderTrainersTable(); };

  document.getElementById('btn-add-trainer').addEventListener('click', ()=>{
    settings.trainers.push({naam:'', functie:''});
    renderTrainersTable();
  });

  // --- Trainer-groepen editor (simple arrays of trainer names) ---
  function trainerGroupCard(name, values){
    const wrap=document.createElement('div');
    wrap.className='group';
    wrap.innerHTML=`
      <div class="row">
        <input class="grp-name" placeholder="Groepsnaam" value="${name||''}">
        <textarea class="grp-values" rows="3" placeholder="Trainer-namen (één per lijn)">${(values||[]).join('\n')}</textarea>
      </div>
      <div class="form-actions"><button class="btn small btn-del">Verwijder</button></div>`;
    wrap.querySelector('.btn-del').addEventListener('click',()=>wrap.remove());
    return wrap;
  }
  function renderTrainerGroupsEditor(){
    const host = $('#groep-trainer'); host.innerHTML='';
    const groups = settings.groups?.trainer || {};
    Object.keys(groups).forEach(gn=>host.appendChild(trainerGroupCard(gn, groups[gn])));
  }
  document.getElementById('btn-add-groep-trainer').addEventListener('click', ()=>{
    $('#groep-trainer').appendChild(trainerGroupCard('', []));
  });

  // Save settings (trainers + groups)
  document.getElementById('btn-save-settings').addEventListener('click', async ()=>{
    // read trainers table
    const rows = Array.from(document.querySelectorAll('#tbl-trainers tbody tr'));
    settings.trainers = rows.map(r=>({
      naam: r.querySelector('.t-naam').value.trim(),
      functie: r.querySelector('.t-functie').value.trim()
    })).filter(t=>t.naam);
    // read trainer groups
    const gwraps = Array.from(document.querySelectorAll('#groep-trainer .group'));
    const groups = {};
    gwraps.forEach(w=>{
      const name = w.querySelector('.grp-name').value.trim();
      const vals = w.querySelector('.grp-values').value.split('\n').map(v=>v.trim()).filter(Boolean);
      if(name) groups[name]=vals;
    });
    settings.groups = settings.groups || {};
    settings.groups.trainer = groups;
    try{
      await fetch('/api/lessen/settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(settings)});
      alert('Instellingen opgeslagen');
      renderBeheerSelectors();
    }catch(e){ console.warn(e); }
  });

  // --- Beheer: selectors ---
  function renderBeheerSelectors(){
    // Naam-groepen (met defaults)
    fillSelect('#sel-g-naam', Object.keys(settings.groups?.naam||{}));
    onNaamGroupChange();
    // Type en Locatie (platte lijsten)
    fillSelect('#sel-g-type-item', settings.types||[]);
    fillSelect('#sel-g-loc-item', settings.locaties||[]);
    // Trainer-groepen
    fillSelect('#sel-g-trainer', Object.keys(settings.groups?.trainer||{}));
    onTrainerGroupChange();
  }

  function onNaamGroupChange(){
    const grp = $('#sel-g-naam').value;
    const entry = settings.groups?.naam?.[grp] || {values:[], defaults:{}};
    fillSelect('#sel-g-naam-item', entry.values || []);
    $('#def-prijs').value = entry.defaults?.prijs ?? '';
    $('#def-strippen').value = entry.defaults?.strippen ?? '';
    $('#def-max').value = entry.defaults?.max ?? '';
    $('#def-lesduur').value = entry.defaults?.lesduur ?? '';
    $('#def-mailblue').value = entry.defaults?.mailblue ?? '';
  }
  document.getElementById('sel-g-naam').addEventListener('change', onNaamGroupChange);

  function onTrainerGroupChange(){
    const grp = $('#sel-g-trainer').value;
    const names = (settings.groups?.trainer?.[grp]) || [];
    // Map namen -> toon "Naam — Functie", value = naam
    const options = names.map(n=>{
      const t = (settings.trainers||[]).find(x=>x.naam===n) || {naam:n, functie:''};
      return `<option value="${t.naam}">${t.naam}${t.functie?(' — '+t.functie):''}</option>`;
    }).join('');
    $('#sel-g-trainer-items').innerHTML = options;
  }
  document.getElementById('sel-g-trainer').addEventListener('change', onTrainerGroupChange);

  // Generate lesson
  document.getElementById('btn-genereer').addEventListener('click', ()=>{
    const selectedTrainerNames = Array.from(document.querySelectorAll('#sel-g-trainer-items option:checked')).map(o=>o.value);
    const trainersFull = selectedTrainerNames.map(n => {
      const t = (settings.trainers||[]).find(x=>x.naam===n);
      return t ? {naam:t.naam, functie:t.functie} : {naam:n, functie:''};
    });
    const item = {
      naam: $('#sel-g-naam-item').value || '',
      type: $('#sel-g-type-item').value || '',
      locatie: $('#sel-g-loc-item').value || '',
      trainers: trainersFull,
      prijs: Number($('#def-prijs').value||0),
      strippen: Number($('#def-strippen').value||0),
      max: Number($('#def-max').value||0),
      lesduur: $('#def-lesduur').value || '',
      mailblue: $('#def-mailblue').value || ''
    };
    lessons.push(item);
    renderLessons();
  });

  function renderLessons(){
    $('#tbl-lessen tbody').innerHTML = lessons.map((l,i)=>`
      <tr>
        <td>${l.naam}</td><td>${l.type}</td><td>${l.locatie}</td>
        <td>${(l.trainers||[]).map(t=>t.naam+(t.functie?(' ('+t.functie+')'):'')).join(', ')}</td>
        <td>${l.prijs||''}</td><td>${l.strippen||''}</td><td>${l.max||''}</td><td>${l.lesduur||''}</td><td>${l.mailblue||''}</td>
        <td><button class="btn small" onclick="delLesson(${i})">🗑️</button></td>
      </tr>`).join('');
  }
  window.delLesson = i => { lessons.splice(i,1); renderLessons(); };

  // Footer
  fetch('/api/lessen/version').then(r=>r.json()).then(v=>document.getElementById('version-lessen').textContent = v.name+' v'+v.version);

  loadSettings();
});
