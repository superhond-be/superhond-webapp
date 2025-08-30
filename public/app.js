async function registerCustomerAndDog() {
  const payload = {
    customer: {
      name: document.querySelector("#cust_name").value,
      email: document.querySelector("#cust_email").value,
      phone: document.querySelector("#cust_phone").value
    },
    dog: {
      name: document.querySelector("#dog_name").value,
      breed: document.querySelector("#dog_breed").value,
      birthDate: document.querySelector("#dog_birth").value,
      gender: document.querySelector("#dog_gender").value,
      vaccStatus: document.querySelector("#dog_vacc").value,
      vetPhone: document.querySelector("#dog_vet_phone").value,
      vetName: document.querySelector("#dog_vet_name").value,
      emergencyPhone: document.querySelector("#dog_emergency").value,
      vaccineBookRef: document.querySelector("#dog_book").value
    }
  };

  const r = await fetch("/api/customers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    alert("Opslaan mislukt: " + (err.error || r.statusText));
    return;
  }

async function testStrippenkaart() {
  // Maak strippenkaart voor klantId 1
  let res = await fetch("/api/passes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customerId: 1, totalStrips: 5 })
  });
  let pass = await res.json();
  console.log("Nieuwe strippenkaart:", pass);

  // Gebruik 1 strip
  res = await fetch(`/api/passes/${pass.id}/use`, { method: "POST" });
  pass = await res.json();
  console.log("Na 1 strip gebruiken:", pass);

  // Ophalen alle passes
  res = await fetch("/api/passes");
  let all = await res.json();
  console.log("Alle strippenkaarten:", all);
}
// === STRIPPENKAART FUNCTIES ===
async function laadPasses() {
  const res = await fetch("/api/passes");
  const passes = await res.json();

  const overzichtDiv = document.getElementById("overzichtContent");
  overzichtDiv.innerHTML = "<h2>Strippenkaart overzicht</h2>";

  passes.forEach(pass => {
    const klantDiv = document.createElement("div");
    klantDiv.className = "klant-card";

    klantDiv.innerHTML = `
      <p><strong>${pass.customerName}</strong> (${pass.customerEmail})</p>
      <p>Strips over: <span id="strips-${pass.id}">${pass.remaining}</span></p>
      <button onclick="gebruikStrip(${pass.id})">Gebruik strip</button>
      <button onclick="voegStripToe(${pass.id})">+1 strip</button>
      <hr>
    `;

    overzichtDiv.appendChild(klantDiv);
  });
}

async function gebruikStrip(passId) {
  await fetch(`/api/passes/${passId}/use`, { method: "POST" });
  laadPasses(); // opnieuw laden
}

async function voegStripToe(passId) {
  await fetch(`/api/passes/${passId}/add`, { method: "POST" });
  laadPasses(); // opnieuw laden
}
testStrippenkaart();
  
  await refreshCustomersList(); // je bestaande lijst-herlaad functie
}
