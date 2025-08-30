// UI tabs
document.querySelectorAll(".tabs button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab").forEach(s => s.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// last updated
const ts = new Date();
document.getElementById("lastUpdated").textContent =
  `Laatst geüpdatet: ${ts.toLocaleDateString()} ${ts.toLocaleTimeString()}`;

// Helpers
const $ = sel => document.querySelector(sel);
const api = {
  get: (url) => fetch(url).then(r => r.json()),
  post: (url, data) => fetch(url, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
  }).then(r => r.json()),
  put: (url, data) => fetch(url, {
    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
  }).then(r => r.json())
};

// Registratie: klant + hond
$("#registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.currentTarget);

  // 1) klant
  const customer = await api.post("/api/customers", {
    name: fd.get("customerName"),
    email: fd.get("customerEmail"),
    phone: fd.get("customerPhone")
  });
  if (!customer?.id) return alert("Klant aanmaken mislukt.");

  // 2) hond aan klant
  const dog = await api.post(`/api/dogs/${customer.id}`, {
    name: fd.get("dogName"),
    breed: fd.get("dogBreed"),
    birthDate: fd.get("dogBirthDate"),
    sex: fd.get("dogSex"),
    vaccineStatus: fd.get("vaccineStatus"),
    vetPhone: fd.get("vetPhone"),
    vetName: fd.get("vetName"),
    bookletRef: fd.get("bookletRef"),
    emergencyNumber: fd.get("emergencyNumber")
  });
  if (!dog?.id) return alert("Hond koppelen mislukt.");

  e.currentTarget.reset();
  await loadCustomers();
  await loadDogs();
  alert("Klant + hond geregistreerd!");
});

// Lijsten
async function loadCustomers() {
  const list = await api.get("/api/customers");
  const ul = $("#customersList");
  ul.innerHTML = "";
  list.forEach(c => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${c.name}</strong> — ${c.email || "-"} — ${c.phone || "-"}`;
    ul.appendChild(li);
  });

  // voor honden-filter
  const sel = $("#filterCustomer");
  sel.innerHTML = `<option value="">(alle klanten)</option>` + list.map(c =>
    `<option value="${c.id}">${c.name}</option>`).join("");
}

async function loadDogs() {
  const cid = $("#filterCustomer").value;
  const url = cid ? `/api/dogs?customerId=${cid}` : "/api/dogs";
  const list = await api.get(url);
  const ul = $("#dogsList");
  ul.innerHTML = "";
  list.forEach(d => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${d.name}</strong> (${d.breed || "onbekend"}) — eigenaar #${d.ownerId}`;
    ul.appendChild(li);
  });
}

// Instellingen
async function loadSettings() {
  const s = await api.get("/api/settings");
  const form = $("#settingsForm");
  form.org.value = s.org || "";
  form.email.value = s.email || "";
  form.phone.value = s.phone || "";
  form.website.value = s.website || "";
  form.primaryColor.value = (s.branding?.primaryColor || "#0088cc");
}

$("#settingsForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.currentTarget;
  const patch = {
    org: f.org.value,
    email: f.email.value,
    phone: f.phone.value,
    website: f.website.value,
    branding: { primaryColor: f.primaryColor.value }
  };
  await api.put("/api/settings", patch);
  alert("Instellingen bewaard");
});

// Buttons / filters
$("#reloadCustomers").addEventListener("click", loadCustomers);
$("#reloadDogs").addEventListener("click", loadDogs);
$("#filterCustomer").addEventListener("change", loadDogs);

// init
loadCustomers();
loadDogs();
loadSettings();
