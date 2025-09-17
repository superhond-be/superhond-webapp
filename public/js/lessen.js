async function fetchJSON(url, opts={}){
  const r = await fetch(url, {headers:{'Content-Type':'application/json'}, ...opts});
  return r.json();
}
function row(cells){return `<tr>${cells.map(c=>`<td>${c}</td>`).join('')}</tr>`}

async function loadAll(){
  const [namen, types, locaties, themas, trainers] = await Promise.all([
    fetchJSON('/api/namen'), fetchJSON('/api/types'), fetchJSON('/api/locaties'),
    fetchJSON('/api/themas'), fetchJSON('/api/trainers')
  ]);
  // Namen
  const nbody = document.querySelector('#tbl-namen');
  nbody.innerHTML = namen.map(n=>row([
    n.naam, `€${n.prijs}`, n.strippen, n.max, n.lesduur, n.mailblue, n.geldigheid,
    `<div class="actions"><button class="iconbtn">✏️</button><button class="iconbtn">💾</button><button class="iconbtn">🗑️</button></div>`
  ])).join('');
  // Types
  document.querySelector('#tbl-types').innerHTML = types.map(t=>row([
    t.type, t.beschrijving, `<div class="actions"><button class="iconbtn">✏️</button><button class="iconbtn">💾</button><button class="iconbtn">🗑️</button></div>`
  ])).join('');
  // Locaties
  document.querySelector('#tbl-locaties').innerHTML = locaties.map(l=>row([
    l.naam, l.adres, l.plaats, l.land, l.beschrijving,
    `<div class="actions"><button class="iconbtn">✏️</button><button class="iconbtn">💾</button><button class="iconbtn">🗑️</button></div>`
  ])).join('');
  // Themas
  document.querySelector('#tbl-themas').innerHTML = themas.map(t=>row([
    t.naam, t.beschrijving,
    `<div class="actions"><button class="iconbtn">✏️</button><button class="iconbtn">💾</button><button class="iconbtn">🗑️</button></div>`
  ])).join('');
  // Trainers
  document.querySelector('#tbl-trainers').innerHTML = trainers.map(t=>row([
    t.naam, t.functie,
    `<div class="actions"><button class="iconbtn">✏️</button><button class="iconbtn">💾</button><button class="iconbtn">🗑️</button></div>`
  ])).join('');
}
window.addEventListener('DOMContentLoaded', loadAll);