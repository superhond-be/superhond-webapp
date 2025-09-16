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

  let settings = {namen:[], types:[], locaties:[], themas:[], trainers:[], groups:{naam:{},trainer:{}}};
  let lessons = [];

  const optionsFrom = arr => (arr||[]).map(v=>`<option>${v}</option>`).join('');
  const fillSelect  = (id, arr) => { const el=$(id); if(el) el.innerHTML = optionsFrom(arr); };

  async function loadSettings(){
    try{
      const r = await fetch('/api/lessen/settings');
      settings = await r.json();
    }catch(e){ console.warn(e); }
    renderNamen(); renderTypes(); renderLocaties(); renderThemas(); renderTrainers(); renderTrainerGroups();
    renderBeheerSelectors();
    fetch('/api/lessen/version').then(r=>r.json()).then(v=>$('#version-lessen').textContent = v.name+' v'+v.version);
  }

  // ===== Namen (met defaults per naam) =====
  function renderNamen(){
    const tbody = $('#tbl-namen tbody');
    tbody.innerHTML = (settings.namen||[]).map((n,i)=>`
      <tr>
        <td><input class="inline n-naam" data-i="${i}" value="${n.naam||''}"></td>
        <td><input type="number" class="inline n-prijs" data-i="${i}" value="${n.prijs||''}"></td>
        <td><input type="number" class="inline n-strippen" data-i="${i}" value="${n.strippen||''}"></td>
        <td><input type="number" class="inline n-max" data-i="${i}" value="${n.max||''}"></td>
        <td><input type="number" class="inline n-lesduur" data-i="${i}" value="${n.lesduurMin||''}" placeholder="min"></td>
        <td><input class="inline n-mailblue" data-i="${i}" value="${n.mailblue||''}"></td>
        <td><button class="btn small" onclick="delNaam(${i})">🗑️</button></td>
      </tr>`).join('');
  }
  window.delNaam = i => { settings.namen.splice(i,1); renderNamen(); };
  $('#btn-add-naam').addEventListener('click', ()=>{ settings.namen.push({naam:'',prijs:null,strippen:null,max:null,lesduurMin:null,mailblue:''}); renderNamen(); });

  // ===== Types =====
  function renderTypes(){
    const tbody = $('#tbl-types tbody');
    tbody.innerHTML = (settings.types||[]).map((t,i)=>`
      <tr>
        <td><input class="inline t-naam" data-i="${i}" value="${t.naam||''}"></td>
        <td><input class="inline t-beschrijving" data-i="${i}" value="${t.beschrijving||''}"></td>
        <td><button class="btn small" onclick="delType(${i})">🗑️</button></td>
      </tr>`).join('');
  }
  window.delType = i => { settings.types.splice(i,1); renderTypes(); };
  $('#btn-add-type').addEventListener('click', ()=>{ settings.types.push({naam:'',beschrijving:''}); renderTypes(); });

  // ===== Locaties =====
  function renderLocaties(){
    const tbody = $('#tbl-locaties tbody');
    tbody.innerHTML = (settings.locaties||[]).map((l,i)=>`
      <tr>
        <td><input class="inline l-naam" data-i="${i}" value="${l.naam||''}"></td>
        <td><input class="inline l-adres" data-i="${i}" value="${l.adres||''}"></td>
        <td><input class="inline l-postcode" data-i="${i}" value="${l.postcode||''}"></td>
        <td><input class="inline l-plaats" data-i="${i}" value="${l.plaats||''}"></td>
        <td><input class="inline l-beschrijving" data-i="${i}" value="${l.beschrijving||''}"></td>
        <td><button class="btn small" onclick="delLoc(${i})">🗑️</button></td>
      </tr>`).join('');
  }
  window.delLoc = i => { settings.locaties.splice(i,1); renderLocaties(); };
  $('#btn-add-locatie').addEventListener('click', ()=>{ settings.locaties.push({naam:'',adres:'',postcode:'',plaats:'',beschrijving:''}); renderLocaties(); });

  // ===== Themas =====
  function renderThemas(){
    const tbody = $('#tbl-themas tbody');
    tbody.innerHTML = (settings.themas||[]).map((t,i)=>`
      <tr>
        <td><input class="inline th-naam" data-i="${i}" value="${t.naam||''}"></td>
        <td><input class="inline th-beschrijving" data-i="${i}" value="${t.beschrijving||''}"></td>
        <td><button class="btn small" onclick="delThema(${i})">🗑️</button></td>
      </tr>`).join('');
  }
  window.delThema = i => { settings.themas.splice(i,1); renderThemas(); };
  $('#btn-add-thema').addEventListener('click', ()=>{ settings.themas.push({naam:'',beschrijving:''}); renderThemas(); });

  // ===== Trainers & groepen =====
  function renderTrainers(){
    const tbody = $('#tbl-trainers tbody');
    tbody.innerHTML = (settings.trainers||[]).map((t,i)=>`
      <tr>
        <td><input class="inline tr-naam" data-i="${i}" value="${t.naam||''}"></td>
        <td><input class="inline tr-functie" data-i="${i}" value="${t.functie||''}"></td>
        <td><button class="btn small" onclick="delTrainer(${i})">🗑️</button></td>
      </tr>`).join('');
  }
  window.delTrainer = i => { settings.trainers.splice(i,1); renderTrainers(); };
  $('#btn-add-trainer').addEventListener('click', ()=>{ settings.trainers.push({naam:'', functie:''}); renderTrainers(); });

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
  function renderTrainerGroups(){
    const host = $('#groep-trainer'); host.innerHTML='';
    const groups = settings.groups?.trainer || {};
    Object.keys(groups).forEach(gn=>host.appendChild(trainerGroupCard(gn, groups[gn])));
  }
  $('#btn-add-groep-trainer').addEventListener('click', ()=>{ $('#groep-trainer').appendChild(trainerGroupCard('', [])); });

  // Save all (Types/Locaties/Themas/Trainers + groepen + Namen)
  $('#btn-save-settings').addEventListener('click', async ()=>{
    // Namen
    const nrows = Array.from(document.querySelectorAll('#tbl-namen tbody tr'));
    settings.namen = nrows.map(r=>({
      naam:r.querySelector('.n-naam').value.trim(),
      prijs: Number(r.querySelector('.n-prijs').value||0) || null,
      strippen: Number(r.querySelector('.n-strippen').value||0) || null,
      max: Number(r.querySelector('.n-max').value||0) || null,
      lesduurMin: Number(r.querySelector('.n-lesduur').value||0) || null,
      mailblue: r.querySelector('.n-mailblue').value.trim()
    })).filter(x=>x.naam);

    // Types
    const trows = Array.from(document.querySelectorAll('#tbl-types tbody tr'));
    settings.types = trows.map(r=>({
      naam:r.querySelector('.t-naam').value.trim(),
      beschrijving:r.querySelector('.t-beschrijving').value.trim()
    })).filter(x=>x.naam);

    // Locaties
    const lrows = Array.from(document.querySelectorAll('#tbl-locaties tbody tr'));
    settings.locaties = lrows.map(r=>({
      naam:r.querySelector('.l-naam').value.trim(),
      adres:r.querySelector('.l-adres').value.trim(),
      postcode:r.querySelector('.l-postcode').value.trim(),
      plaats:r.querySelector('.l-plaats').value.trim(),
      beschrijving:r.querySelector('.l-beschrijving').value.trim()
    })).filter(x=>x.naam);

    // Themas
    const throws = Array.from(document.querySelectorAll('#tbl-themas tbody tr'));
    settings.themas = throws.map(r=>({
      naam:r.querySelector('.th-naam').value.trim(),
      beschrijving:r.querySelector('.th-beschrijving').value.trim()
    })).filter(x=>x.naam);

    // Trainers
    const trrows = Array.from(document.querySelectorAll('#tbl-trainers tbody tr'));
    settings.trainers = trrows.map(r=>({
      naam:r.querySelector('.tr-naam').value.trim(),
      functie:r.querySelector('.tr-functie').value.trim()
    })).filter(x=>x.naam);

    // Trainer groups
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

  // ===== Beheer =====
  function renderBeheerSelectors(){
    fillSelect('#sel-g-naam-item', (settings.namen||[]).map(n=>n.naam));
    fillSelect('#sel-g-type-item', (settings.types||[]).map(t=>t.naam));
    fillSelect('#sel-g-loc-item', (settings.locaties||[]).map(l=>l.naam));
    fillSelect('#sel-g-thema-item', (settings.themas||[]).map(t=>t.naam));
    fillSelect('#sel-g-trainer', Object.keys(settings.groups?.trainer||{}));
    onTrainerGroupChange();
  }

  function onTrainerGroupChange(){
    const grp = $('#sel-g-trainer').value;
    const names = (settings.groups?.trainer?.[grp]) || [];
    const options = names.map(n=>{
      const t = (settings.trainers||[]).find(x=>x.naam===n) || {naam:n, functie:''};
      return `<option value="${t.naam}">${t.naam}${t.functie?(' — '+t.functie):''}</option>`;
    }).join('');
    $('#sel-g-trainer-items').innerHTML = options;
  }
  $('#sel-g-trainer').addEventListener('change', onTrainerGroupChange);

  // Compose and add lesson
  $('#btn-genereer').addEventListener('click', ()=>{
    const name = $('#sel-g-naam-item').value || '';
    const nameObj = (settings.namen||[]).find(n=>n.naam===name);
    // Fallback to group defaults (optional, not shown here since name-level exists)
    const meta = {
      prijs: nameObj?.prijs ?? null,
      strippen: nameObj?.strippen ?? null,
      max: nameObj?.max ?? null,
      lesduurMin: nameObj?.lesduurMin ?? null,
      mailblue: nameObj?.mailblue ?? ''
    };
    const trainersSel = Array.from(document.querySelectorAll('#sel-g-trainer-items option:checked')).map(o=>o.value);
    const trainersFull = trainersSel.map(n => {
      const t = (settings.trainers||[]).find(x=>x.naam===n);
      return t ? {naam:t.naam, functie:t.functie} : {naam:n, functie:''};
    });
    const item = {
      naam: name,
      meta,
      type: $('#sel-g-type-item').value || '',
      locatie: $('#sel-g-loc-item').value || '',
      trainers: trainersFull
    };
    lessons.push(item);
    renderLessons();
  });

  function metaLine(m){
    const p = m?.prijs!=null ? `💶 ${m.prijs}` : '';
    const s = m?.strippen!=null ? `🎟️ ${m.strippen}` : '';
    const mx= m?.max!=null ? `👥 ${m.max}` : '';
    const d = m?.lesduurMin!=null ? `⏱️ ${m.lesduurMin} min` : '';
    const mb= m?.mailblue ? `✉️ MailBlue: ${m.mailblue}` : '';
    return [p,s,mx,d,mb].filter(Boolean).join(' | ');
  }

  function renderLessons(){
    $('#tbl-lessen tbody').innerHTML = lessons.map((l,i)=>`
      <tr>
        <td><div class="name-cell">${l.naam}</div><div class="name-meta">${metaLine(l.meta)}</div></td>
        <td>${l.type}</td>
        <td>${l.locatie}</td>
        <td>${(l.trainers||[]).map(t=>t.naam+(t.functie?(' ('+t.functie+')'):'')).join(', ')}</td>
        <td>
          <button class="btn small" onclick="editLesson(${i})">✏️</button>
          <button class="btn small" onclick="delLesson(${i})">🗑️</button>
        </td>
      </tr>`).join('');
  }
  window.delLesson = i => { lessons.splice(i,1); renderLessons(); };
  window.editLesson = i => {
    const l=lessons[i];
    // Prefill selections
    $('#sel-g-naam-item').value = l.naam;
    $('#sel-g-type-item').value = l.type;
    $('#sel-g-loc-item').value  = l.locatie;
    // Trainers preselect
    const names = (l.trainers||[]).map(t=>t.naam);
    Array.from($('#sel-g-trainer-items').options).forEach(o=>{ o.selected = names.includes(o.value); });
    // Switch to Beheer tab stays as is; user can click Genereer again to add updated row
  };

  loadSettings();
});
