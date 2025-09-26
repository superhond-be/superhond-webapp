// klanten.js - beheert klantenlijst

async function loadKlanten() {
  try {
    const res = await fetch('/data/klanten.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const klanten = await res.json();

    const list = document.querySelector('#klanten-tabel tbody');
    list.innerHTML = '';

    klanten.forEach(k => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${k.voornaam} ${k.achternaam}</td>
        <td>${k.email}</td>
        <td>${k.plaats}</td>
        <td>${k.land}</td>
        <td>${k.telefoon}</td>
        <td>${k.opmerkingen || ''}</td>
      `;
      list.appendChild(tr);
    });
  } catch (err) {
    console.error('Fout bij laden klanten:', err);
    document.querySelector('#klanten-tabel tbody').innerHTML =
      `<tr><td colspan="6">❌ Kon klanten niet laden</td></tr>`;
  }
}

// start direct bij laden pagina
document.addEventListener('DOMContentLoaded', loadKlanten);
