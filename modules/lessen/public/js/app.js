document.addEventListener('DOMContentLoaded', ()=>{
  const $ = s => document.querySelector(s);
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

  // Helpers
  const optionsFrom = arr => (arr||[]).map(v=>`<option>${v}</option>`).join('');
  const fillSelect  = (id, arr) => { const el=$(id); if(el) el.innerHTML = optionsFrom(arr); };

  async function loadSettings(){
    try{
      const r = await fetch('/api/lessen/settings');
      if(!r.ok) throw new Error('settings load failed');
      settings = await r.json();
    }catch(e){ console.warn(e); }
    fillSelect('#sel-naam', settings.namen||[]);
    fillSelect('#sel-type', settings.types||[]);
    fillSelect('#sel-locatie', settings.locaties||[]);
    fillSelect('#sel-trainers', settings.trainers||[]);
    renderNaamGroupEditors();
    renderNaamGroupSelectors();
  }

  // Quick add to lists
  $('#btn-naam-add')?.addEventListener('click',()=>{
    const v=$('#inp-naam-nieuw').value.trim(); if(!v) return;
    settings.namen.push(v); fillSelect('#sel-naam', settings.namen); $('#inp-naam-nieuw').value='';
  });
  $('#btn-type-add')?.addEventListener('click',()=>{
    const v=$('#inp-type-nieuw').value.trim(); if(!v) return;
    settings.types.push(v); fillSelect('#sel-type', settings.types); $('#inp-type-nieuw').value='';
  });
  $('#btn-loc-add')?.addEventListener('click',()=>{
    const v=$('#inp-loc-nieuw').value.trim(); if(!v) return;
    settings.locaties.push(v); fillSelect('#sel-locatie', settings.locaties); $('#inp-loc-nieuw').value='';
  });
  $('#btn-trainer-add')?.addEventListener('click',()=>{
    const v=$('#inp-trainer-nieuw').value.trim(); if(!v) return;
    settings.trainers.push(v); fillSelect('#sel-trainers', settings.trainers); $('#inp-trainer-nieuw').value='';
  });

  // ------- Instellingen: Naam-groepen editors (met defaults) -------
  function groupEditorNaam(groupName, entry){
    const values = (entry&&entry.values)||[];
    const d = (entry&&entry.defaults)||{};
    const wrap=document.createElement('div');
    wrap.className='group';
    wrap.innerHTML=`
      <div class="form-grid">
        <div class="form-row"><label>Groepsnaam</label><input class="grp-name" value="${groupName||''}"></div>
        <div class="form-row"><label>Waarden (één per lijn)</label><textarea class="grp-values" rows="3">${values.join('\n')}</textarea></div>
      </div>
      <fieldset class="defaults">
        <legend>Standaardwaarden</legend>
        <div class="form-grid">
          <div class="form-row"><label>Prijs (€)</label><input class="def-prijs" type="number" step="0.01" value="${d.prijs ?? ''}"></div>
          <div class="form-row"><label>Strippen</label><input class="def-strippen" type="number" value="${d.strippen ?? ''}"></div>
          <div class="form-row"><label>Max deelnemers</label><input class="def-max" type="number" value="${d.max ?? ''}"></div>
          <div class="form-row"><label>Lesduur</label><input class="def-lesduur" type="text" value="${d.lesduur ?? ''}"></div>
          <div class="form-row"><label>MailBlue</label><input class="def-mailblue" type="text" value="${d.mailblue ?? ''}"></div>
        </div>
      </fieldset>
      <div class="form-actions"><button class="btn small btn-del">Verwijder groep</button></div>`;
    wrap.querySelector('.btn-del').addEventListener('click',()=>wrap.remove());
    return wrap;
  }

  function renderNaamGroupEditors(){
    const host = document.getElementById('groep-naam');
    host.innerHTML='';
    const naamGroups=(settings.groups&&settings.groups.naam)||{};
    Object.keys(naamGroups).forEach(gn=>host.appendChild(groupEditorNaam(gn, naamGroups[gn])));
  }

  function collectNaamGroups(){
    const out={};
    document.querySelectorAll('#groep-naam .group').forEach(g=>{
      const name=g.querySelector('.grp-name').value.trim();
      const values=g.querySelector('.grp-values').value.split('\n').map(v=>v.trim()).filter(Boolean);
      const d={
        prijs: g.querySelector('.def-prijs').value? Number(g.querySelector('.def-prijs').value): null,
        strippen: g.querySelector('.def-strippen').value? Number(g.querySelector('.def-strippen').value): null,
        max: g.querySelector('.def-max').value? Number(g.querySelector('.def-max').value): null,
        lesduur: g.querySelector('.def-lesduur').value || '',
        mailblue: g.querySelector('.def-mailblue').value || ''
      };
      if(name){ out[name]={values, defaults:d}; }
    });
    return out;
  }

  document.getElementById('btn-add-groep-naam').addEventListener('click',()=>{
    document.getElementById('groep-naam').appendChild(groupEditorNaam('', {values:[], defaults:{}}));
  });

  document.getElementById('btn-save-groepen').addEventListener('click', async ()=>{
    settings.groups.naam = collectNaamGroups();
    try{
      await fetch('/api/lessen/settings', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(settings) });
      alert('Groepen opgeslagen');
      renderNaamGroupSelectors();
    }catch(e){ console.warn(e); }
  });

  // ------- Beheer: selectie + defaults prefill -------
  function renderNaamGroupSelectors(){
    const g = settings.groups?.naam || {};
    const keys = Object.keys(g);
    fillSelect('#sel-g-naam', keys);
    onNaamGroupChange();
  }

  function onNaamGroupChange(){
    const grp = document.getElementById('sel-g-naam').value;
    const entry = settings.groups?.naam?.[grp] || {values:[], defaults:{}};
    fillSelect('#sel-g-naam-item', entry.values || []);
    document.getElementById('def-prijs').value = entry.defaults?.prijs ?? '';
    document.getElementById('def-strippen').value = entry.defaults?.strippen ?? '';
    document.getElementById('def-max').value = entry.defaults?.max ?? '';
    document.getElementById('def-lesduur').value = entry.defaults?.lesduur ?? '';
    document.getElementById('def-mailblue').value = entry.defaults?.mailblue ?? '';
  }
  document.getElementById('sel-g-naam').addEventListener('change', onNaamGroupChange);

  document.getElementById('btn-genereer').addEventListener('click', ()=>{
    const item={
      naam: document.getElementById('sel-g-naam-item').value || '',
      prijs: Number(document.getElementById('def-prijs').value||0),
      strippen: Number(document.getElementById('def-strippen').value||0),
      max: Number(document.getElementById('def-max').value||0),
      lesduur: document.getElementById('def-lesduur').value || '',
      mailblue: document.getElementById('def-mailblue').value || ''
    };
    lessons.push(item);
    renderLessons();
  });

  function renderLessons(){
    document.querySelector('#tbl-lessen tbody').innerHTML = lessons.map((l,i)=>`
      <tr>
        <td>${l.naam}</td><td>${l.prijs}</td><td>${l.strippen}</td><td>${l.max}</td><td>${l.lesduur}</td><td>${l.mailblue}</td>
        <td><button class="btn small" onclick="delLesson(${i})">Verwijder</button></td>
      </tr>`).join('');
  }
  window.delLesson = i => { lessons.splice(i,1); renderLessons(); };

  // Footer
  fetch('/api/lessen/version').then(r=>r.json()).then(v=>document.getElementById('version-lessen').textContent = v.name+' v'+v.version);

  loadSettings();
});
