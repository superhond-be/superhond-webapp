
const KEY='SH_LESSEN_DB_v0132';

function addMinutesToTime(timeStr, minutes){
  const [h,m] = (timeStr||'00:00').split(':').map(x=>parseInt(x,10)||0);
  const total = h*60 + m + (parseInt(minutes,10)||0);
  const hh = Math.floor(total/60)%24; const mm = total%60;
  const pad = n => String(n).padStart(2,'0');
  return `${pad(hh)}:${pad(mm)}`;
}

const SH_SEED = {
  namen:[
    {id:'nm_ppcon', naam:'Puppy Pack Connect', prijs:149, strippen:9, max:12, lesduur:60, mailblue:'MB-PPCON', geldigheid:'12 weken'},
    {id:'nm_ppspec', naam:'Puppy Pack Special', prijs:199, strippen:12, max:14, lesduur:75, mailblue:'MB-PPSPEC', geldigheid:'16 weken'},
    {id:'nm_basis', naam:'Basisgroep', prijs:135, strippen:8, max:10, lesduur:60, mailblue:'MB-BASIS', geldigheid:'10 weken'}
  ],
  types:[
    {id:'tp_groep', type:'Groep', beschrijving:'Les in kleine groep'},
    {id:'tp_prive', type:'Privé', beschrijving:'Individuele coaching'},
    {id:'tp_work',  type:'Workshop', beschrijving:'Eenmalige intensieve sessie'}
  ],
  locaties:[
    {id:'loc_retie','naam':'Retie Terrein','adres':'Kerkhofstraat 1','plaats':'Retie','land':'BE'},
    {id:'loc_mol','naam':'Mol Bospark','adres':'Bospad 12','plaats':'Mol','land':'BE'},
    {id:'loc_dessel','naam':'Dessel Sporthal','adres':'Sportlaan 5','plaats':'Dessel','land':'BE'}
  ],
  themas:[
    {id:'th_start','naam':'Start'},
    {id:'th_geh','naam':'Gehoorzaamheid'},
    {id:'th_ag','naam':'Agility'}
  ],
  trainers:[
    {id:'tr_sofie','naam':'Sofie'},
    {id:'tr_jan','naam':'Jan'},
    {id:'tr_lotte','naam':'Lotte'}
  ],
  lessen:[]
};

(function seedLessons(){
  const names = SH_SEED.namen, types=SH_SEED.types, locs=SH_SEED.locaties, th=SH_SEED.themas, trs=SH_SEED.trainers;
  const base = new Date('2025-09-20');
  for(let i=0;i<12;i++){
    const name = names[i%names.length];
    const type = (name.id==='nm_ppcon'||name.id==='nm_ppspec')? types[0] : (name.id==='nm_basis'? types[0] : types[1]);
    const loc  = locs[i%locs.length];
    const thema= th[i%th.length];
    const d = new Date(base.getTime()+i*24*3600*1000);
    const datum = d.toISOString().slice(0,10);
    const tijd = (8 + (i%10)).toString().padStart(2,'0')+':00';
    const eind = addMinutesToTime(tijd, name.lesduur||60);
    const trainerIds = [trs[i%trs.length].id];
    SH_SEED.lessen.push({id:'ls_'+(i+1), naamId:name.id, typeId:type.id, locatieId:loc.id, themaId:thema.id, trainerIds, datum, tijd, eindtijd:eind, capaciteit: (type.id==='tp_prive'?1:10)});
  }
})();

function loadDB(){ const raw = localStorage.getItem(KEY); if(!raw){ localStorage.setItem(KEY, JSON.stringify(SH_SEED)); return JSON.parse(JSON.stringify(SH_SEED)); } try{ return JSON.parse(raw); } catch(e){ return JSON.parse(JSON.stringify(SH_SEED)); } }
function saveDB(db){ localStorage.setItem(KEY, JSON.stringify(db)); }
function uid(prefix){ return prefix + '_' + Math.random().toString(36).slice(2,9); }

window.SHDB = { loadDB, saveDB, uid, addMinutesToTime };
