// public/app.js
// Basis frontend-logica voor Superhond

// 🔹 Helper: JSON ophalen
async function apiGet(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fout bij GET ${url}: ${res.status}`);
  return res.json();
}

// 🔹 Helper: JSON posten
async function apiPost(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`Fout bij POST ${url}: ${res.status}`);
  return res.json();
}

// 🔹 Init: toon klantenlijst
async function loadCustomers() {
  const list = document.getElementById("customerList");
  list.innerHTML = "<li>Laden...</li>";

  try {
    const customers = await apiGet("/api/customers");
    if (customers.length === 0) {
      list.innerHTML = "<li>Geen klanten gevonden.</li>";
      return;
    }

    list.innerHTML = "";
    customers.forEach(c => {
      const li = document.createElement("li");
      li.textContent = `${c.name} (${c.email})`;
      li.addEventListener("click", () => showCustomer(c.id));
      list.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    list.innerHTML = "<li>Fout bij laden klanten.</li>";
  }
}

// 🔹 Toon details van één klant + honden
async function showCustomer(id) {
  const details = document.getElementById("customerDetails");
  details.innerHTML = "Details laden...";

  try {
    const customer = await apiGet(`/api/customers/${id}`);
    const dogs = await apiGet(`/api/dogs?customerId=${id}`);
    const passes = await apiGet(`/api/passes?customerId=${id}`);

    details.innerHTML = `
      <h3>${customer.name}</h3>
      <p>Email: ${customer.email}</p>
      <p>Telefoon: ${customer.phone || "-"}</p>

      <h4>Honden</h4>
      <ul>
        ${dogs.map(d => `<li>${d.name} (${d.breed || "onbekend"})</li>`).join("")}
      </ul>

      <h4>Strippenkaarten</h4>
      <ul>
        ${passes.map(p => 
          `<li>${p.lessonType}: ${p.used}/${p.total} gebruikt</li>`
        ).join("")}
      </ul>
    `;
  } catch (err) {
    console.error(err);
    details.innerHTML = "Kon klantgegevens niet laden.";
  }
}

// Start bij laden van de pagina
document.addEventListener("DOMContentLoaded", () => {
  loadCustomers();
});
