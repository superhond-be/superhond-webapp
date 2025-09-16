const express = require('express');
const router = express.Router();
const man = require('../module.json');

function buildMapsUrl(loc){
  const q = encodeURIComponent([loc.adres, loc.postcode, loc.plaats, loc.land].filter(Boolean).join(', '));
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

const store = {
  items: [
    { id:1, naam:'Puppy Start', type:'PuppyPack', locatie:'Retie', trainers:[{naam:'Sofie',functie:'Hoofdtrainer'}],
      meta:{prijs:149,strippen:9,max:8,lesduurMin:90,mailblue:'PUPPY'} }
  ],
  settings: {
    namen: [{ naam: 'Puppy Start', prijs: 149, strippen: 9, max: 8, lesduurMin: 90, mailblue: 'PUPPY' }],
    types: [{naam:'PuppyPack', beschrijving:'Voor pups'}],
    locaties: [
      {naam:'Retie', adres:'Markt 1', postcode:'2470', plaats:'Retie', land:'België', beschrijving:'',
       googleMapsUrl:'https://www.google.com/maps/search/?api=1&query=Markt%201,2470%20Retie,België'}
    ],
    themas: [],
    trainers: [{ naam:'Sofie', functie:'Hoofdtrainer' }],
    groups: { naam:{}, trainer:{} }
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
  s.locaties = Array.isArray(s.locaties) ? s.locaties.map(l=>{
    const obj = {
      naam:normStr(l.naam), adres:normStr(l.adres), postcode:normStr(l.postcode),
      plaats:normStr(l.plaats), land:normStr(l.land), beschrijving:normStr(l.beschrijving),
      googleMapsUrl: normStr(l.googleMapsUrl)
    };
    if(!obj.googleMapsUrl && (obj.adres||obj.plaats)) obj.googleMapsUrl = buildMapsUrl(obj);
    return obj;
  }).filter(l=>l.naam) : [];
  store.settings.locaties = s.locaties;
  res.json(store.settings);
});

module.exports = router;
