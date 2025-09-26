// honden.js - beheert hondenlijst

async function loadHonden() {
  try {
    const res = await fetch('/data/honden.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const honden = await res.json();

    const list = document.querySelector('#honden-tabel tbody');
    list.innerHTML = '';

    honden.forEach(h => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${h.naam}</td>
        <td>${h.ras}</td>
        <td>${h.geboortedatum}</td>
        <td>${h.chipnummer || '-'}</td>
        <td>${h.eigenaarId}</td>
      `;
      list.appendChild(tr);
    });
  } catch (err) {
    console.error('Fout bij laden honden:', err);
    document.querySelector('#honden-tabel tbody').innerHTML =
      `<tr><td colspan="5">❌ Kon honden niet laden</td></tr>`;
  }
}

// start direct bij laden pagina
document.addEventListener('DOMContentLoaded', loadHonden);
