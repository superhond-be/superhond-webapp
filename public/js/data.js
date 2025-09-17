const KEY='SH_LESSEN_DB_v0128';

function addMinutesToTime(timeStr, minutes){
  const [h,m] = (timeStr||'00:00').split(':').map(x=>parseInt(x,10)||0);
  const total = h*60 + m + (parseInt(minutes,10)||0);
  const hh = Math.floor(total/60)%24; const mm = total%60;
  const pad = n => String(n).padStart(2,'0');
  return `${pad(hh)}:${pad(mm)}`;
}

const SH_SEED = {
  namen:[
    {id:'nm_ppcon', naam:'Puppy Pack Connect', lesduur:60},
    {id:'nm_ppspec', naam:'Puppy Pack Special', lesduur:75},
    {id:'nm_basis', naam:'Basisgroep', lesduur:60},
    {id:'nm_pub',   naam:'Pubergroep', lesduur:60},
    {id:'nm_prive', naam:'Privé Coaching', lesduur:45},
    {id:'nm_work',  naam:'Agility Workshop', lesduur:90}
  ],
  types:[
    {id:'tp_groep', type:'Groep'},
    {id:'tp_prive', type:'Privé'},
    {id:'tp_work',  type:'Workshop'}
  ],
  locaties:[
    {id:'loc_retie','naam':'Retie Terrein','adres':'Kerkhofstraat 1','plaats':'Retie','land':'BE'},
    {id:'loc_mol','naam':'Mol Bospark','adres':'Bospad 12','plaats':'Mol','land':'BE'},
    {id:'loc_dessel','naam':'Dessel Sporthal','adres':'Sportlaan 5','plaats':'Dessel','land':'BE'},
    {id:'loc_geel','naam':'Geel Centrum','adres':'Markt 1','plaats':'Geel','land':'BE'},
    {id:'loc_turn','naam':'Turnhout Polder','adres':'Polderweg 8','plaats':'Turnhout','land':'BE'}
  ],
  themas:[
    {id:'th_start','naam':'Start'},
    {id:'th_geh','naam':'Gehoorzaamheid'},
    {id:'th_soc','naam':'Socialisatie'},
    {id:'th_ag','naam':'Agility'},
    {id:'th_nose','naam':'Nosework'}
  ],
  trainers:[
    {id:'tr_sofie','naam':'Sofie'},
    {id:'tr_jan','naam':'Jan'},
    {id:'tr_lotte','naam':'Lotte'},
    {id:'tr_tom','naam':'Tom'},
    {id:'tr_ina','naam':'Ina'}
  ],
  lessen:[]
};

(function seedLessons(){
  function rng(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
  const names = SH_SEED.namen, types = SH_SEED.types, locs = SH_SEED.locaties, themas = SH_SEED.themas, trs = SH_SEED.trainers;
  const baseDate = new Date('2025-09-18');
  const count = 12;
  for(let i=0;i<count;i++){
    const name = names[rng(0,names.length-1)];
    const type = (name.id==='nm_work')? types.find(t=>t.id==='tp_work') : (name.id==='nm_prive'? types.find(t=>t.id==='tp_prive') : types.find(t=>t.id==='tp_groep'));
    const loc = locs[rng(0,locs.length-1)];
    const th = themas[rng(0,themas.length-1)];
    const dayOffset = rng(0,14);
    const d = new Date(baseDate.getTime()+dayOffset*24*3600*1000);
    const hh = rng(8,19);
    const mm = [0,15,30,45][rng(0,3)];
    const start = String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0');
    const duration = name.lesduur||60;
    const end = addMinutesToTime(start, duration);
    const trainerCount = rng(1,2);
    const trainerIds = [];
    for(let t=0;t<trainerCount;t++){
      const pick = trs[rng(0,trs.length-1)].id;
      if(!trainerIds.includes(pick)) trainerIds.push(pick);
    }
    const id = 'ls_'+(i+1);
    const datum = d.toISOString().slice(0,10);
    const cap = (type.id==='tp_prive')? 1 : (type.id==='tp_work'? 16 : rng(8,14));
    SH_SEED.lessen.push({id, naamId:name.id, typeId:type.id, locatieId:loc.id, themaId:th.id, trainerIds, datum, tijd:start, eindtijd:end, capaciteit:cap});
  }
})();

function loadDB(){ const raw = localStorage.getItem(KEY); if(!raw){ localStorage.setItem(KEY, JSON.stringify(SH_SEED)); return JSON.parse(JSON.stringify(SH_SEED)); } try{ return JSON.parse(raw); } catch(e){ return JSON.parse(JSON.stringify(SH_SEED)); } }
function saveDB(db){ localStorage.setItem(KEY, JSON.stringify(db)); }
function uid(prefix){ return prefix + '_' + Math.random().toString(36).slice(2,9); }

window.SHDB = { loadDB, saveDB, uid, addMinutesToTime };