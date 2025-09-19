
// Superhond Klanten v0.13.1 — localStorage CRUD + CSV
const KEY = 'SH_CUSTOMERS';

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function nowISO(){ return new Date().toISOString(); }
function uid(){ return 'K' + Math.random().toString(36).slice(2,10) + Date.now().toString(36).slice(-4); }

function load(){
  try{ return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch(e){ console.warn('Parse error', e); return []; }
}
function save(list){ localStorage.setItem(KEY, JSON.stringify(list)); }

function fmtName(c){ return [c.voornaam, c.achternaam].filter(Boolean).join(' '); }
function fmtLoc(c){ return [c.postcode, c.gemeente].filter(Boolean).join(' '); }

function render(list){
  const tbody = $('#tbl tbody');
  tbody.innerHTML = '';
  for(const c of list){
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHTML(fmtName(c))}</td>
      <td>${escapeHTML(c.email||'')}</td>
      <td>${escapeHTML(c.telefoon||'')}</td>
      <td>${escapeHTML(fmtLoc(c))}</td>
      <td class="actions">
        <button data-id="${c.id}" class="edit">✏️</button>
        <button data-id="${c.id}" class="del">🗑️</button>
      </td>`;
    tbody.appendChild(tr);
  }
  $('#count').textContent = `${list.length} klant${list.length===1?'':'en'}`;
}

function escapeHTML(s){ return (s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

function filterList(q, all){
  if(!q) return all;
  q = q.toLowerCase();
  return all.filter(c =>
    [fmtName(c), c.email, c.telefoon, c.adres, c.postcode, c.gemeente, c.notes]
      .filter(Boolean).join(' ').toLowerCase().includes(q)
  );
}

function openModal(mode, c = {}){
  $('#modal').classList.add('active');
  $('#modalTitle').textContent = mode==='edit' ? 'Klant bewerken' : 'Nieuwe klant';
  $('#voornaam').value = c.voornaam || '';
  $('#achternaam').value = c.achternaam || '';
  $('#email').value = c.email || '';
  $('#telefoon').value = c.telefoon || '';
  $('#adres').value = c.adres || '';
  $('#postcode').value = c.postcode || '';
  $('#gemeente').value = c.gemeente || '';
  $('#notes').value = c.notes || '';
  $('#meta').textContent = c.createdAt ? `Aangemaakt: ${c.createdAt} • Laatst gewijzigd: ${c.updatedAt||c.createdAt}` : '';
  $('#btnSave').dataset.mode = mode;
  $('#btnSave').dataset.id = c.id || '';
  setTimeout(()=>$('#voornaam').focus(), 100);
}
function closeModal(){ $('#modal').classList.remove('active'); }

function collectForm(){
  return {
    voornaam: $('#voornaam').value.trim(),
    achternaam: $('#achternaam').value.trim(),
    email: $('#email').value.trim(),
    telefoon: $('#telefoon').value.trim(),
    adres: $('#adres').value.trim(),
    postcode: $('#postcode').value.trim(),
    gemeente: $('#gemeente').value.trim(),
    notes: $('#notes').value.trim(),
  };
}

function validate(c){
  const errs = [];
  if(!c.voornaam) errs.push('Voornaam is verplicht.');
  if(!c.achternaam) errs.push('Achternaam is verplicht.');
  if(c.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) errs.push('E‑mail is ongeldig.');
  return errs;
}

function exportCSV(list){
  const headers = ['id','voornaam','achternaam','email','telefoon','adres','postcode','gemeente','notes','createdAt','updatedAt'];
  const rows = [headers.join(',')].concat(list.map(c => headers.map(h => csvEscape(c[h]||'')).join(',')));
  const blob = new Blob([rows.join('\n')], {type:'text/csv;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
  a.href = url; a.download = `klanten-export-${ts}.csv`; a.click();
  URL.revokeObjectURL(url);
}
function csvEscape(val){
  val = (''+val).replace(/\r?\n/g, ' ');
  if(val.includes(',') || val.includes('"')){
    return `"${val.replace(/"/g,'""')}"`;
  }
  return val;
}

function importCSV(file, onDone){
  const reader = new FileReader();
  reader.onload = () => {
    const text = reader.result;
    const lines = text.split(/\r?\n/).filter(Boolean);
    if(!lines.length) return onDone([]);
    // detect delimiter by first line
    const delim = (lines[0].includes(';') && !lines[0].includes(',')) ? ';' : ',';
    const headers = parseCSVLine(lines[0], delim).map(h => h.trim().toLowerCase());
    const map = {}; // normalize header mapping
    const aliases = {
      voornaam:['voornaam','first','firstname','first_name','naam'],
      achternaam:['achternaam','last','lastname','last_name','familienaam'],
      email:['email','e-mail','mail'],
      telefoon:['telefoon','phone','gsm','mobile'],
      adres:['adres','address','straat'],
      postcode:['postcode','zip'],
      gemeente:['gemeente','stad','plaats','city'],
      notes:['notes','opmerkingen','notities'],
      id:['id','klantid','customerid']
    };
    for(const key in aliases){
      for(const a of aliases[key]){
        const idx = headers.indexOf(a);
        if(idx>-1){ map[key] = idx; break; }
      }
    }
    const out = [];
    for(let i=1;i<lines.length;i++){
      const cols = parseCSVLine(lines[i], delim);
      if(cols.length===1 && !cols[0]) continue;
      const c = {
        id: cols[map.id] || uid(),
        voornaam: cols[map.voornaam] || '',
        achternaam: cols[map.achternaam] || '',
        email: cols[map.email] || '',
        telefoon: cols[map.telefoon] || '',
        adres: cols[map.adres] || '',
        postcode: cols[map.postcode] || '',
        gemeente: cols[map.gemeente] || '',
        notes: cols[map.notes] || '',
        createdAt: nowISO(), updatedAt: nowISO(),
      };
      // basic skip: must have at least a name
      if((c.voornaam||c.achternaam)) out.push(c);
    }
    onDone(out);
  };
  reader.readAsText(file);
}

function parseCSVLine(line, delim=','){
  const out = []; let cur = ''; let inQ = false;
  for(let i=0;i<line.length;i++){
    const ch = line[i];
    if(ch === '"'){
      if(inQ && line[i+1] === '"'){ cur += '"'; i++; }
      else{ inQ = !inQ; }
    }else if(ch === delim && !inQ){
      out.push(cur); cur = '';
    }else{
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

// Event wiring
document.addEventListener('DOMContentLoaded', () => {
  let all = load();
  render(all);

  $('#search').addEventListener('input', e => {
    render(filterList(e.target.value, all));
  });

  $('#btnAdd').addEventListener('click', () => openModal('create'));
  $('#btnCancel').addEventListener('click', closeModal);

  $('#btnSave').addEventListener('click', () => {
    const mode = $('#btnSave').dataset.mode;
    const id = $('#btnSave').dataset.id;
    const form = collectForm();
    const errs = validate(form);
    if(errs.length){ alert(errs.join('\\n')); return; }
    if(mode==='edit'){
      const idx = all.findIndex(c => c.id === id);
      if(idx>-1){
        all[idx] = {...all[idx], ...form, updatedAt: nowISO()};
      }
    }else{
      all.push({ id: uid(), ...form, createdAt: nowISO(), updatedAt: nowISO() });
    }
    save(all); closeModal(); render(filterList($('#search').value, all));
  });

  $('#tbl').addEventListener('click', e => {
    const btn = e.target.closest('button'); if(!btn) return;
    const id = btn.dataset.id;
    if(btn.classList.contains('edit')){
      const c = all.find(x => x.id === id);
      if(c) openModal('edit', c);
    }else if(btn.classList.contains('del')){
      if(confirm('Deze klant verwijderen?')){
        all = all.filter(x => x.id !== id);
        save(all); render(filterList($('#search').value, all));
      }
    }
  });

  $('#btnExport').addEventListener('click', () => {
    exportCSV(filterList($('#search').value, all));
  });

  $('#csvInput').addEventListener('change', e => {
    const file = e.target.files[0];
    if(!file) return;
    importCSV(file, imported => {
      if(!imported.length){ alert('Geen geldige rijen gevonden.'); return; }
      // Merge by email or (voornaam+achternaam)
      const keyOf = c => (c.email||'').toLowerCase() || (fmtName(c).toLowerCase());
      const map = new Map(all.map(c => [keyOf(c), c]));
      for(const c of imported){
        const k = keyOf(c);
        if(map.has(k)){
          const cur = map.get(k);
          Object.assign(cur, {...c, id: cur.id, createdAt: cur.createdAt, updatedAt: nowISO()});
        }else{
          all.push(c);
        }
      }
      save(all); render(filterList($('#search').value, all));
      alert(`Geïmporteerd: ${imported.length} rijen.`);
      e.target.value = '';
    });
  });

  $('#btnSeed').addEventListener('click', () => {
    if(!confirm('Demo-data toevoegen?')) return;
    const sample = [
      {voornaam:'Jan',achternaam:'Janssens',email:'jan@example.com',telefoon:'0470 12 34 56',adres:'Dorpsstraat 1',postcode:'2470',gemeente:'Retie',notes:'Puppypack',createdAt:nowISO(),updatedAt:nowISO(),id:uid()},
      {voornaam:'Sofie',achternaam:'Thijs',email:'sofie@superhond.be',telefoon:'0499 22 33 44',adres:'Kerkplein 2',postcode:'2480',gemeente:'Dessel',notes:'Trainer',createdAt:nowISO(),updatedAt:nowISO(),id:uid()},
      {voornaam:'Els',achternaam:'Peeters',email:'els.peeters@example.com',telefoon:'0486 55 66 77',adres:'Stationslaan 10',postcode:'2400',gemeente:'Mol',notes:'Pubergroep',createdAt:nowISO(),updatedAt:nowISO(),id:uid()},
    ];
    const allNow = load().concat(sample);
    save(allNow);
    all = allNow;
    render(filterList($('#search').value, all));
  });

  $('#btnClear').addEventListener('click', () => {
    if(confirm('Alle klanten wissen? Dit kan niet ongedaan gemaakt worden.')){
      all = []; save(all); render(all);
    }
  });

  // Close modal on background click or Escape
  $('#modal').addEventListener('click', e => { if(e.target.id==='modal') closeModal(); });
  document.addEventListener('keydown', e => { if(e.key==='Escape') closeModal(); });
});
