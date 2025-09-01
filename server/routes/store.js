// server/routes/store.js
// ESM module

/* ===========================
   In-memory data (dummy)
   =========================== */
export const customers = [
  { id: 1, name: "Paul Thijs",  email: "paul@example.com",  phone: "0476123456" },
  { id: 2, name: "Sofie Thijs", email: "sofie@example.com", phone: "0476987654" }
];

export const dogs = [
  { id: 1, ownerId: 1, name: "Diva",  breed: "Dobermann",      birthdate: "2023-05-10", sex: "F" },
  { id: 2, ownerId: 2, name: "Rocky", breed: "Border Collie",  birthdate: "2023-11-02", sex: "M" }
];

export const passes = [
  { id: 1, dogId: 1, type: "Puppycursus", total: 9, remaining: 9 }, // Diva
  { id: 2, dogId: 2, type: "Pubercursus", total: 5, remaining: 5 }  // Rocky
];

export const lessons = [];   // later te vullen (lesmomenten)
export const bookings = [];  // later te vullen (inschrijvingen)

/* ===========================
   Helpers (CRUD-achtig)
   =========================== */
function nextId(arr) {
  return arr.length ? Math.max(...arr.map(x => Number(x.id))) + 1 : 1;
}

// ---- Customers ----
export function addCustomer({ name, email = "", phone = "" }) {
  if (!name) throw new Error("name is required");
  const id = nextId(customers);
  const c = { id, name, email, phone };
  customers.push(c);
  return c;
}

export function findCustomerById(id) {
  return customers.find(c => c.id === Number(id));
}

// ---- Dogs ----
export function addDog({ ownerId, name, breed = "", birthdate = "", sex = "" }) {
  if (!ownerId) throw new Error("ownerId is required");
  if (!name) throw new Error("name is required");
  const owner = findCustomerById(ownerId);
  if (!owner) throw new Error("owner (customer) not found");

  const id = nextId(dogs);
  const d = { id, ownerId: Number(ownerId), name, breed, birthdate, sex };
  dogs.push(d);
  return d;
}

export function findDogById(id) {
  return dogs.find(d => d.id === Number(id));
}

// ---- Passes (strippenkaarten) ----
export function addPass({ dogId, type, total }) {
  if (!dogId) throw new Error("dogId is required");
  if (!type)  throw new Error("type is required");
  if (!total && total !== 0) throw new Error("total is required");

  const dog = findDogById(dogId);
  if (!dog) throw new Error("dog not found");

  const id = nextId(passes);
  const p = { id, dogId: Number(dogId), type: String(type), total: Number(total), remaining: Number(total) };
  passes.push(p);
  return p;
}

export function findPassById(id) {
  return passes.find(p => p.id === Number(id));
}

/** Gebruik 1 strip van een kaart */
export function useStrip(passId) {
  const pass = findPassById(passId);
  if (!pass) throw new Error("Strippenkaart niet gevonden");
  if (pass.remaining <= 0) throw new Error("Geen strippen meer beschikbaar");
  pass.remaining -= 1;
  return pass;
}

/* ===========================
   Kleine zoekhelpers
   =========================== */
export function searchAll(qRaw) {
  const q = (qRaw ?? "").toString().toLowerCase().trim();
  if (!q) return { customers: [], dogs: [], passes: [] };

  const cust = customers.filter(c =>
    [c.name, c.email, c.phone].filter(Boolean).join(" ").toLowerCase().includes(q)
  );

  const dogz = dogs.filter(d =>
    [d.name, d.breed].filter(Boolean).join(" ").toLowerCase().includes(q)
  );

  const passz = passes.filter(p => {
    const dog = dogs.find(d => d.id === p.dogId);
    const hay = [p.type, dog?.name].filter(Boolean).join(" ").toLowerCase();
    return hay.includes(q);
  });

  return { customers: cust, dogs: dogz, passes: passz };
}
