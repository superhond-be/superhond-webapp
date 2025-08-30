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

  await refreshCustomersList(); // je bestaande lijst-herlaad functie
}
