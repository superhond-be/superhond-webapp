const EX = {
  namen:[
    {naam:'Puppy Pack Connect', prijs:'€149', strippen:9, max:12, lesduur:'60', mailblue:'MB-PPCON', geldigheid:'12 weken'},
    {naam:'Puppy Pack Special', prijs:'€199', strippen:12, max:14, lesduur:'75', mailblue:'MB-PPSPEC', geldigheid:'16 weken'},
    {naam:'Basisgroep', prijs:'€135', strippen:8, max:10, lesduur:'60', mailblue:'MB-BASIS', geldigheid:'10 weken'},
    {naam:'Pubergroep', prijs:'€155', strippen:10, max:12, lesduur:'60', mailblue:'MB-PUBER', geldigheid:'12 weken'},
    {naam:'Privé Coaching', prijs:'€60', strippen:1, max:1, lesduur:'60', mailblue:'MB-PRIVE', geldigheid:'1 week'}
  ],
  types:[
    {type:'Groep', beschrijving:'Les in kleine groep'},
    {type:'Privé', beschrijving:'Individuele coaching'},
    {type:'Workshop', beschrijving:'Eenmalige intensieve sessie'}
  ],
  locaties:[
    {naam:'Retie Terrein', adres:'Kerkhofstraat 1', plaats:'Retie', land:'BE', beschrijving:'Buitenterrein'},
    {naam:'Mol Bospark', adres:'Bospad 12', plaats:'Mol', land:'BE', beschrijving:'Parklocatie'},
    {naam:'Dessel Sporthal', adres:'Sportlaan 5', plaats:'Dessel', land:'BE', beschrijving:'Indoor ruimte'}
  ],
  themas:[
    {naam:'Start', beschrijving:'Basisvaardigheden'},
    {naam:'Gehoorzaamheid', beschrijving:'Luisteren en volgen'},
    {naam:'Socialisatie', beschrijving:'Met andere honden en mensen'},
    {naam:'Agility', beschrijving:'Behendigheid en sport'}
  ],
  trainers:[
    {naam:'Sofie', functie:'Coach'},
    {naam:'Jan', functie:'Hoofdtrainer'},
    {naam:'Lotte', functie:'Assistent'}
  ]
};
function row(cells){return `<tr>${cells.map(c=>`<td>${c}</td>`).join('')}</tr>`}
function fill(){
  document.querySelector('#tbl-namen').innerHTML = EX.namen.map(n=>row([
    n.naam,n.prijs,n.strippen,n.max,n.lesduur,n.mailblue,n.geldigheid,
    `<div class="actions"><button class="iconbtn">✏️</button><button class="iconbtn">💾</button><button class="iconbtn">🗑️</button></div>`
  ])).join('');
  document.querySelector('#tbl-types').innerHTML = EX.types.map(t=>row([
    t.type,t.beschrijving,`<div class="actions"><button class="iconbtn">✏️</button><button class="iconbtn">💾</button><button class="iconbtn">🗑️</button></div>`
  ])).join('');
  document.querySelector('#tbl-locaties').innerHTML = EX.locaties.map(l=>row([
    l.naam,l.adres,l.plaats,l.land,l.beschrijving,`<div class="actions"><button class="iconbtn">✏️</button><button class="iconbtn">💾</button><button class="iconbtn">🗑️</button></div>`
  ])).join('');
  document.querySelector('#tbl-themas').innerHTML = EX.themas.map(t=>row([
    t.naam,t.beschrijving,`<div class="actions"><button class="iconbtn">✏️</button><button class="iconbtn">💾</button><button class="iconbtn">🗑️</button></div>`
  ])).join('');
  document.querySelector('#tbl-trainers').innerHTML = EX.trainers.map(t=>row([
    t.naam,t.functie,`<div class="actions"><button class="iconbtn">✏️</button><button class="iconbtn">💾</button><button class="iconbtn">🗑️</button></div>`
  ])).join('');
}
window.addEventListener('DOMContentLoaded', fill);