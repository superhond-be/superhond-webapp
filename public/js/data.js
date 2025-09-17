// Seed data
const SH_SEED = {
  namen:[
    {id:'nm_ppcon', naam:'Puppy Pack Connect', prijs:149, strippen:9, max:12, lesduur:60, mailblue:'MB-PPCON', geldigheid:'12 weken'},
    {id:'nm_ppspec', naam:'Puppy Pack Special', prijs:199, strippen:12, max:14, lesduur:75, mailblue:'MB-PPSPEC', geldigheid:'16 weken'},
    {id:'nm_basis', naam:'Basisgroep', prijs:135, strippen:8, max:10, lesduur:60, mailblue:'MB-BASIS', geldigheid:'10 weken'},
    {id:'nm_puber', naam:'Pubergroep', prijs:155, strippen:10, max:12, lesduur:60, mailblue:'MB-PUBER', geldigheid:'12 weken'},
    {id:'nm_prive', naam:'Privé Coaching', prijs:60, strippen:1, max:1, lesduur:60, mailblue:'MB-PRIVE', geldigheid:'1 week'}
  ],
  types:[
    {id:'tp_groep', type:'Groep', beschrijving:'Les in kleine groep'},
    {id:'tp_prive', type:'Privé', beschrijving:'Individuele coaching'},
    {id:'tp_work', type:'Workshop', beschrijving:'Eenmalige intensieve sessie'}
  ],
  locaties:[
    {id:'loc_retie', naam:'Retie Terrein', adres:'Kerkhofstraat 1', plaats:'Retie', land:'BE', beschrijving:'Buitenterrein'},
    {id:'loc_mol', naam:'Mol Bospark', adres:'Bospad 12', plaats:'Mol', land:'BE', beschrijving:'Parklocatie'},
    {id:'loc_dessel', naam:'Dessel Sporthal', adres:'Sportlaan 5', plaats:'Dessel', land:'BE', beschrijving:'Indoor ruimte'}
  ],
  themas:[
    {id:'th_start', naam:'Start', beschrijving:'Basisvaardigheden'},
    {id:'th_geh', naam:'Gehoorzaamheid', beschrijving:'Luisteren en volgen'},
    {id:'th_soc', naam:'Socialisatie', beschrijving:'Met andere honden en mensen'},
    {id:'th_ag', naam:'Agility', beschrijving:'Behendigheid en sport'}
  ],
  trainers:[
    {id:'tr_sofie', naam:'Sofie', functie:'Coach'},
    {id:'tr_jan', naam:'Jan', functie:'Hoofdtrainer'},
    {id:'tr_lotte', naam:'Lotte', functie:'Assistent'}
  ],
  lessen:[
    {id:'ls_demo', naamId:'nm_ppcon', typeId:'tp_groep', locatieId:'loc_retie', themaId:'th_start', trainerId:'tr_sofie', datum:'2025-09-20', tijd:'10:00', capaciteit:8}
  ]
};
const KEY='SH_LESSEN_DB_v0123';

function loadDB(){
  const raw = localStorage.getItem(KEY);
  if(!raw){
    localStorage.setItem(KEY, JSON.stringify(SH_SEED));
    return JSON.parse(JSON.stringify(SH_SEED));
  }
  try{ return JSON.parse(raw); } catch(e){ return JSON.parse(JSON.stringify(SH_SEED)); }
}
function saveDB(db){ localStorage.setItem(KEY, JSON.stringify(db)); }
function uid(prefix){ return prefix + '_' + Math.random().toString(36).slice(2,9); }

// Export
function exportJSON(){
  const db = loadDB();
  const blob = new Blob([JSON.stringify(db, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  const ts = new Date().toISOString().replace(/[:.]/g,'-');
  a.href = URL.createObjectURL(blob);
  a.download = `superhond-lessen-export-${ts}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(a.href);
}

// Import
function importJSON(file){
  return new Promise((resolve,reject)=>{
    const r = new FileReader();
    r.onload = () => {
      try {
        const obj = JSON.parse(r.result);
        if(!obj || typeof obj!=='object') throw new Error('Geen geldig JSON');
        // basic keys check
        ['namen','types','locaties','themas','trainers','lessen'].forEach(k=>{ if(!obj[k]) obj[k]=[]; });
        saveDB(obj);
        resolve(obj);
      } catch(e){ reject(e); }
    };
    r.onerror = () => reject(r.error);
    r.readAsText(file);
  });
}

window.SHDB = { loadDB, saveDB, uid, exportJSON, importJSON };