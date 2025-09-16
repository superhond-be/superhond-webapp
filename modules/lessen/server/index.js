const express = require('express');
const router = express.Router();
const man = require('../module.json');

const store = {
  items: [],
  settings: {
    namen: ['Puppy Start','Pubergroep'],
    types: ['PuppyPack','Basisgroep'],
    locaties: ['Retie','Dessel'],
    trainers: ['Trainer 1','Trainer 2'],
    groups: {
      // Naam-groepen met defaults
      naam: {
        'Puppy': { values: ['Puppy Start'], defaults: { prijs: 149, strippen: 9, max: 8, lesduur: '1u30', mailblue: 'PUPPY' } },
        'Puber': { values: ['Pubergroep'],  defaults: { prijs: 169, strippen: 10, max: 8, lesduur: '1u30', mailblue: 'PUBER' } }
      },
      type:   { 'Basistraining': ['Basisgroep'], 'Pakket': ['PuppyPack'] },
      locatie:{ 'Kempen': ['Retie','Dessel'] },
      trainer:{ 'Team A': ['Trainer 1'], 'Team B': ['Trainer 2'] }
    }
  }
};

router.get('/version',(req,res)=>res.json({name:man.name,version:man.version}));
router.get('/items',(req,res)=>res.json(store.items));
router.post('/items', express.json(), (req,res)=>{
  const item = {id: Date.now(), ...req.body};
  store.items.push(item);
  res.status(201).json(item);
});

router.get('/settings',(req,res)=>res.json(store.settings));
router.post('/settings', express.json(), (req,res)=>{
  const s = req.body || {};
  const normList = a => Array.isArray(a) ? a.map(v=>String(v).trim()).filter(Boolean) : [];
  s.namen    = normList(s.namen);
  s.types    = normList(s.types);
  s.locaties = normList(s.locaties);
  s.trainers = normList(s.trainers);

  // Naam-groepen: { groupName: { values:[...], defaults:{...} } } of array fallback
  const normNaamGroups = g => {
    const out = {};
    if (g && typeof g === 'object'){
      for (const grp of Object.keys(g)){
        const entry = g[grp];
        if (Array.isArray(entry)) {
          out[grp] = { values: normList(entry), defaults: { prijs:null, strippen:null, max:null, lesduur:'', mailblue:'' } };
        } else if (entry && typeof entry === 'object') {
          out[grp] = {
            values: normList(entry.values || []),
            defaults: {
              prijs: Number(entry.defaults?.prijs ?? '') || null,
              strippen: Number.isFinite(Number(entry.defaults?.strippen)) ? Number(entry.defaults.strippen) : null,
              max: Number.isFinite(Number(entry.defaults?.max)) ? Number(entry.defaults.max) : null,
              lesduur: String(entry.defaults?.lesduur ?? ''),
              mailblue: String(entry.defaults?.mailblue ?? '')
            }
          };
        }
      }
    }
    return out;
  };
  const normSimpleGroups = g => {
    const out = {};
    if (g && typeof g === 'object'){
      for (const grp of Object.keys(g)){
        out[grp] = normList(g[grp]);
      }
    }
    return out;
  };

  s.groups = s.groups || {};
  s.groups.naam    = normNaamGroups(s.groups.naam);
  s.groups.type    = normSimpleGroups(s.groups.type);
  s.groups.locatie = normSimpleGroups(s.groups.locatie);
  s.groups.trainer = normSimpleGroups(s.groups.trainer);

  store.settings = s;
  res.json(store.settings);
});

module.exports = router;
