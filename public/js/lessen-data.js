const EX = {
  namen:[{naam:'Puppy Pack', prijs:'€149', strippen:9, max:12, lesduur:'60', mailblue:'MB-PPACK', geldigheid:'12 weken'}],
  types:[{type:'Groep', beschrijving:'Les in kleine groep'}],
  locaties:[{naam:'Retie Terrein', adres:'Kerkhofstraat 1', plaats:'Retie', land:'BE', beschrijving:'Buitenterrein'}],
  themas:[{naam:'Start', beschrijving:'Basisvaardigheden'}],
  trainers:[{naam:'Sofie', functie:'Coach'}]
};
function row(cells){return `<tr>${cells.map(c=>`<td>${c}</td>`).join('')}</tr>`}
function fill(){
  // Namen
  document.querySelector('#tbl-namen').innerHTML = EX.namen.map(n=>row([
    n.naam,n.prijs,n.strippen,n.max,n.lesduur,n.mailblue,n.geldigheid,
    `<div class="actions"><button class="iconbtn">✏️</button><button class="iconbtn">💾</button><button class="iconbtn">🗑️</button></div>`
  ])).join('');
  // Types
  document.querySelector('#tbl-types').innerHTML = EX.types.map(t=>row([
    t.type,t.beschrijving,`<div class="actions"><button class="iconbtn">✏️</button><button class="iconbtn">💾</button><button class="iconbtn">🗑️</button></div>`
  ])).join('');
  // Locaties
  document.querySelector('#tbl-locaties').innerHTML = EX.locaties.map(l=>row([
    l.naam,l.adres,l.plaats,l.land,l.beschrijving,`<div class="actions"><button class="iconbtn">✏️</button><button class="iconbtn">💾</button><button class="iconbtn">🗑️</button></div>`
  ])).join('');
  // Themas
  document.querySelector('#tbl-themas').innerHTML = EX.themas.map(t=>row([
    t.naam,t.beschrijving,`<div class="actions"><button class="iconbtn">✏️</button><button class="iconbtn">💾</button><button class="iconbtn">🗑️</button></div>`
  ])).join('');
  // Trainers
  document.querySelector('#tbl-trainers').innerHTML = EX.trainers.map(t=>row([
    t.naam,t.functie,`<div class="actions"><button class="iconbtn">✏️</button><button class="iconbtn">💾</button><button class="iconbtn">🗑️</button></div>`
  ])).join('');
}
window.addEventListener('DOMContentLoaded', fill);