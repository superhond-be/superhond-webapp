const express = require('express');
const router = express.Router();
const man = require('../module.json');

function buildMapsUrl(loc){
  const parts = [loc.adres, loc.postcode, loc.plaats, loc.land].filter(Boolean).join(', ');
  return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(parts);
}
const validUnit = u => ['dagen','weken','maanden'].includes(u) ? u : 'dagen';
const nStr = v => String(v||'').trim();
const nNum = v => (v===null||v===undefined||v==='') ? null : Number(v);

const store = {
  settings: {
    namen: [
      { naam: 'Puppy Start', prijs: 149, strippen: 9, max: 8, lesduurMin: 90, mailblue: 'PUPPY', geldigheid:{aantal:3,eenheid:'maanden'} },
      { naam: 'Pubergroep',  prijs: 169, strippen:10, max: 8, lesduurMin: 90, mailblue: 'PUBER', geldigheid:{aantal:8,eenheid:'weken'} }
    ],
    types: [{naam:'PuppyPack', beschrijving:'Voor pups'}, {naam:'Basisgroep', beschrijving:'Basistraining'}],
    locaties: [
      {naam:'Retie', adres:'Markt 1', postcode:'2470', plaats:'Retie', land:'België', beschrijving:'',
       googleMapsUrl: buildMapsUrl({adres:'Markt 1',postcode:'2470',plaats:'Retie',land:'België'})},
      {naam:'Dessel', adres:'Kerkstraat 5', postcode:'2480', plaats:'Dessel', land:'België', beschrijving:'',
       googleMapsUrl: buildMapsUrl({adres:'Kerkstraat 5',postcode:'2480',plaats:'Dessel',land:'België'})}
    ],
    themas: [{naam:'Gehoorzaamheid', beschrijving:'Basis'}],
    trainers: [{ naam:'Sofie', functie:'Hoofdtrainer' }, {naam:'Paul', functie:'Trainer'}]
  },
  items: []
};

router.get('/version',(req,res)=>res.json({name:'🐾 Superhond Lessenbeheer',version:man.version}));
router.get('/settings',(req,res)=>res.json(store.settings));
router.post('/settings',(req,res)=>{ store.settings = req.body; res.json(store.settings); });
router.get('/items',(req,res)=>res.json(store.items));
router.post('/items',(req,res)=>{ const item={id:Date.now(),...req.body}; store.items.push(item); res.json(item); });
router.delete('/items/:id',(req,res)=>{ const id=+req.params.id; store.items=store.items.filter(x=>x.id!==id); res.json({ok:true}); });

module.exports = router;
