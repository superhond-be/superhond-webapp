const express = require('express');
const router = express.Router();
const man = require('../module.json');

const store = {
  items: [],
  settings: {
    // Namen with defaults per name
    namen: [
      { naam: 'Puppy Start', prijs: 149, strippen: 9, max: 8, lesduurMin: 90, mailblue: 'PUPPY' },
      { naam: 'Pubergroep',  prijs: 169, strippen: 10, max: 8, lesduurMin: 90, mailblue: 'PUBER' }
    ],
    types: [{naam:'PuppyPack', beschrijving:'Voor pups'}, {naam:'Basisgroep', beschrijving:'Basistraining'}],
    locaties: [
      {naam:'Retie', adres:'', postcode:'2470', plaats:'Retie', beschrijving:''},
      {naam:'Dessel', adres:'', postcode:'2480', plaats:'Dessel', beschrijving:''}
    ],
    themas: [{naam:'Gehoorzaamheid', beschrijving:'Basis'}, {naam:'Wandelen', beschrijving:'Rustig wandelen'}],
    trainers: [
      { naam: 'Sofie', functie: 'Hoofdtrainer' },
      { naam: 'Paul', functie: 'Trainer' }
    ],
    groups: {
      // Naam-groups for fallback defaults
      naam: {
        'Puppy': { values: ['Puppy Start'], defaults: { prijs: 149, strippen: 9, max: 8, lesduurMin: 90, mailblue: 'PUPPY' } },
        'Puber': { values: ['Pubergroep'],  defaults: { prijs: 169, strippen: 10, max: 8, lesduurMin: 90, mailblue: 'PUBER' } }
      },
      trainer: { 'Superhond trainers': ['Sofie','Paul'] }
    }
  }
};

router.get('/version',(req,res)=>res.json({name:'🐾 Superhond Lessenbeheer',version:man.version}));
router.get('/items',(req,res)=>res.json(store.items));
router.post('/items', express.json(), (req,res)=>{
  const item = {id: Date.now(), ...req.body};
  store.items.push(item);
  res.status(201).json(item);
});

router.get('/settings',(req,res)=>res.json(store.settings));
router.post('/settings', express.json(), (req,res)=>{
  const s = req.body || {};
  const normStr = v => String(v||'').trim();
  const normNum = v => (v===null||v===undefined||v==='') ? null : Number(v);

  // Namen as objects with defaults
  s.namen = Array.isArray(s.namen) ? s.namen.map(n=>({
    naam: normStr(n.naam),
    prijs: normNum(n.prijs),
    strippen: normNum(n.strippen),
    max: normNum(n.max),
    lesduurMin: normNum(n.lesduurMin),
    mailblue: normStr(n.mailblue)
  })).filter(n=>n.naam) : [];

  // Types/Locaties/Themas/Trainers
  s.types = Array.isArray(s.types) ? s.types.map(t=>({naam:normStr(t.naam), beschrijving:normStr(t.beschrijving)})).filter(t=>t.naam) : [];
  s.locaties = Array.isArray(s.locaties) ? s.locaties.map(l=>({
    naam:normStr(l.naam), adres:normStr(l.adres), postcode:normStr(l.postcode), plaats:normStr(l.plaats), beschrijving:normStr(l.beschrijving)
  })).filter(l=>l.naam) : [];
  s.themas = Array.isArray(s.themas) ? s.themas.map(t=>({naam:normStr(t.naam), beschrijving:normStr(t.beschrijving)})).filter(t=>t.naam) : [];
  s.trainers = Array.isArray(s.trainers) ? s.trainers.map(t=>({naam:normStr(t.naam), functie:normStr(t.functie)})).filter(t=>t.naam) : [];

  // Groups
  const normList = a => Array.isArray(a) ? a.map(v=>normStr(v)).filter(Boolean) : [];
  const normNaamGroups = g => {
    const out = {};
    if (g && typeof g==='object'){
      for (const k of Object.keys(g)){
        const entry = g[k];
        if (Array.isArray(entry)) out[k] = { values: normList(entry), defaults: { prijs:null, strippen:null, max:null, lesduurMin:null, mailblue:'' } };
        else if (entry && typeof entry==='object'){
          out[k] = {
            values: normList(entry.values||[]),
            defaults: {
              prijs: normNum(entry.defaults?.prijs),
              strippen: normNum(entry.defaults?.strippen),
              max: normNum(entry.defaults?.max),
              lesduurMin: normNum(entry.defaults?.lesduurMin),
              mailblue: normStr(entry.defaults?.mailblue)
            }
          };
        }
      }
    }
    return out;
  };
  const normTrainerGroups = g => {
    const out={}; if (g && typeof g==='object'){ for (const k of Object.keys(g)){ out[k]=normList(g[k]); } } return out;
  };

  s.groups = s.groups || {};
  s.groups.naam = normNaamGroups(s.groups.naam);
  s.groups.trainer = normTrainerGroups(s.groups.trainer);

  store.settings = s;
  res.json(store.settings);
});

module.exports = router;
