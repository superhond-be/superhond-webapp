// === STRIPPENKAART BEHEER ===

// Elementen
const passesBox = document.getElementById("passesBox");
const passesList = document.getElementById("passesList");
const addPassBtn = document.getElementById("addPassBtn");

// Huidige klant/hond selectie (stel deze variabelen in bij klant/hond selectie)
let currentCustomerId = null;
let currentDogId = null;

// Functie: laad alle strippenkaarten voor huidige klant/hond
async function loadPasses() {
  if (!currentCustomerId || !currentDogId) {
    passesList.innerHTML = `<p class="muted">⚠️ Kies eerst klant en hond.</p>`;
    return;
  }

  const res = await fetch(`/api/passes?customerId=${currentCustomerId}&dogId=${currentDogId}`);
  const data = await res.json();

  if (!data.length) {
    passesList.innerHTML = `<p>Geen strippenkaarten gevonden.</p>`;
    return;
  }

  passesList.innerHTML = data
    .map(
      p => `
      <div class="card">
        <p><b>${p.typeCode}</b> – ${p.usedStrips}/${p.totalStrips} gebruikt</p>
        <button class="btn consume-btn" data-id="${p.id}">➖ 1 strip</button>
      </div>
    `
    )
    .join("");

  // Knoppen koppelen
  document.querySelectorAll(".consume-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const r = await fetch(`/api/passes/${id}/consume`, { method: "POST" });
      if (r.ok) {
        loadPasses();
      } else {
        const err = await r.json();
        alert("Fout: " + err.error);
      }
    });
  });
}

// Nieuwe strippenkaart toevoegen
addPassBtn?.addEventListener("click", async () => {
  if (!currentCustomerId || !currentDogId) {
    alert("⚠️ Kies eerst klant en hond");
    return;
  }
  const typeCode = prompt("Geef het type in (PUPPY / PUBER / GEV):");
  if (!typeCode) return;

  const res = await fetch("/api/passes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customerId: currentCustomerId, dogId: currentDogId, typeCode })
  });

  if (res.ok) {
    loadPasses();
  } else {
    const err = await res.json();
    alert("Fout: " + err.error);
  }
});
