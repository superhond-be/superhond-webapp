
const KEY='SH_DB_V0175';
const CANDIDATE_KEYS=[KEY,'SH_DB_V0173','SH_DB_V0172','SH_DB_V0168','SH_DB_V0167','SH_DB_V0166'];
const SEED = {
  namen:[{id:'nm1',naam:'Puppy Start',lesduur:60},{id:'nm2',naam:'Basisgroep',lesduur:60},{id:'nm3',naam:'Pubergroep',lesduur:90}],
  types:[{id:'tp1',type:'Groep'},{id:'tp2',type:'Workshop'}],
  themas:[{id:'th1',naam:'Start'},{id:'th2',naam:'Gevorderd'}],
  klassen:[
    {id:'kl1',naamId:'nm1',typeId:'tp1',themaId:'th1',capaciteit:10,strippen:1},
    {id:'kl2',naamId:'nm2',typeId:'tp1',themaId:'th2',capaciteit:8,strippen:2},
    {id:'kl3',naamId:'nm3',typeId:'tp2',themaId:'th1',capaciteit:12,strippen:1}
  ],
  locaties:[
    {id:'loc1',naam:'Retie Terrein',adres:'Kloosterstraat 12',plaats:'Retie',land:'BE'},
    {id:'loc2',naam:'Dessel Park',adres:'Stationsstraat 5',plaats:'Dessel',land:'BE'},
    {id:'loc3',naam:'Mol Centrum',adres:'Markt 1',plaats:'Mol',land:'BE'}
  ],
  trainers:[{id:'tr1',naam:'Sofie'},{id:'tr2',naam:'Paul'},{id:'tr3',naam:'Nancy'}],
  lesdagen:[
    {id:'ld1',klasId:'kl1',datum:'2025-10-10',start:'10:00',einde:'11:00',locatieId:'loc1',trainerIds:['tr1'],status:'active'},
    {id:'ld2',klasId:'kl1',datum:'2025-10-17',start:'10:00',einde:'11:00',locatieId:'loc1',trainerIds:['tr1','tr2'],status:'active'},
    {id:'ld3',klasId:'kl2',datum:'2025-09-25',start:'09:30',einde:'10:30',locatieId:'loc2',trainerIds:['tr2'],status:'archived'},
    {id:'ld4',klasId:'kl2',datum:'2025-10-05',start:'11:00',einde:'12:00',locatieId:'loc2',trainerIds:['tr2'],status:'cancelled'},
    {id:'ld5',klasId:'kl3',datum:'2025-10-12',start:'18:00',einde:'19:30',locatieId:'loc3',trainerIds:['tr2','tr3'],status:'cancelled'},
    {id:'ld6',klasId:'kl3',datum:'2025-11-02',start:'18:00',einde:'19:30',locatieId:'loc3',trainerIds:['tr3'],status:'active'}
  ]
};
function _tryLoad(k){ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):null; }catch(e){ return null; } }
function loadDB(){
  for(const k of CANDIDATE_KEYS){ const db=_tryLoad(k); if(db){ if(k!==KEY) localStorage.setItem(KEY, JSON.stringify(db)); return db; } }
  localStorage.setItem(KEY, JSON.stringify(SEED));
  return SEED;
}
function saveDB(db){ localStorage.setItem(KEY, JSON.stringify(db)); }
