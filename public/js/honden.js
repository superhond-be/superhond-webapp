async function laadHonden() {
  const status = document.getElementById("hondenStatus");
  const tabelBody = document.querySelector("#honden-tabel tbody");

  try {
    const res = await fetch("../data/honden.json");
    if (!res.ok) throw new Error("Kon honden.json niet laden");

    const honden = await res.json();
    tabelBody.innerHTML = "";

    honden.forEach(hond => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${hond.naam}</td>
        <td>${hond.ras}</td>
        <td>${hond.geboortedatum}</td>
        <td>${hond.eigenaar}</td>
        <td>
          <button class="btn">✏️</button>
          <button class="btn">🗑️</button>
        </td>
      `;
      tabelBody.appendChild(tr);
    });

    status.textContent = `${honden.length} honden geladen`;
  } catch (err) {
    status.textContent = "❌ Fout bij laden honden";
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", laadHonden);
