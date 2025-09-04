(() => {
  const API = ''; // leeg = zelfde origin (http://localhost:3000)

  // ---------- Helpers ----------
  const $ = (sel, el=document) => el.querySelector(sel);
  const el = (tag, props={}, ...kids) => {
    const n = document.createElement(tag);
    Object.assign(n, props);
    for (const k of kids) n.append(k);
    return n;
  };
  const fmtErr = async (res) => {
    let body = '';
    try { body = await res.text(); } catch {}
    return `${res.status} ${res.statusText} ${body?'- '+body:''}`;
  };

  async function api(path, {method='GET', body, headers}={}){
    const res = await fetch(API+path, {
      method,
      headers: { 'Content-Type':'application/json', ...(headers||{}) },
      body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) throw new Error(await fmtErr(res));
    const ct = res.headers.get('content-type')||'';
    return ct.includes('application/json') ? res.json() : res.text();
  }

  function notice(msg, type='ok'){
    const n = el('div', {className:'notice '+type, textContent: msg});
    Object.assign(n.style, {position:'fixed', right:'12px', bottom:'12px', background:'#111', color:'#fff', padding:'8px 12px', borderRadius:'8px', zIndex:9999});
    if (type==='err'){ n.style.background = '#c62828'; }
    document.body.append(n);
    setTimeout(()=> n.remove(), 2400);
  }

  // ---------- Tabs ----------
  const tabs = Array.from(document.querySelectorAll('nav button'));
  tabs.forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    $('#'+b.dataset.tab).classList.add('active');
  }));

  // ---------- SETTINGS (4 lijsten) ----------
  const LISTS = [
    { key:'lestypes',   cols:['naam'], label:'Lestypes' },
    { key:'themas',     cols:['naam'], label:'Thema’s' },
    { key:'locaties',   cols:['naam','adres'], label:'Locaties' },
    { key:'trainers',   cols:['naam','email'], label:'Trainers' }
  ];

  const cache = {
    lestypes: [], themas: [], locaties: [], trainers: [],
    courses: [], sessions: []
  };

  async function loadSettings(){
    for (const l of LISTS){
      cache[l.key] = await api(`/api/settings/${l.key}`);
      renderList(l);
    }
  }

  function renderList(list){
    const root = $('#'+list.key);
    root.innerHTML = '';
    root.append(el('h2', {textContent: list.label}));

    // Tabel
    const t = el('table');
    const thead = el('thead', {}, el('tr', {},
      el('th', {textContent:'ID'}),
      ...list.cols.map(c=> el('th',{textContent:c})),
      el('th', {textContent:'Acties'})
    ));
    const tb = el('tbody');
    for (const row of cache[list.key]){
      const tr = el('tr');
      tr.append(el('td', {textContent: row.id}));
      list.cols.forEach(c => tr.append(el('td', {textContent: row[c]||''})));
      const act = el('td');
      const btnE = el('button', {textContent:'Wijzig'});
      const btnD = el('button', {textContent:'Verwijder', style:'margin-left:6px'});
      btnE.onclick = () => editListItem(list, row);
      btnD.onclick = () => delListItem(list, row);
      act.append(btnE, btnD);
      tr.append(act);
      tb.append(tr);
    }
    t.append(thead, tb);
    root.append(t);

    // Form toevoegen
    const f = el('form');
    list.cols.forEach(c => f.append(el('input', {name:c, placeholder:c})));
    const add = el('button', {textContent:'Toevoegen', type:'submit', style:'margin-left:6px'});
    f.append(add);
    f.onsubmit = async (e) => {
      e.preventDefault();
      const body = Object.fromEntries(new FormData(f).entries());
      try{
        const created = await api(`/api/settings/${list.key}`, {method:'POST', body});
        cache[list.key].push(created);
        renderList(list);
        notice('Toegevoegd aan '+list.label);
        f.reset();
      }catch(err){ notice('Fout: '+err.message, 'err'); }
    };
    root.append(el('h3', {textContent:'Nieuw item'}), f);
  }

  async function editListItem(list, row){
    const vals = {};
    for (const c of list.cols){
      const v = prompt(`${list.label} – ${c}`, row[c]||'');
      if (v===null) return;
      vals[c]=v;
    }
    try{
      const upd = await api(`/api/settings/${list.key}/${row.id}`, {method:'PUT', body: vals});
      const idx = cache[list.key].findIndex(x=>x.id===row.id);
      cache[list.key][idx] = upd;
      renderList(list);
      notice('Bijgewerkt');
    }catch(err){ notice('Fout: '+err.message, 'err'); }
  }

  async function delListItem(list, row){
    if (!confirm('Verwijderen?')) return;
    try{
      await api(`/api/settings/${list.key}/${row.id}`, {method:'DELETE'});
      cache[list.key] = cache[list.key].filter(x=>x.id!==row.id);
      renderList(list);
      notice('Verwijderd');
    }catch(err){ notice('Kan niet verwijderen: '+err.message, 'err'); }
  }

  // ---------- COURSES ----------
  async function loadCourses(){
    cache.courses = await api('/api/courses');
    renderCourses();
  }

  function opt(value, label, selected=false){ const o = el('option', {value, textContent: label}); if (selected) o.selected = true; return o; }

  function renderCourses(){
    const root = $('#courses');
    root.innerHTML = '';
    root.append(el('h2', {textContent:'Lessen (sjablonen)'}));

    // Tabel
    const t = el('table');
    const thead = el('thead', {}, el('tr', {},
      el('th',{textContent:'ID'}),
      el('th',{textContent:'Naam'}),
      el('th',{textContent:'Lestype'}),
      el('th',{textContent:'Thema'}),
      el('th',{textContent:'Locatie'}),
      el('th',{textContent:'Trainers'}),
      el('th',{textContent:'Max'}),
      el('th',{textContent:'Strippenkaart?'}),
      el('th',{textContent:'Acties'})
    ));
    const tb = el('tbody');

    for (const c of cache.courses){
      const type = cache.lestypes.find(x=>x.id===c.lestype_id)?.naam || '-';
      const thema = cache.themas.find(x=>x.id===c.thema_id)?.naam || '-';
      const loc   = cache.locaties.find(x=>x.id===c.locatie_id)?.naam || '-';
      const trns  = (c.trainer_ids||[]).map(id => cache.trainers.find(x=>x.id===id)?.naam || id).join(', ');
      const tr = el('tr', {},
        el('td', {textContent:c.id}),
        el('td', {textContent:c.naam}),
        el('td', {textContent:type}),
        el('td', {textContent:thema}),
        el('td', {textContent:loc}),
        el('td', {textContent:trns}),
        el('td', {textContent:String(c.max)}),
        el('td', {textContent:c.requires_pass ? (c.pass_type_id || 'ja') : 'nee'}),
        el('td', {}, (()=> {
          const wrap = el('div');
          const e = el('button', {textContent:'Wijzig'});
          const d = el('button', {textContent:'Verwijder', style:'margin-left:6px'});
          const s = el('button', {textContent:'Sessies', style:'margin-left:6px'});
          e.onclick = () => editCourse(c);
          d.onclick = () => delCourse(c);
          s.onclick = () => openSessionsForCourse(c);
          wrap.append(e,d,s);
          return wrap;
        })())
      );
      tb.append(tr);
    }
    t.append(thead, tb);
    root.append(t);

    // Form nieuw
    root.append(el('h3', {textContent:'Nieuwe les'}));
    const f = el('form');

    const iNaam = el('input', {name:'naam', placeholder:'Naam', required:true, style:'min-width:240px'});
    const iBesch = el('input', {name:'beschrijving', placeholder:'Beschrijving', style:'min-width:320px'});

    const sType = el('select', {name:'lestype_id', required:true}, ...cache.lestypes.map(x=>opt(x.id,x.naam)));
    const sThema = el('select', {name:'thema_id', required:true}, ...cache.themas.map(x=>opt(x.id,x.naam)));
    const sLoc = el('select', {name:'locatie_id', required:true}, ...cache.locaties.map(x=>opt(x.id,x.naam)));

    const sTrainers = el('select', {name:'trainer_ids', multiple:true, size: Math.min(6, Math.max(3, cache.trainers.length))},
      ...cache.trainers.map(x=>opt(x.id,x.naam))
    );

    const iAantal = el('input', {name:'aantal_lessen', type:'number', placeholder:'Aantal lessen'});
    const iLesuur = el('input', {name:'lesuur', placeholder:'Lesuur (bv. 19:00)'});
    const iGeld = el('input', {name:'geldigheid', type:'number', placeholder:'Geldigheid (dagen)'});
    const iMax = el('input', {name:'max', type:'number', placeholder:'Max deelnemers', required:true, min:1});

    const chkPass = el('input', {type:'checkbox', name:'requires_pass'});
    const iPassType = el('input', {name:'pass_type_id', placeholder:'Pass type id (optioneel)'});

    f.append(
      el('div', {}, iNaam, iBesch),
      el('div', {}, el('label',{},'Lestype: ', sType), el('label',{style:'margin-left:12px'},'Thema: ', sThema), el('label',{style:'margin-left:12px'},'Locatie: ', sLoc)),
      el('div', {}, el('label', {}, 'Trainers (meervoud, Ctrl/Command-klik): '), sTrainers),
      el('div', {}, iAantal, iLesuur, iGeld, iMax),
      el('div', {}, el('label', {}, chkPass, ' Strippenkaart vereist'), iPassType),
      el('button', {type:'submit', textContent:'Aanmaken', style:'margin-top:8px'})
    );

    f.onsubmit = async (e) => {
      e.preventDefault();
      const trainers = Array.from(sTrainers.selectedOptions).map(o=>o.value);
      const body = {
        naam: iNaam.value.trim(),
        beschrijving: iBesch.value.trim(),
        lestype_id: sType.value,
        thema_id: sThema.value,
        locatie_id: sLoc.value,
        trainer_ids: trainers,
        aantal_lessen: iAantal.value ? Number(iAantal.value) : null,
        lesuur: iLesuur.value || null,
        geldigheid: iGeld.value ? Number(iGeld.value) : null,
        max: Number(iMax.value),
        requires_pass: chkPass.checked,
        pass_type_id: iPassType.value || null
      };
      try{
        const created = await api('/api/courses', {method:'POST', body});
        cache.courses.push(created);
        renderCourses();
        notice('Les toegevoegd');
      }catch(err){ notice('Fout: '+err.message, 'err'); }
    };

    root.append(f);
  }

  async function editCourse(c){
    // eenvoudige inline prompts (snel & effectief)
    const naam = prompt('Naam', c.naam); if (naam===null) return;
    const max = prompt('Max deelnemers', c.max); if (max===null) return;
    const requires_pass = confirm('Strippenkaart verplicht? (OK = ja / Cancel = nee)');
    const pass_type_id = requires_pass ? (prompt('Pass type id (optioneel, laat leeg voor eender welke)', c.pass_type_id||'')||null) : null;

    const body = { ...c, naam: naam.trim(), max: Number(max), requires_pass, pass_type_id };
    try{
      const upd = await api(`/api/courses/${c.id}`, {method:'PUT', body});
      const idx = cache.courses.findIndex(x=>x.id===c.id);
      cache.courses[idx] = upd;
      renderCourses();
      notice('Les bijgewerkt');
    }catch(err){ notice('Fout: '+err.message, 'err'); }
  }

  async function delCourse(c){
    if (!confirm(`Les "${c.naam}" verwijderen?`)) return;
    try{
      await api(`/api/courses/${c.id}`, {method:'DELETE'});
      cache.courses = cache.courses.filter(x=>x.id!==c.id);
      renderCourses();
      notice('Les verwijderd');
    }catch(err){ notice('Kan niet verwijderen: '+err.message, 'err'); }
  }

  // ---------- SESSIONS ----------
  async function loadSessions(){
    cache.sessions = await api('/api/sessions');
    renderSessions();
  }

  function renderSessions(){
    const root = $('#sessions');
    root.innerHTML = '';
    root.append(el('h2', {textContent:'Sessies (datums)'}));

    const t = el('table');
    const thead = el('thead', {}, el('tr', {},
      el('th',{textContent:'ID'}),
      el('th',{textContent:'Les'}),
      el('th',{textContent:'Datum'}),
      el('th',{textContent:'Tijd'}),
      el('th',{textContent:'Geannuleerd?'}),
      el('th',{textContent:'Acties'})
    ));
    const tb = el('tbody');

    for (const s of cache.sessions){
      const course = cache.courses.find(c=>c.id===s.sjabloon_id);
      const tr = el('tr', {},
        el('td', {textContent: s.id}),
        el('td', {textContent: course?.naam || s.sjabloon_id}),
        el('td', {textContent: s.datum}),
        el('td', {textContent: s.tijd}),
        el('td', {textContent: s.geannuleerd ? 'ja' : 'nee'}),
        el('td', {}, (()=> {
          const wrap = el('div');
          const cancelBtn = el('button', {textContent: s.geannuleerd ? 'Herstel' : 'Annuleer'});
          const delBtn = el('button', {textContent:'Verwijder', style:'margin-left:6px'});
          cancelBtn.onclick = () => toggleCancelSession(s);
          delBtn.onclick = () => delSession(s);
          wrap.append(cancelBtn, delBtn);
          return wrap;
        })())
      );
      tb.append(tr);
    }
    t.append(thead, tb);
    root.append(t);

    // Form: nieuwe sessie
    root.append(el('h3', {textContent:'Nieuwe sessie toevoegen'}));
    const f = el('form');
    const courseSel = el('select', {name:'sjabloon_id', required:true},
      ...cache.courses.map(c=> opt(c.id, c.naam))
    );
    const d = el('input', {name:'datum', type:'date', required:true});
    const u = el('input', {name:'tijd', placeholder:'bv. 19:00', required:true});
    f.append(
      el('label', {}, 'Les: ', courseSel),
      el('label', {style:'margin-left:12px'}, 'Datum: ', d),
      el('label', {style:'margin-left:12px'}, 'Tijd: ', u),
      el('button', {type:'submit', textContent:'Toevoegen', style:'margin-left:12px'})
    );
    f.onsubmit = async (e) => {
      e.preventDefault();
      const body = { sjabloon_id: courseSel.value, datum: d.value, tijd: u.value };
      try{
        const created = await api('/api/sessions', {method:'POST', body});
        cache.sessions.push(created);
        renderSessions();
        notice('Sessie toegevoegd');
      }catch(err){ notice('Fout: '+err.message, 'err'); }
    };
    root.append(f);
  }

  function openSessionsForCourse(course){
    // switch naar tab Sessies & voorselecteren via klein filter
    tabs.find(b=>b.dataset.tab==='sessions').click();
    // simpele filter: scroll naar rij van deze course
    setTimeout(() => {
      const rows = Array.from($('#sessions tbody').rows);
      const r = rows.find(tr => tr.cells[1]?.textContent === course.naam);
      if (r) r.scrollIntoView({behavior:'smooth', block:'center'});
    }, 50);
  }

  async function toggleCancelSession(s){
    try{
      const upd = await api(`/api/sessions/${s.id}`, {method:'PUT', body:{ geannuleerd: !s.geannuleerd }});
      const idx = cache.sessions.findIndex(x=>x.id===s.id);
      cache.sessions[idx] = upd;
      renderSessions();
      notice(upd.geannuleerd ? 'Sessie geannuleerd' : 'Annulering ongedaan gemaakt');
    }catch(err){ notice('Fout: '+err.message, 'err'); }
  }

  async function delSession(s){
    if (!confirm('Sessie verwijderen?')) return;
    try{
      await api(`/api/sessions/${s.id}`, {method:'DELETE'});
      cache.sessions = cache.sessions.filter(x=>x.id!==s.id);
      renderSessions();
      notice('Sessie verwijderd');
    }catch(err){ notice('Fout: '+err.message, 'err'); }
  }

  // ---------- Init ----------
  (async function init(){
    try{
      await loadSettings();
      await loadCourses();
      await loadSessions();
    }catch(err){
      console.error(err);
      notice('Initialisatie mislukt: '+err.message, 'err');
    }
  })();
})();
